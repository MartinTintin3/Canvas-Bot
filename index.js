require('dotenv').config();

// Imports
const Discord = require('discord.js');
const fs = require('fs');
const { default_prefix } = require('./config.json');


const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

// eslint-disable-next-line no-unused-vars
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
	}
}

/* const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(20, 20, 40, 40);

console.log(canvas.toDataURL()); */

client.once('ready', () => {
	client.user.setActivity({
		type: 'LISTENING',
		name: 'c!help',
	});
	console.log('Ready!');

	client.canvases = new Discord.Collection();
});

client.on('message', message => {
	if (!message.content.startsWith(default_prefix) || message.author.bot) return;

	const args = message.content.slice(default_prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`).then(() => {
				if(command.cooldownMessage) message.channel.send(command.cooldownMessage);
			});
		}
	}

	try {
		command.execute({ message, args });
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.TOKEN);