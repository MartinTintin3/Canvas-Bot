// const paper = require('paper');
const { createCanvas } = require('canvas');
const Discord = require('discord.js');
const { Parser } = require('../parser.js');

module.exports = {
	name: 'draw',
	execute: ({ message }) => {
		const canvas = createCanvas(400, 400);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';

		ctx.fillRect(10, 10, 20, 20);

		let edits = 0;

		const bufferedCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `drawing-board${edits}.png`);

		const drawingBoard = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}'s Drawing Board`)
			.attachFiles([bufferedCanvas])
			.setImage(`attachment://drawing-board${edits}.png`)
			.setDescription('To run a canvas command, make sure it starts with `~`, for example: `~clear`')
			.setFooter(`Edits: ${edits}`);


		let latest;

		message.channel.send(drawingBoard).then(msg => {
			latest = msg;
			const filter = m => m.content.toLowerCase().startsWith('~') && m.author.id == message.author.id;
			const collector = msg.channel.createMessageCollector(filter, { time: 600000 });
			const parser = new Parser();

			collector.on('collect', cmd => {
				const parsed = parser.parse(cmd.content, ctx, edits, message)
				cmd.reply('\n' + parsed.responseMessage).then(() => {
					parsed.madeChanges ? edits++ : edits--;
					const newCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `drawing-board${edits}.png`);

					const newEmbed = new Discord.MessageEmbed()
						.setTitle(`${message.author.username}'s Drawing Board`)
						.attachFiles([newCanvas])
						.setImage(`attachment://drawing-board${edits}.png`)
						.setDescription('To run a canvas command, make sure it starts with `~`, for example: `~clear`')
						.setFooter(`Edits: ${edits}`);
					// eslint-disable-next-line no-empty-function
					msg.delete().catch(() => {});
					// eslint-disable-next-line no-empty-function
					cmd.delete().catch(() => {});
					message.channel.send(newEmbed).then(p => latest = p);
				});
			});

			collector.on('end', () => {
				const finalResult = new Discord.MessageAttachment(canvas.toBuffer(), 'final-result.png');

				latest.delete();
				message.reply(`Your time has run out! You edited the board **${edits}** times. Here is your final result: `, finalResult);
			});
		});
	},
};