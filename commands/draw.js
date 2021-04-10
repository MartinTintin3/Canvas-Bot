// const paper = require('paper');
const { createCanvas } = require('canvas');
const Discord = require('discord.js');
const { Parser } = require('../parser.js');

module.exports = {
	name: 'draw',
	execute: ({ message, args }) => {
		if(args.length < 1) {
			return message.channel.send('Please specify dimensions of the canvas. Example: `c!draw 400 400`, or just do `c!draw default` for default dimensions(400x400)');
		}

		const default_dimensions = args[0] == 'default';
		const canvas_width = Math.floor(parseInt(args[0]));
		const canvas_height = Math.floor(parseInt(args[1]));

		if(!default_dimensions && (canvas_width < 10 || canvas_height < 10)) {
			return message.channel.send('Dimensions can only be whole number of a minimum of 10');
		}

		const canvas = createCanvas(default_dimensions ? 400 : canvas_width, default_dimensions ? 400 : canvas_height);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = 'black';

		ctx.fillRect(10, 10, 20, 20);

		let edits = 0;
		const bufferedCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `canvas${edits}.png`);

		const drawingBoard = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}'s Canvas`)
			.attachFiles([bufferedCanvas])
			.setImage(`attachment://canvas${edits}.png`)
			.setDescription(`To run a canvas command, make sure it starts with \`~\`, for example: \`~clear\`. Canvas dimensions: ${default_dimensions ? '400x400(default)' : `${canvas_width}x${canvas_height}`}`)
			.setFooter(`Edits: ${edits}`);


		let latest;
		let force_ended = false;

		message.channel.send(drawingBoard).then(msg => {
			latest = msg;
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

				const parsed = parser.parse(cmd.content, ctx);
				cmd.reply('\n' + parsed.responseMessage).then(() => {
					edits -= parsed.changes_undid == 0 && parsed.madeChanges ? -1 : parsed.changes_undid;
					const newCanvas = new Discord.MessageAttachment(canvas.toBuffer(), `canvas${edits}.png`);

					const newEmbed = new Discord.MessageEmbed()
						.setTitle(`${message.author.username}'s Canvas`)
						.attachFiles([newCanvas])
						.setImage(`attachment://canvas${edits}.png`)
						.setDescription(`To run a canvas command, make sure it starts with \`~\`, for example: \`~clear\`. Canvas dimensions: ${default_dimensions ? '400x400(default)' : `${canvas_width}x${canvas_height}`}`)
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
				message.reply(`${force_ended ? 'You ended your drawing session.' : 'Your time has run out!'} You edited the board **${edits}** times. Here is your final result: `, finalResult);
			});
		});
	},
};