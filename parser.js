const { css_color_names } = require('./css_colors.js');

/* eslint-disable indent */
class Parser {
	constructor() {
		this.saves = [];
		return;
	}

	parse(code, ctx) {
		const lines = code.split('\n');
		let responseMessage = '';
		let madeChanges = false;
		let changes_undid = 0;
		const original = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

		lines.forEach((line, index) => {
			const words = line.split(' ');
			if(words.length != 0 && words[0].startsWith('~')) {
				switch(words[0].toLowerCase().substring(1)) {
					// Clear command
					case 'clear':
						ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
						const previous = ctx.fillStyle;
						ctx.fillStyle = 'white';
						ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
						ctx.fillStyle = previous;
						responseMessage += `**${index + 1}.** Cleared canvas\n`;
						madeChanges = true;
						break;
					// Undo command
					case 'undo':
						if(words.length <= 1) {
							if(this.saves.length > 0) {
								ctx.putImageData(this.saves[this.saves.length - 1], 0, 0);
								responseMessage += `**${index + 1}.** Undid one edit\n`;
								changes_undid = 1;
							} else {
								responseMessage += `**${index + 1}.** No changes to be undone\n`;
							}
						} else {
							const number = parseFloat(words[1]);

							if(!isNaN(number) && number % 1 == 0) {
								if(number > this.saves.length) {
									responseMessage += `**${index + 1}.** \`Error: Number exceeds number of edit's stored\`\n`;
								} else {
									ctx.putImageData(this.saves[this.saves.length - number], 0, 0);
									changes_undid = number;
									responseMessage += `**${index + 1}.** Undid \`${number}\` edits\n`;
								}
							} else {
								responseMessage += `**Line ${index + 1}:** \`Error: Argument isn't a whole number. Please specify number of edits to jump back to\`\n`;
							}
						}

						break;
					case 'rectangle':
						if(words.length <= 1) {
							responseMessage += `**Line ${index + 1}:** \`Error: Incorrect arguments. Correct usage: \` rectangle x y width height color should_fill\n\`x(number): \`X position of top-left corner of the rectangle\n\`y(number): \`Y position of top-left corner of the rectangle\n\`width(number): \`Width of the rectangle\n\`height(number): \`Height of the rectangle\n\`color(css color or hex color): \`Color of the rectangle\n\`should_fill(boolen, true or false): \`Should the rectangle be filled, or should it be just an outline\n\`Example: ~rectangle 200 200 40 40 red true\``;
						} else if(words.length != 7) {
							responseMessage += `**Line ${index + 1}:** \`Error: Incorrect arguments. Correct usage: \` rectangle x y width height color should_fill\n\`x(number): \`X position of top-left corner of the rectangle\n\`y(number): \`Y position of top-left corner of the rectangle\n\`width(number): \`Width of the rectangle\n\`height(number): \`Height of the rectangle\n\`color(css color or hex color): \`Color of the rectangle\n\`should_fill(boolen, true or false): \`Should the rectangle be filled, or should it be just an outline\n\`Example: ~rectangle 200 200 40 40 red true\``;
						} else {
							const x = parseFloat(words[1]);
							const y = parseFloat(words[2]);
							const width = parseFloat(words[3]);
							const height = parseFloat(words[4]);
							const color = words[5].toLowerCase();
							const should_fill = words[6].toLowerCase().includes('true') || words[6].toLowerCase().includes('false') ? eval(words[6].toLowerCase()) : false;
							let error = false;

							if(isNaN(x) || x % 1 != 0) {
								responseMessage += `**Line ${index + 1}:** \`Error: First argument should be x position of rectangle's top-left corner\`\n`;
								error = true;
							}
							if(isNaN(y) || y % 1 != 0) {
								responseMessage += `**Line ${index + 1}:** \`Error: Second argument should be y position of rectangle's top-left corner\`\n`;
								error = true;
							}
							if(isNaN(width) || width % 1 != 0) {
								responseMessage += `**Line ${index + 1}:** \`Error: Third argument should be the width of the rectangle\`\n`;
								error = true;
							}
							if(isNaN(height) || height % 1 != 0) {
								responseMessage += `**Line ${index + 1}:** \`Error: Fourth argument should be the height of the rectangle\`\n`;
								error = true;
							}
							if(!(color.startsWith('#') && color.length - 1 == (3 || 6)) && !css_color_names.includes(color.toLowerCase())) {
								responseMessage += `**Line ${index + 1}:** \`Error: Fifth argument should be the color of the rectangle(A css color or hex color)\`\n`;
								error = true;
							}

							if(!error) {
								if(should_fill) {
									ctx.fillStyle = color;
									ctx.fillRect(x, y, width, height);
									responseMessage += `**${index + 1}.** Filled a ${width}x${height} rectange at \`${x}, ${y}\` with the color ${color}`;
								} else {
									ctx.strokeStyle = color;
									ctx.strokeRect(x, y, width, height);
									responseMessage += `**${index + 1}.** Traced a ${width}x${height} rectange at \`${x}, ${y}\` with the color ${color}`;
								}

								madeChanges = true;
							}
						}
						break;

					// Unknown command error
					default:
						responseMessage += `**Line ${index + 1}:** \`Error: Unknown Command\`\n`;
				}
			}
		});

		if(madeChanges) this.saves.push(original);

		return { responseMessage, madeChanges, changes_undid };
	}
}

module.exports = { Parser };