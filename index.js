require('dotenv').config();

// Discord.js imports
const Discord = require('discord.js');
const client = Discord.Client();

// Image rendering modules
const paper = require('paper');
const { createCanvas } = require('canvas');

/* const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(20, 20, 40, 40);

console.log(canvas.toDataURL()); */

client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.TOKEN);