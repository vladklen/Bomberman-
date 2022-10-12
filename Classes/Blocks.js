class FieldBlocks {
	constructor(options) {
		this.ctx = options.ctx;
		this.image = options.image;
		this.width = options.width;
		this.height = options.height;
		this.frame = options.frame;
		this.frameNumbers = options.frameNumbers;
	}
	render(x, y) {
		this.ctx.drawImage(
			this.image,
			this.width / this.frameNumbers * this.frame,
			0,
			16,
			16,
			x,
			y,
			this.width,
			this.height,
		)
	}
}