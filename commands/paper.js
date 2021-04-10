const canvas = require('canvas').createCanvas(400, 400);
const { MessageAttachment } = require('discord.js');
// const gifencoder = require('gif-encoder-2');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

module.exports = {
	name: 'paper',
	execute: ({ message }) => {
		const ctx = canvas.getContext('2d');

		const ball = {
			x: 200,
			y: 200,
			velocity: 2,
			radius: 20,
			color: 'red',
		};

		// const encoder = new gifencoder(canvas.width, canvas.height);

		// encoder.setDelay(10);
		// encoder.start();

		const gif = GIFEncoder();

		for(let frame = 1; ball.velocity > 1 || ball.velocity < -1; frame++) {
			if(ball.y + ball.radius < canvas.height) {
				ball.velocity += 2;
			} else {
				ball.velocity = Math.abs(ball.velocity);
				ball.velocity *= -1;
			}

			ball.y += ball.velocity;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = ball.color;
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
			ctx.fill();

			const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const palette = quantize(data, 256);
			const index = applyPalette(data, palette);
			gif.writeFrame(index, width, height, { palette });

			// encoder.addFrame(ctx);
		}

		gif.finish();
		// encoder.finish();

		const buffer = Buffer.alloc(gif.buffer.byteLength);
		const view = new Uint8Array(gif.buffer);
		for (let i = 0; i < buffer.length; ++i) {
			buffer[i] = view[i];
		}

		// message.channel.send(new MessageAttachment(encoder.out.getData(), 'ball.gif'));
		message.channel.send(new MessageAttachment(buffer, 'ball2.gif'));
	},
};