const HomePage = {
	id: "main",
	title: "HomeScreen",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
			<p>HELLO: ${rest[0]}</p>    
			<ul class="mainmenu__list">
				<li><a class="mainmenu__link" href="#level">START</a></li>
				<li><a class="mainmenu__link" href="#scorelist">TOP</a></li>
				<li><a class="mainmenu__link" href="#rules">RULES</a></li>
	 		</ul>
      </section>
    `;
	}
};

const Level = {
	id: "level",
	title: "Level Number",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
        <h1>STAGE ${rest[0]}</h1>
      </section>
    `;
	}
};

const SignUp = {
	id: "SignUp",
	title: "SignUp Form",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
			<div class="sign-form">
				<h2>Registration</h2>
				<div class="form">
					<p>Enter your NickName:</p>
					<input id="fieldUser" type="text" placeholder="Username" name="un" />
					<p>Enter your Email:</p>
					<input id="fieldEmail" type="email" placeholder="Email@email.com" name="un" />
					<p>Enter your Password:</p>
					<input id="fieldPassword" type="password" placeholder="Password" name="pw" />
					<div id="error" class="error"></div>
					<div class="form__buttons">
					<button id="SignUp"> Sign up </button>
					</div>
				</div>
			</div>
      </section>
	`;
	}
};
const SignIn = {
	id: "SignIn",
	title: "SignIn Form",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
			<div class="sign-form">
				<h2>Login</h2>
				<div class="form">
					<p>Enter your Email:</p>
					<input id="fieldEmail" type="email" placeholder="Email@email.com" name="un" />
					<p>Enter your Password:</p>
					<input id="fieldPassword" type="password" placeholder="Password" name="pw" />
					<div id="error" class="error"></div>
					<div class="form__buttons">
						<button id="SignIn"> Sign in </button>
						<button id="Register"> Register </button>
					</div>
				</div>
			</div>
      </section>
	`;
	}
};

const Score = {
	id: "scoreList",
	title: "Top scores",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
		  <div class="score-list">
			 <h2>Top Players:</h2>
			 <table id="users-list" class = "score-table">
				<thead>
					<tr>
					<th>Place</th>
					<th>NickName</th>
					<th>Score</th>
				  </tr>
				</thead>
				<tbody id="users-list__container"></tbody>
			 </table>
		  </div>
		</div>
	 </div>
      </section>
    `;
	}
};


const GameOver = {
	id: "gameOver",
	title: "Game is Over",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
        <h1>GAME OVER</h1>
		  <h2>Score: ${rest[0]} </h2>
      </section>
    `;
	}
};

const Game = {
	id: "game",
	title: "Game",
	render: (className = "container", ...rest) => {
		return `
		<section class="${className}">
			<div class = "stats">
				<div>
					<p>Enemies:</p>	
					<div id="enemies"></div>
				</div>
				<div>
					<p>Score:</p>	
					<div id ="score"></div>
				</div>
				<div>
					<p>Lives:</p>	
					<div id ="lives"></div>
				</div>
			</div>
		<canvas id="game_container"></canvas>
		</section>
    `;
	}
};

const Rules = {
	id: "rules",
	title: "Ну и страница Контакты, как без нее?",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
        <h1>Rules of the game</h1>
        <p>Use english buttons 'W' 'A' 'S' 'D' to direct Bomberman in any one of the four cardinal directions.</p>
		  <p>Press the 'SPACE' button to drop a bomb on the tile that Bomberman is currently standing on. The bomb will self destruct after a couple of seconds</p>
			<p>You control Bomberman throughout his efforts to climb the 50 floors of the underground plant and reach the surface in order to become human. In order to do this, you must accomplish two things on each floor: You must kill every enemy, and you must reveal the exit which can only be used once every enemy is defeated. In addition to this, every floor contains one power-up that can increase Bomberman's abilities, as well as his chances for survival. Bomberman begins the game with ability to produce one bomb at a time with an explosion range of one square. Power-ups can be collected to increase both the number of bombs he can drop, and the range of the explosions. The touch of an enemy, and being caught in an explosion are both lethal to Bomberman (but he can withstand explosions if he collects the Flamepass power-up). Normally, the bombs detonate on their own a couple of seconds after being dropped, but the Detonator power-up can give Bomberman the useful ability to detonate the bombs on command whenever he chooses. Bomberman's bombs can also detonate one another in chain reactions.
			</p>
      </section>
    `;
	}
};

const ErrorPage = {
	id: "error",
	title: "Achtung, warning, kujdes, attenzione, pozornost...",
	render: (className = "container", ...rest) => {
		return `
      <section class="${className}">
        <h1>Ошибка 404</h1>
        <p>Страница не найдена, попробуйте вернуться на <a href="#main">главную</a>.</p>
      </section>
    `;
	}
};
