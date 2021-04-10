module.exports = {
	name: 'help',
	category: 'info',
	execute: ({ message, args }) => {
		if(args.length == 0) {
			const categories = [...new Set(message.client.commands.array().filter(c => c.category).map(c => c.category.charAt(0).toUpperCase() + c.category.slice(1)))];
			console.log(categories);

			const embed = {
				color: Math.floor(Math.random() * 16777215).toString(16),
				title: 'Canvas Command List',
				//fields
			};

			message.channel.send({ embed });
		}
	},
};