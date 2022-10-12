// Список компонент (from components.js)
const components = {
	navbar: NavBar,
	content: Content,
	footer: Footer,
};

// Список поддердживаемых роутов (from pages.js)
const routes = {
	main: HomePage,
	level: Level,
	game: Game,
	signup: SignUp,
	signin: SignIn,
	gameover: GameOver,
	rules: Rules,
	default: HomePage,
	error: ErrorPage,
	scorelist: Score,
};

// -------------------------------------------------------------------------------------------------------------------------

//Основные константы
const COLS = 31;
const ROWS = 13;
const BLOCK_SIZE = 32;
const fieldColor = "rgb(78, 133, 37)";
const explosionRange = 1;
let score = 0;
//Типы элементов в поле.
const types = {
	free: 0,
	alwaysFree: 0.5,
	wall: 1,
	brick: 2,
	bomb: 3,
	boom: 4,
	boomX: 4.1,
	boomY: 4.2,
}
//коэффициент количества блоков на уровне
const brickCoefficient = 0.3





// ___________________________________________________________________________________________________________________________

/* ----- spa init App --- */
const BOMBERMAN = (function () {

	/* ------- begin model ------- */
	function AppModel() {
		let myAppView = null;
		let level = 0;
		const that = this;
		let user = null;

		this.init = function (view) {
			myAppView = view;
		}

		this.updateState = function (pageName) {
			myAppView.renderContent(pageName);
		}

		this.updateLevel = function (pageName, levelUp) {
			level = levelUp;
			myAppView.renderContent(pageName, level);
		}

		this.startGame = function () {
			myAppView.startGame(level);
		}
		this.stopPlayerAnimation = function (direction) {
			myAppView.stopAnimation(direction);
		}

		this.update = function (direction, timestamp) {
			myAppView.updateField(direction, timestamp);
		}
		this.muteAllSound = function () {
			myAppView.mute();
		}

		//двигаем или не двигаем поле в зависимости от вьюпорта
		this.resize = function (width) {
			if (width <= 980) {
				myAppView.mobileSize(width);
			} else {
				myAppView.mobileSize();
			}
		}
		// работа с FireBaze
		this.printScoreList = function () {
			myAppDB.ref("users/").on(
				"value",
				(snapshot) => {
					let list = snapshot.val();
					let array = [];
					for (let el in list) {
						array.push(list[el]);
					}
					let result = array.sort((a, b) => a.score < b.score ? 1 : -1).slice(0, 10);
					myAppView.printUser(result)
				},
				(error) => console.log("Error: " + error.code),
			);
		}
		this.signUp = function (username, useremail, userpassword) {
			if (username && useremail && userpassword) {
				firebase
					.auth()
					.createUserWithEmailAndPassword(useremail, userpassword)
					.then((userCredential) => {
						myAppDB
							.ref("users/" + `user_${username.replace(/\s/g, "").toLowerCase()}`)
							.set({
								username: `${username}`,
								email: `${useremail}`,
								score: 0,
							})
							.then(function () {
								user = username;
								myAppView.loginComplete(user);
								that.updateLevel("main");
							})
							.catch(function (error) {
								console.error("Ошибка добавления пользователя: ", error);
							});
					})
					.catch(function (error) {
						console.log("Error: " + error.message);
						myAppView.loginError(
							"This email is already registered"
						);
					});
			} else {
				myAppView.loginError(
					"Email or Password field is empty. Enter the data in the indicated fields."
				);
			}
		}
		this.updateScore = function (score) {
			let previousScore;
			function getScore() {
				return new Promise(function (resolve) {
					myAppDB
						.ref("users/" + `user_${user.replace(/\s/g, "").toLowerCase()}`)
						.on(
							"value",
							(snapshot) => {
								previousScore = snapshot.val().score;
								resolve(previousScore);
							},
							(error) => console.log("Error: " + error.code),
						)
				});
			};

			if (score) {
				getScore()
					.then(
						function () {
							if (score > previousScore) {
								firebase
									.database()
									.ref("users/" + `user_${user.replace(/\s/g, "").toLowerCase()}`)
									.update({
										score: score,
									});
							}
						})
			}
		}
		this.signIn = function (useremail, userpassword) {
			if (useremail && userpassword) {
				firebase
					.auth()
					.signInWithEmailAndPassword(useremail, userpassword)
					.then((userCredential) => {
						myAppDB
							.ref("users/")
							.once("value")
							.then(function (snapshot) {
								let list = snapshot.val();
								let array = [];
								for (let el in list) {
									array.push(list[el]);
								}
								user = array.find(el => el.email === useremail).username
								myAppView.loginComplete(user);
								that.updateLevel("main");
							})
							.catch(function (error) {
								console.log(error)
								myAppView.loginError(
									"Email or Password field is empty. Enter the data in the indicated fields."
								);
							});

					})
					.catch(function (error) {
						console.log("Error: " + error.message);
						myAppView.loginError(
							"Please check your email and password and try again"
						);
					});
			} else {
				myAppView.loginError(
					"Email or Password field is empty. Enter the data in the indicated fields."
				);
			}
		}
	};
	/* -------- end model -------- */






	/* ------- begin view -------- */
	function AppView() {
		let myAppContainer = null;
		const enemyMoveDirection = ['top', 'bot', 'left', 'right'];
		let contentContainer = null;
		let routesObj = null;
		let level = null;
		let canvas;
		let ctx = null;
		let newBomb;
		let enemy = [];
		let hardBlock;
		let brick;
		let field;
		let player;
		let moveXId;
		let moveYId;
		let moveX = 0;
		let moveY = 3;
		let lives = 3;
		let dt;
		let last;
		let screenWidth;
		let screenWidthFlag = false;
		//тймер на движение врагов
		let enemyTimerId;
		//звуки
		let audio = [];
		let steps = false;
		let mainAudio;
		let levelAudio;
		let gameAudio;
		let stepAudio;
		let bombPlantAudio;
		let bombExplosion;
		let dieAudio;
		let playerDieAudio;
		let gameOverAudio;
		//Спрайты:
		let fieldBlock;
		let playerImg;
		let enemyImg;
		let enemyDeathImg;
		let playerDeathImg;
		let bombImg;
		let explosionImg;
		//FireBaze
		let userName;
		function RandArray(array) {
			let rand = Math.random() * array.length | 0;
			let rValue = array[rand];
			return rValue;
		}

		this.init = function (container, routes) {
			myAppContainer = container;
			routesObj = routes;
			menu = myAppContainer.querySelector("#mainmenu");
			contentContainer = myAppContainer.querySelector("#content");
			//подключаем звуки
			mainAudio = new Audio();
			mainAudio.src = './music/main.mp3';
			levelAudio = new Audio();
			levelAudio.src = './music/level.mp3';
			gameAudio = new Audio();
			gameAudio.src = './music/game.mp3';
			stepAudio = new Audio();
			stepAudio.src = './music/step.mp3';
			bombPlantAudio = new Audio();
			bombPlantAudio.src = './music/plantBomb.mp3';
			bombExplosion = new Audio();
			bombExplosion.src = './music/explosion.mp3';
			dieAudio = new Audio();
			dieAudio.src = './music/die.mp3';
			playerDieAudio = new Audio();
			playerDieAudio.src = './music/playerdie.mp3';
			gameOverAudio = new Audio();
			gameOverAudio.src = './music/gameOver.mp3';
			audio.push(mainAudio, levelAudio, gameAudio, stepAudio, bombPlantAudio, bombExplosion, dieAudio, playerDieAudio, gameOverAudio);
			//подключаем спрайт с блоками
			fieldBlock = new Image(16, 16);
			fieldBlock.src = './img/blocks.png';
			//подключаем спрайт с персонажем
			playerImg = new Image(16, 16);
			playerImg.src = './img/player.png';
			//подключаем спрайт с врагами
			enemyImg = new Image(16, 16);
			enemyImg.src = './img/enemy.png';
			//подключаем спрайт с анимацией смерти врагов
			enemyDeathImg = new Image(16, 16);
			enemyDeathImg.src = './img/enemyDeath.png'
			//подключаем спрайт с анимацией смерти игрока
			playerDeathImg = new Image(16, 16);
			playerDeathImg.src = './img/playerDeath.png'
			//подключаем спрайт с анимацией бомбы
			bombImg = new Image(16, 16);
			bombImg.src = './img/bomb.png'
			//подключаем спрайт с анимацией взрывабомбы
			explosionImg = new Image(16, 16);
			explosionImg.src = './img/explosion.png'
		}


		//FireBaze-----------------------------------
		this.loginError = function (error) {
			myAppContainer.querySelector("#error").innerHTML = `${error}`;
		};

		this.loginComplete = function (user) {
			userName = user;
		}

		this.printUser = function (userList) {
			let userListContainer = document.getElementById("users-list__container");
			let index = 1;
			for (let user in userList) {
				userListContainer.appendChild(createRow(user, userList));
				index++;
			}

			function createRow(user, userList) {
				let row = document.createElement("tr"),
					td1 = document.createElement("td"),
					td2 = document.createElement("td"),
					td3 = document.createElement("td");
				td1.innerHTML = `${index}`;
				td2.innerHTML = `${userList[user].username}`;
				td3.innerHTML = `${userList[user].score}`;
				row.appendChild(td1);
				row.appendChild(td2);
				row.appendChild(td3);
				return row;
			}

		}

		//Звуки

		this.mute = function () {
			audio.forEach(function (elem) {
				elem.muted === true ? elem.muted = false : elem.muted = true;
			});
			const muteButton = document.getElementById("mute");
			muteButton.classList.toggle("muted");
		}

		// для SPA
		this.renderContent = function (hashPageName, lvl) {
			let routeName;
			level = lvl;
			// const URL = `${location.origin}${location.pathname}`;
			if (hashPageName.length > 0) {
				routeName = hashPageName in routes ? hashPageName : "error";
			} else {
				routeName = "main";
			}
			window.document.title = routesObj[routeName].title;
			if (routeName === "level") {
				enemy = [];
				gameAudio.pause();
				mainAudio.pause();
				contentContainer.innerHTML = routesObj[routeName].render(`${routeName}-page`, level);
				clearInterval(enemyTimerId);
				levelAudio.play();
			} else if (routeName === "gameover") {
				clearInterval(enemyTimerId);
				contentContainer.innerHTML = routesObj[routeName].render(`${routeName}-page`, score);
				gameAudio.pause();
				gameOverAudio.play();
			} else if (routeName === "main") {
				contentContainer.innerHTML = routesObj[routeName].render(`${routeName}-page`, userName);
				mainAudio.loop = true;
				mainAudio.play();
				gameAudio.pause();
			} else if (routeName === "game") {
				gameAudio.loop = true;
				gameAudio.play();
				contentContainer.innerHTML = routesObj[routeName].render(`${routeName}-page`);
			}
			else {
				contentContainer.innerHTML = routesObj[routeName].render(`${routeName}-page`);
			}
		}

		// Для маленькой ширины
		this.mobileSize = function (width) {
			if (width) {
				screenWidthFlag = true;
				screenWidth = width;
			} else {
				screenWidthFlag = false;
			}
		}

		this.gameScreenMove = function () {
			if (screenWidthFlag) {
				let plaingField = document.getElementById("game_container");
				let screenCenter = screenWidth / 2;
				if (player.position.x > screenCenter) {
					let difference = player.position.x - screenCenter
					plaingField.style.marginLeft = `${-difference}px`;
				} else {
					plaingField.style.marginLeft = `0px`;
				}
			}
		}

		this.updateScore = function () {
			if (lives >= 0 && document.getElementById("score")) {
				document.getElementById("score").innerHTML = `${score}`;
				document.getElementById("lives").innerHTML = `${lives}`;
				document.getElementById("enemies").innerHTML = `${enemy.length}`;
			}
		}

		this.startGame = function (lvl) {
			level = lvl;
			canvas = document.getElementById("game_container");
			ctx = canvas.getContext('2d');
			ctx.canvas.width = COLS * BLOCK_SIZE;
			ctx.canvas.height = ROWS * BLOCK_SIZE;

			function getRandomInRange(min, max) {
				return Math.ceil(Math.floor((Math.random() * (max - min + 1)) + min) / BLOCK_SIZE) * BLOCK_SIZE;
			};



			newBomb = new Bomb({
				ctx: canvas.getContext('2d'),
				image: bombImg,
				explosion: explosionImg,
				width: BLOCK_SIZE,
				height: BLOCK_SIZE,
				frame: 1,
				frameNumbers: 3,
				bombExplosion: bombExplosion,
				bombPlant: bombPlantAudio,
			});


			level === 1 ? lives = 3 : lives;
			level === 1 ? score = 0 : score;

			player = new Player({
				ctx: canvas.getContext('2d'),
				image: playerImg,
				deathImage: playerDeathImg,
				width: BLOCK_SIZE,
				height: BLOCK_SIZE,
				frame: 3,
				frameHeight: 0,
				lives: lives,
				dieAudio: playerDieAudio,
				position: {
					x: BLOCK_SIZE,
					y: BLOCK_SIZE,
				},
				move: {
					direcetion: "",
				},
			}
			);

			//создаем врагов в зависимости от уровня
			for (let i = 0; i < level; i++) {
				enemy[i] = new Enemy({
					ctx: canvas.getContext('2d'),
					image: enemyImg,
					deathImage: enemyDeathImg,
					width: BLOCK_SIZE,
					height: BLOCK_SIZE,
					frame: 4,
					frameNumbers: 11,
					dieAudio: dieAudio,
					position: {
						x: getRandomInRange(160, 928),
						y: getRandomInRange(32, 352),
					},
					move: {
						direcetion: RandArray(enemyMoveDirection),
						x: 0,
						y: 0,
					},
				}
				);
			}

			//создаем неразрушаемый блок поля
			hardBlock = new FieldBlocks({
				ctx: canvas.getContext('2d'),
				image: fieldBlock,
				width: BLOCK_SIZE,
				height: BLOCK_SIZE,
				frame: 0,
				frameNumbers: 2,
			});

			//создаем кирпичный блок
			brick = new FieldBlocks({
				ctx: canvas.getContext('2d'),
				image: fieldBlock,
				width: BLOCK_SIZE,
				height: BLOCK_SIZE,
				frame: 1,
				frameNumbers: 2,
			})

			field = new GameField();
			field.getEmptyField();
			field.generateLevel();
			field.enemy = enemy;
			field.renderLevel(ctx, hardBlock, brick, player, enemy);
			this.moveEnemies();
		}
		this.animateX = function () {
			if (moveX < 3) {
				player.frame = moveX;
				moveX++
			} else {
				moveX = 0;
			}
		}
		this.animateY = function () {
			if (moveY < 6) {
				player.frame = moveY;
				moveY++
			} else {
				moveY = 3;
			}
		}

		this.stopAnimation = function (move) {
			switch (move) {
				case 'top':
					clearInterval(moveYId);
					moveYId = null;
					player.frame = 4;
					break
				case 'left':
					clearInterval(moveXId);
					moveXId = null;
					player.frame = 1;
					break
				case 'right':
					clearInterval(moveXId);
					moveXId = null;
					player.frame = 1;
					break
				case 'bot':
					clearInterval(moveYId);
					moveYId = null;
					player.frame = 4;
					break
				case ' ':
					keys.space.pressed = false;
					break
			}
		}

		this.playerAnimation = function (move) {
			if (move === "top") {
				player.frameHeight = 1;
				if (!moveYId) {
					player.frame = 3;
					clearInterval(moveXId);
					moveXId = null;
					moveYId = setInterval(this.animateY, 100)
				}
			} else if (move === "bot") {
				player.frameHeight = 0;
				if (!moveYId) {
					player.frame = 3;
					clearInterval(moveXId);
					moveXId = null;
					moveYId = setInterval(this.animateY, 100)
				}
			} else if (move === "left") {
				player.frameHeight = 0;
				if (!moveXId) {
					player.frame = 0;
					clearInterval(moveYId);
					moveYId = null;
					moveXId = setInterval(this.animateX, 100)
				}
			} else if (move === "right") {
				player.frameHeight = 1;
				if (!moveXId) {
					player.frame = 0;
					clearInterval(moveYId);
					moveYId = null;
					moveXId = setInterval(this.animateX, 100)
				}
			}
		}

		//рандомное движение врагов
		this.moveEnemies = function () {
			enemyTimerId = setInterval(() => {
				enemy.forEach(elem => {
					elem.move.direcetion = RandArray(enemyMoveDirection);
				});
			}, 1500);
		}


		this.stepsAudio = function () {
			if (steps) {
				stepAudio.loop = true;
				stepAudio.play();
			} else {
				stepAudio.pause();
			}
		}


		this.updateField = function (move, timestamp) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);


			dt = timestamp - last;
			last = timestamp;

			if (move && move !== "space") {
				steps = true;
				this.playerAnimation(move);
				player.move.direcetion = move;
				field.collisionCheck(player);
			} else if (move === "space") {
				field.plantBomb(player, newBomb);
			} else {
				steps = false;
			};
			this.stepsAudio();

			if (screenWidthFlag) {
				this.gameScreenMove();
			};
			field.renderLevel(ctx, hardBlock, brick, player, enemy, newBomb, dt);
			field.deathCheck(player);
			//рендерим врагов
			enemy.forEach((elem, i) => {
				field.collisionCheck(elem);
				field.collisionPlayerEnemy(elem, player);
				field.deathCheck(elem, i,);
			});
			enemy = field.enemy;
			lives = player.lives;
			this.updateScore();
		};
	};

	/* -------- end view --------- */




	// ---------------------------------------------------------------------------------------------------------------------------



	/* ----- begin controller ---- */
	function AppController() {
		let myAppContainer = null;
		let myAppModel = null;
		let direction;
		let lives;
		let enemies;
		let animId;
		let levelUp = 1;
		let form = null;



		const keys = {
			w: {
				pressed: false
			},
			s: {
				pressed: false
			},
			a: {
				pressed: false
			},
			d: {
				pressed: false
			},
			space: {
				pressed: false
			}
		};
		let lastKey;
		that = this;


		this.init = function (container, model) {
			myAppContainer = container;
			myAppModel = model;


			// вешаем слушателей на событие hashchange и кликам по пунктам меню
			window.addEventListener("hashchange", this.updateState);
			this.updateState("signin"); //первая отрисовка

			myAppContainer.addEventListener("click", function (event) {
				if (event.target && event.target.id === "SignIn") {
					event.preventDefault();
					event.stopPropagation();
					myAppModel.signIn(
						myAppContainer.querySelector("#fieldEmail").value,
						myAppContainer.querySelector("#fieldPassword").value,
					);
				}
				if (event.target && event.target.id === "Register") {
					event.preventDefault();
					event.stopPropagation();
					that.updateState("signup");
				}

				if (event.target && event.target.id === "SignUp") {
					event.preventDefault();
					event.stopPropagation();
					myAppModel.signUp(
						myAppContainer.querySelector("#fieldUser").value,
						myAppContainer.querySelector("#fieldEmail").value,
						myAppContainer.querySelector("#fieldPassword").value,
					);
				}
			})


			const muteButton = document.getElementById("mute");
			muteButton.addEventListener("click", this.mute);
		}

		this.mute = function () {
			myAppModel.muteAllSound();
		}



		this.updateState = function (hashPageName) {
			const URL = `${location.origin}${location.pathname}`;
			if (hashPageName === "signup") {
				window.location = `${URL}#${hashPageName}`;
				myAppModel.updateState(hashPageName);

			}
			if (hashPageName === "signin") {
				window.location = `${URL}#${hashPageName}`;
				myAppModel.updateState(hashPageName);
			}
			else {
				const hashPageName = location.hash.slice(1).toLowerCase();
				if (hashPageName === "signup" && hashPageName === "signin") {
					return
				}
				myAppModel.updateState(hashPageName);
				if (hashPageName !== "game" && animId) {
					window.cancelAnimationFrame(animId);
				}
				if (hashPageName === "level" || enemies === 0) {
					window.location = `${URL}#${"level"}`
					myAppModel.updateLevel("level", levelUp);
					setTimeout(function () {
						enemies = null;
						let newHashPageName = "game";
						window.location = `${URL}#${"game"}`;
						that.reSize();
					}, 3000);

				} else if (hashPageName === "game" && lives === 0) {
					window.location = `${URL}#${"gameover"}`
					myAppModel.updateState("gameover");
					window.cancelAnimationFrame(animId);
					setTimeout(function () {
						let newHashPageName = "main";
						window.location = `${URL}#${newHashPageName}`
						levelUp = 1;
						lives = 3;
					}, 3000);

				} else if (hashPageName === "game") {
					myAppModel.startGame();
					that.Listeners();
					that.playGame();

				} else if (hashPageName === "gameover") {
					myAppModel.updateState(hashPageName);
				} else if (hashPageName === "main") {
					levelUp = 1;
					myAppModel.updateState(hashPageName);
				} else if (hashPageName === "scorelist") {
					myAppModel.updateState(hashPageName);
					myAppModel.printScoreList();
				};
			}

		}

		this.Listeners = function () {
			addEventListener('keydown', ({ key }) => {
				switch (key) {
					case 'w':
						keys.w.pressed = true
						lastKey = "w"
						break
					case 'a':
						keys.a.pressed = true
						lastKey = "a"
						break
					case 'd':
						keys.d.pressed = true
						lastKey = "d"
						break
					case 's':
						keys.s.pressed = true
						lastKey = "s"
						break
					case ' ':
						keys.space.pressed = true
						lastKey = "space"
						break
				}
			})

			addEventListener('keyup', ({ key }) => {
				switch (key) {
					case 'w':
						keys.w.pressed = false;
						myAppModel.stopPlayerAnimation(direction);
						break
					case 'a':
						keys.a.pressed = false;
						myAppModel.stopPlayerAnimation(direction);
						break
					case 'd':
						keys.d.pressed = false;
						myAppModel.stopPlayerAnimation(direction);
						// playerIcon.frame = 1;
						break
					case 's':
						keys.s.pressed = false;
						myAppModel.stopPlayerAnimation(direction);
						break
					case ' ':
						keys.space.pressed = false;
						break
				}
			})
			window.onresize = function () {
				that.reSize();
			};
		}

		this.reSize = function () {
			const windowOuterWidth = window.outerWidth;
			myAppModel.resize(windowOuterWidth);
		}


		this.playGame = function (timestamp) {
			if (keys.w.pressed && lastKey === "w") {
				direction = "top";
			} else if (keys.s.pressed && lastKey === "s") {
				direction = "bot";
			} else if (keys.a.pressed && lastKey === "a") {
				direction = "left";
			} else if (keys.d.pressed && lastKey === "d") {
				direction = "right";
			} else if (keys.space.pressed && lastKey === "space") {
				direction = "space";
			}
			else {
				direction = "";
			}
			myAppModel.update(direction, timestamp);
			//Проверки для перехода на след уровень или GameOver
			if (document.getElementById("lives")) {
				lives = Number(document.getElementById("lives").innerHTML);
			}
			if (lives === 0) {
				score = Number(document.getElementById("score").innerHTML);
				myAppModel.updateScore(score);
				that.updateState();
			}
			if (document.getElementById("enemies")) {
				enemies = Number(document.getElementById("enemies").innerHTML);
			}
			if (enemies === 0) {
				levelUp += 1;
				that.updateState();
			}
			animId = window.requestAnimationFrame(that.playGame);
		};
	};
	/* ------ end controller ----- */



	return {
		init: function ({ container, routes, components }) {
			this.renderComponents(container, components);

			const view = new AppView();
			const model = new AppModel();
			const controller = new AppController();

			//связываем части модуля
			view.init(document.getElementById(container), routes);
			model.init(view);
			controller.init(document.getElementById(container), model);
		},

		renderComponents: function (container, components) {
			const root = document.getElementById(container);
			const componentsList = Object.keys(components);
			for (let item of componentsList) {
				root.innerHTML += components[item].render("component");
			}
		},
	};

}());
/* ------ end app App ----- */




/*** --- init App --- ***/
document.addEventListener("DOMContentLoaded", BOMBERMAN.init({
	container: "app",
	routes: routes,
	components: components
}, false));