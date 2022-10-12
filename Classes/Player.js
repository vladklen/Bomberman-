class Player {
	constructor(options) {
		this.ctx = options.ctx;
		this.image = options.image;
		this.deathImage = options.deathImage;
		this.position = options.position;
		this.move = options.move
		this.width = options.width;
		this.height = options.height;
		this.frame = options.frame;
		this.frameHeight = options.frameHeight;
		this.deathFrame = 0;
		this.lives = options.lives;
		this.dieAudio = options.dieAudio;
	}
	render() {
		this.ctx.drawImage(
			this.image,
			16 * this.frame,
			16 * this.frameHeight,
			16,
			16,
			this.position.x,
			this.position.y,
			this.width,
			this.height,
		)
	}
	death(frame) {
		this.dieAudio.play();
		this.deathFrame = frame;
	}
	reborn() {
		this.ctx.drawImage(
			this.deathImage,
			16 * this.deathFrame,
			0,
			16,
			16,
			this.position.x,
			this.position.y,
			this.width,
			this.height,
		)
	}
	looseLive() {
		this.position.x = BLOCK_SIZE;
		this.position.y = BLOCK_SIZE;
		this.lives -= 1;
	}
	update() {
		this.render();
	}
}