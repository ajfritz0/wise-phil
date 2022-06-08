const { Client, Intents } = require('discord.js');
const { token } = require('./cfg/config.json');
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const eventName = file.slice(0, -3);

	console.log(`Loading Event Module ${file}`);
	const cb = require(`./events/${file}`);

	client.on(eventName, cb);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);