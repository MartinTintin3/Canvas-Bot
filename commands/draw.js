const paper = require('paper');
const { createCanvas } = require('canvas');
const { MessageAttachment } = require('discord.js');
const GIFEncoder = require('gif-encoder-2');

module.exports = {
	name: 'draw',
	execute: ({ message }) => {
		const canvas = createCanvas(400, 400);
		const ctx = canvas.getContext('2d');
		const encoder = new GIFEncoder(400, 400);

		encoder.setDelay(10);
		encoder.start();

		// Fill background

		for(let i = 0; i < 50; i++) {
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = 'black';
			ctx.fillRect(40 + i * 2, 40, 40, 40);

			encoder.addFrame(ctx);
		}

		for(let i = 50; i > 0; i--) {
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = 'black';
			ctx.fillRect(40 + i * 2, 40, 40, 40);

			encoder.addFrame(ctx);
		}

		encoder.finish();

		const buffer = encoder.out.getData();

		return message.channel.send(new MessageAttachment(buffer, 'canvas.gif'));
	},
};