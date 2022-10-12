class Bomb {
	constructor(options) {
		this.ctx = options.ctx;
		this.image = options.image;
		this.explosion = options.explosion;
		this.position = options.position;
		this.width = options.width;
		this.height = options.height;
		this.frame = options.frame;
		this.active = false;
		this.timer = 3000;
		this.bombPlant = options.bombPlant;
		this.bombExplosion = options.bombExplosion;	
	}
	render(x, y) {
		this.bombPlant.play();
		this.ctx.drawImage(
			this.image,
			16 * this.frame,
			0,
			16,
			16,
			x,
			y,
			this.width,
			this.height,
		)
	};
	boom(x, y, frame) {
		this.ctx.drawImage(
			this.explosion,
			16 * frame,
			0,
			16,
			16,
			x,
			y,
			this.width,
			this.height,
		)
	};

	update(x, y, dt) {
		this.render(x, y)
		this.timer -= dt;
		if (this.timer <= 0) {
			this.active = false;
			this.timer = 3000;
		}
		const interval = Math.ceil(this.timer / 500);
		if (interval % 2 === 0) {
			this.frame = 1;
		}
		else {
			this.frame = 2;
		}
	}
}