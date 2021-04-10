/* eslint-disable indent */
class Parser {
	constructor() {
		return;
	}

	parse(code, ctx) {
		const lines = code.split('\n');
		let responseMessage = '';

		lines.forEach((line, index) => {
			const words = line.split(' ');
			if(words.length != 0 && words[0].startsWith('~')) {
				switch(words[0].toLowerCase().substring(1)) {
					case 'clear':
						ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
						const previous = ctx.fillStyle;
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
						ctx.fillStyle = previous;
						responseMessage += `**${index + 1}.** Cleared canvas`;
						break;
					default:
						responseMessage += `**Line ${index + 1}:** \`Error: Unknown Command\``;
				}
			}
		});

		return responseMessage;
	}
}

module.exports = { Parser };