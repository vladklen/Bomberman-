class Enemy {
	constructor(options) {
		this.ctx = options.ctx;
		this.image = options.image;
		this.deathImage = options.deathImage;
		this.position = options.position;
		this.move = options.move
		this.width = options.width;
		this.height = options.height;
		this.frame = options.frame;
		this.frameNumbers = options.frameNumbers;
		this.dieAudio = options.dieAudio;
	}
	render() {
		this.ctx.drawImage(
			this.image,
			16 * this.frame,
			0,
			16,
			16,
			this.position.x += this.move.x,
			this.position.y += this.move.y,
			this.width,
			this.height,
		)
	}
	death(frame) {
		this.dieAudio.play();
		this.move.x = 0;
		this.move.y = 0;
		this.frame = frame;
		this.image = this.deathImage;
	}
}