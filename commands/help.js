module.exports = {
	name: 'help',
	category: 'info',
	execute: ({ message, args }) => {
		const categories = [...new Set(message.client.commands.array().filter(c => c.category).map(c => c.category.charAt(0).toUpperCase() + c.category.slice(1)))];

		if(args.length == 0) {
			const embed = {
				color: Math.floor(Math.random() * 16777215).toString(16),
				title: 'Canvas Command List',
				fields: categories.map(c => {
					return { name: c, value: `\`${message.client.prefix}help ${c.toLowerCase()}\``, inline: true };
				}),
			};

			message.channel.send({ embed });
		} else if(args.length == 1) {
			if(categories.map(c => c.toLowerCase()).includes(args[0].toLowerCase())) {
				const category = args[0].toLowerCase();
				const commands = message.client.commands.array().filter(c => c.category == category);

				const embed = {
					color: Math.floor(Math.random() * 16777215).toString(16),
					title: `${category.charAt(0).toUpperCase() + category.slice(1)} commands`,
					description: commands.map(command => `\`${command.name}\``).join(', '),
					footer: `Make sure to put \`${message.client.prefix}\` before every command(Except when running Canvas Bot Script commands(Like in free-draw mode), then you should use ~)!`,
				};

				message.channel.send({ embed });
			} else {
				message.channel.send(':octagonal_sign: Unknown category!');
			}
		}
	},
};