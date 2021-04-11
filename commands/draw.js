// const paper = require('paper');
const { createCanvas } = require('canvas');
const Discord = require('discord.js');
const { Parser } = require('../parser.js');

module.exports = {
	name: 'draw',
	category: 'drawing',
	execute: ({ message, args }) => {
		const default_dimensions = args[0] == 'default';
		let canvas_width = Math.floor(parseInt(args[0]));
		let canvas_height = Math.floor(parseInt(args[1]));

		if(!default_dimensions && (isNaN(canvas_width) || isNaN(canvas_height)) && (canvas_width < 10 || canvas_height < 10)) {
			return message.channel.send('Dimensions can only be whole number of a minimum of 10');
		}

		const canvas = createCanvas(args.length == 0 ? 400 : default_dimensions ? 400 : canvas_width, args.length == 0 ? 400 : default_dimensions ? 400 : canvas_height);
		canvas_width = canvas.width;
		canvas_height = canvas.height;
		const ctx = canvas.getContext('2d');

		const id = Math.random().toString(36).slice(2);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		message.client.canvases.set(id, ctx.getImageData(0, 0, canvas.width, canvas.height));

		let edits = 0;
		const bufferedCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `canvas${edits}.png`);

		const drawingBoard = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}'s Canvas`)
			.attachFiles([bufferedCanvas])
			.setImage(`attachment://canvas${edits}.png`)
			.setDescription(`To draw on the canvas, you need to type different Canvas Bot Commands. These commands will always start with a \`~\`. Full documentation can be found here: https://cbscript.github.io. Canvas dimensions: ${default_dimensions ? '400x400(default)' : `${canvas_width}x${canvas_height}`}`)
			.setFooter(`Edits: ${edits}, ID: ${id}`);


		let latest_embed;
		let latest_log;
		let force_ended = false;

		message.channel.send(drawingBoard).then(msg => {
			latest_embed = msg;
			const filter = m => m.content.toLowerCase().startsWith('~') && m.author.id == message.author.id;
			const collector = msg.channel.createMessageCollector(filter, { time: 600000 });
			const parser = new Parser();

			collector.on('collect', cmd => {
				if(cmd.content.toLowerCase() == ('~end' || '~stop')) {
					return cmd.channel.send('Are you SURE you want to end this sesion. You won\'t be able to edit the canvas after this!').then(m => {
						m.react('✅');
						const c = m.createReactionCollector((r, u) => r.emoji.name == '✅' && u.id == message.author.id, { time: 60000 });
						c.on('collect', () => {
							force_ended = true;
							collector.stop();
						});
					});
				}

				const parsed = parser.parse(cmd.content, ctx, message);
				cmd.reply('\n' + parsed.responseMessage).then(a => {
					message.client.canvases.set(id, ctx.getImageData(0, 0, canvas.width, canvas.height));
					if(latest_log) latest_log.delete();
					edits -= parsed.changes_undid == 0 && parsed.madeChanges ? -1 : parsed.changes_undid;
					const newCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `canvas${edits}.png`);

					const newEmbed = new Discord.MessageEmbed()
						.setTitle(`${message.author.username}'s Canvas`)
						.attachFiles([newCanvas])
						.setImage(`attachment://canvas${edits}.png`)
						.setDescription(`To run a canvas command, make sure it starts with \`~\`, for example: \`~clear\`. Canvas dimensions: ${default_dimensions ? '400x400(default)' : `${canvas_width}x${canvas_height}`}`)
						.setFooter(`Edits: ${edits}, ID: ${id}`);
					/* eslint-disable no-empty-function */
					msg.delete().catch(() => {});
					cmd.delete().catch(() => {});
					latest_log = a;
					latest_embed.delete().catch(() => {});
					/* eslint-enable no-empty-function */
					message.channel.send(newEmbed).then(p => latest_embed = p);
				});
			});

			collector.on('end', () => {
				const finalResult = new Discord.MessageAttachment(canvas.toBuffer(), 'final-result.png');
				message.client.canvases.set(id, ctx.getImageData(0, 0, canvas.width, canvas.height));

				latest_embed.delete();
				message.reply(`${force_ended ? 'You ended your drawing session.' : 'Your time has run out!'} You edited the board **${edits}** times. ID: \`${id}\` Here is your final result: `, finalResult);
			});
		});
	},
};