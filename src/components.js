

const NavBar = {
	render: (customClass = "") => {
		return `
      <nav class="mainmenu ${customClass}" id="mainmenu">
        <ul class="header__list">
          <li><a class="mainmenu__link" href="#main">HOME</a></li>
          <li><a class="mute" id="mute">MUTE</a></li>
        </ul>
      </nav>
    `;
	}
};

const Content = {
	render: (customClass = "") => {
		return `<div class="content ${customClass}" id="content"></div>`;
	}
};


const Footer = {
	render: (customClass = "") => {
		return `<footer class="footer ${customClass}">
      <p>&copy; 2022 Klenovski Vladislav Bomberman Project</p>
    </footer>`;
	}
};
