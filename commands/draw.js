const paper = require('paper');
const { createCanvas } = require('canvas');
const { MessageAttachment } = require('discord.js');

module.exports = {
	name: 'draw',
	execute: ({ message }) => {
		const canvas = createCanvas(400, 400);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = 'black';
		ctx.fillRect(40, 40, 40, 40);

		const buffer = canvas.toBuffer();

		return message.channel.send(new MessageAttachment(buffer, 'canvas.png'));
	},
};