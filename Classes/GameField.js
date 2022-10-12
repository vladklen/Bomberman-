class GameField {
	constructor() {
		this.field = null;
		this.timer = null;
		this.explosionTimer = null;
		this.deathTimer = false;
		this.deathEvent = false;
		this.playerReborn = false;
		this.enemy = [];
	}
	reset() {
		this.grid = this.getEmptyField();
	}

	//создаем массив поля, 1 - неразрушаемый блок, 0 - пустой блок.
	getEmptyField() {
		return this.field = Array.from({ length: ROWS }, () => Array(COLS).fill(0)).map((el, i) => (i === 0 || i === ROWS - 1 ? el.map((elem, i) => (1)) : el.map((elem, index) => (index === 1 ? 0.5 : index % 2 !== 0 ? 0 : index === 0 || index === COLS - 1 ? 1 : i % 2 ? 0 : 1))));
	};


	//устанваливаем типы и создаем рандомные кирпичные блоки
	generateLevel() {
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				if (this.field[row][col] === types.wall) {
					let wallX = col * BLOCK_SIZE;
					let wallY = row * BLOCK_SIZE;
					this.field[row][col] = {
						x: wallX,
						y: wallY,
						types: types.wall,
					}

				} else if (this.field[row][col] === types.alwaysFree) {
					let wallX = col * BLOCK_SIZE;
					let wallY = row * BLOCK_SIZE;
					this.field[row][col] = {
						x: wallX,
						y: wallY,
						types: types.alwaysFree,
					}
				} else if (this.field[row][col] === 0 && Math.random() < brickCoefficient) {
					let wallX = col * BLOCK_SIZE;
					let wallY = row * BLOCK_SIZE;
					this.field[row][col] = {
						x: wallX,
						y: wallY,
						types: types.brick,
					}
				} else if (this.field[row][col] === 0) {
					let wallX = col * BLOCK_SIZE;
					let wallY = row * BLOCK_SIZE;
					this.field[row][col] = {
						x: wallX,
						y: wallY,
						types: types.free,
					}
				} else {
					let wallX = col * BLOCK_SIZE;
					let wallY = row * BLOCK_SIZE;
					this.field[row][col] = {
						x: wallX,
						y: wallY,
						types: types.free,
					}
				}
			};
		}
	}


	//Рендерим уровень
	renderLevel(ctx, hardBlock, brick, playerIcon, enemy, newBomb, dt) {
		ctx.fillStyle = fieldColor;
		ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const cell = this.field[row][col];
				if (cell.types === types.wall) {
					hardBlock.render(cell.x, cell.y);
				} else if (cell.types === types.brick) {
					brick.render(cell.x, cell.y);
				} else if (cell.types === types.bomb) {
					newBomb.active = true;
					newBomb.update(cell.x, cell.y, dt);
				}
			}
		}
		//определения взрыва
		if (this.timer) {
			this.timer -= dt;
			if (this.timer <= 0) {
				this.explosionTimer = 300;
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						if (this.field[row][col].types === types.bomb) {
							this.field[row][col].types = types.boom;
							for (let i = 1; i <= explosionRange; i++) {
								if (this.field[row][col + i].types === types.brick || this.field[row][col + i].types === types.free || this.field[row][col + i].types === types.alwaysFree) {
									this.field[row][col + i].types = types.boomX;
								};
								if (this.field[row][col - i].types === types.brick || this.field[row][col - i].types === types.free || this.field[row][col - i].types === types.alwaysFree) {
									this.field[row][col - i].types = types.boomX;
								};
								if (this.field[row + i][col].types === types.brick || this.field[row + i][col].types === types.free || this.field[row + i][col].types === types.alwaysFree) {
									this.field[row + i][col].types = types.boomY;
								};
								if (this.field[row - i][col].types === types.brick || this.field[row - i][col].types === types.free || this.field[row - i][col].types === types.alwaysFree) {
									this.field[row - i][col].types = types.boomY;
								};
							};
						}
					}
				}
				this.timer = null;
			}
		}

		//рендерим плеера и врагов
		if (!this.playerReborn) {
			playerIcon.update();
		} else {
			playerIcon.reborn();
		}
		enemy.forEach(elem => elem.render());
		//анимация взрыва
		if (this.explosionTimer) {
			this.explosionTimer -= dt;
			if (this.explosionTimer >= 0) {
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (cell.types === types.boom) {
							newBomb.boom(cell.x, cell.y, 0);
						} else if (cell.types === types.boomX) {
							newBomb.boom(cell.x, cell.y, 1);
						} else if (cell.types === types.boomY) {
							newBomb.boom(cell.x, cell.y, 2);
						};
					}
				}
			} else {
				this.explosionTimer = null;
				newBomb.bombExplosion.play();
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (cell.types === types.boom || cell.types === types.boomX || cell.types === types.boomY) {
							cell.types = types.free;
						}
					}
				}
			}
		}
	}

	//анимация смерти врагов
	deathAnimation(elem, i) {
		let that = this;
		if (this.deathTimer && this.deathEvent) {
			let counter = 0;
			function spriteAnimation(elem) {
				elem.death(counter);
				counter++;
				if (counter === 4) {
					that.deathTimer = false;
					that.deathEvent = false;
					if (elem.looseLive) {
						elem.looseLive();
						that.playerReborn = false;
					} else {
						score += 100;
						that.enemy.splice(i, 1);
					};
					clearInterval(timerID)
				}
			}
			let timerID = setInterval(spriteAnimation, 150, elem);
		}
	}

	//Установка бомбы и отрисовка:
	plantBomb(elem, newBomb) {
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const cell = this.field[row][col]; // перебираемая ячейка
				if (elem.move.direcetion === "right") {
					if (
						(elem.position.x + BLOCK_SIZE >= cell.x && elem.position.x <= cell.x && cell.x > elem.position.x)
						&& (elem.position.y === cell.y)
						&& (cell.types === types.free || cell.types === types.alwaysFree)
						&& ((newBomb.active == false))) {
						this.timer = newBomb.timer;
						newBomb.render(cell.x, cell.y);
						elem.position.x = cell.x - BLOCK_SIZE;
						cell.types = types.bomb;
					}
				}
				if (elem.move.direcetion === "left") {
					if (
						(elem.position.x - BLOCK_SIZE <= cell.x && elem.position.x >= cell.x && cell.x < elem.position.x)
						&& (elem.position.y === cell.y)
						&& (cell.types === types.free || cell.types === types.alwaysFree)
						&& ((newBomb.active == false))) {
						this.timer = newBomb.timer;
						newBomb.render(cell.x, cell.y);
						elem.position.x = cell.x + BLOCK_SIZE;
						cell.types = types.bomb;
					}
				}
				if (elem.move.direcetion === "top") {
					if (
						(elem.position.y - BLOCK_SIZE <= cell.y && elem.position.y >= cell.y && cell.y < elem.position.y)
						&& (elem.position.x === cell.x)
						&& (cell.types === types.free || cell.types === types.alwaysFree)
						&& ((newBomb.active == false))) {
						this.timer = newBomb.timer;
						newBomb.render(cell.x, cell.y);
						elem.position.y = cell.y + BLOCK_SIZE;
						cell.types = types.bomb;
					}
				}
				if (elem.move.direcetion === "bot") {
					if (
						(elem.position.y + BLOCK_SIZE >= cell.y && elem.position.y <= cell.y && cell.y > elem.position.y)
						&& (elem.position.x === cell.x)
						&& (cell.types === types.free || cell.types === types.alwaysFree)
						&& ((newBomb.active == false))) {
						this.timer = newBomb.timer;
						newBomb.render(cell.x, cell.y);
						elem.position.y = cell.y - BLOCK_SIZE;
						cell.types = types.bomb;
					}
				}
			}
		}
	};

	//обработка столкновений и движения
	collisionCheck(elem) {
		if (!this.deathTimer) {
			if (elem.move.direcetion === "right") {  //идем вправо
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (
							(cell.x > elem.position.x && cell.x <= elem.position.x + BLOCK_SIZE)
							&& (elem.position.y + 10 >= cell.y && elem.position.y - 10 <= cell.y)
							&& (cell.types === 0 || cell.types === 0.5)) {
							if (!elem.move.x) {
								elem.position.x += 2;
								elem.position.y = cell.y;
							} else {
								elem.move.x = 1;
							}
						} else {
							elem.position.x += 0;
						}
					}
				}
			}
			else if (elem.move.direcetion === "left") { //идем влево
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (
							(cell.x < elem.position.x && cell.x >= elem.position.x - BLOCK_SIZE)
							&& (elem.position.y + 10 >= cell.y && elem.position.y - 10 <= cell.y)
							&& (cell.types === 0 || cell.types === 0.5)) {
							if (!elem.move.x) {
								elem.position.x -= 2;
								elem.position.y = cell.y;
							} else {
								elem.move.x = -1;
							}
						} else {
							elem.position.x += 0;
						}
					}
				}
			}
			else if (elem.move.direcetion === "bot") { //идем вниз
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (
							(cell.y > elem.position.y && cell.y <= elem.position.y + BLOCK_SIZE)
							&& (elem.position.x + 10 >= cell.x && elem.position.x - 10 <= cell.x)
							&& (cell.types === types.free || cell.types === types.alwaysFree)) {
							if (!elem.move.y) {
								elem.position.y += 2;
								elem.position.x = cell.x;
							} else {
								elem.move.y = 1;
							}
						} else {
							elem.position.y += 0;
						}
					}
				}
			}
			else if (elem.move.direcetion === "top") { //идем вверх
				for (let row = 0; row < ROWS; row++) {
					for (let col = 0; col < COLS; col++) {
						const cell = this.field[row][col];
						if (
							(cell.y < elem.position.y && cell.y >= elem.position.y - BLOCK_SIZE)
							&& (elem.position.x + 10 >= cell.x && elem.position.x - 10 <= cell.x)
							&& (cell.types === types.free || cell.types === types.alwaysFree)) {
							if (!elem.move.y) {
								elem.position.y -= 2;
								elem.position.x = cell.x;
							} else {
								elem.move.y = -1;
							}
						} else {
							elem.position.y += 0;
						}
					}
				}
			}
			else {
				elem.position.x += 0;
				elem.position.y += 0;
			}
		}
	};
	//обработка столкновения с врагами
	collisionPlayerEnemy(enemy, player) {
		if (!this.deathEvent) {
			for (let row = 0; row < ROWS; row++) { // слева от моба, справа от моба, сверху от моба, 
				for (let col = 0; col < COLS; col++) {
					if (((player.position.x + BLOCK_SIZE > enemy.position.x && player.position.x < enemy.position.x + BLOCK_SIZE) && (enemy.position.y === player.position.y)) || (player.position.x < enemy.position.x + BLOCK_SIZE && player.position.x > enemy.position.x && enemy.position.y === player.position.y) || (player.position.y + BLOCK_SIZE > enemy.position.y && player.position.y < enemy.position.y && player.position.x === enemy.position.x) || (player.position.y > enemy.position.y && player.position.y < enemy.position.y + BLOCK_SIZE && player.position.x === enemy.position.x)) {
						if (!this.deathEvent) {
							this.deathTimer = true;
							this.deathEvent = true;
							this.playerReborn = true;
							this.deathAnimation(player);
						}
					}
				}
			}
		}
	};

	deathCheck(elem, i) {
		if (!this.deathEvent) {
			for (let row = 0; row < ROWS; row++) {
				for (let col = 0; col < COLS; col++) {
					const cell = this.field[row][col];
					if (cell.types === types.boomX) {
						if ((elem.position.x < (cell.x + BLOCK_SIZE) && elem.position.x >= cell.x) &&
							(elem.position.y === cell.y)) {
							this.deathTimer = true;
							this.deathEvent = true;
							if (elem.looseLive) {
								this.playerReborn = true;
								this.deathAnimation(elem);
							} else {
								this.deathAnimation(elem, i);
							}
						} else if ((elem.position.x <= cell.x && (elem.position.x > cell.x - BLOCK_SIZE)) && (elem.position.y === cell.y)) {
							this.deathTimer = true;
							this.deathEvent = true;
							if (elem.looseLive) {
								this.playerReborn = true;
								this.deathAnimation(elem);
							} else {
								this.deathAnimation(elem, i);
							}
						}
					}
					else if (cell.types === types.boomY) {
						if ((elem.position.y <= cell.y && elem.position.y > cell.y - BLOCK_SIZE) && (elem.position.x === cell.x)) {
							this.deathTimer = true;
							this.deathEvent = true;
							if (elem.looseLive) {
								this.playerReborn = true;
								this.deathAnimation(elem);
							} else {
								this.deathAnimation(elem, i);
							}
						} else if ((elem.position.y >= cell.y && elem.position.y < cell.y + BLOCK_SIZE) && (elem.position.x === cell.x)) {
							this.deathTimer = true;
							this.deathEvent = true;
							if (elem.looseLive) {
								this.playerReborn = true;
								this.deathAnimation(elem);
							} else {
								this.deathAnimation(elem, i);
							}
						}
					};
				};
			};
		};
	};
};
