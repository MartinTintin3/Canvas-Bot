module.exports = {
	name: 'rickroll',
	category: 'gif',
	execute: ({ message }) => {
		message.channel.send({ files: ['https://media0.giphy.com/media/10kABVanhwykJW/200.gif'] });
		message.delete();
	},
};