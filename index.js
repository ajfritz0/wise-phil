const { Client, Intents } = require('discord.js');
const { token } = require('./cfg/config.json');
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	console.log(`Loading Event Module ${file}`);
	require(`./events/${file}`)(client);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	const time = new Date().toDateString();
	console.log(`[${time}] Logged Interaction`);
	console.log(interaction);
	console.log('==========');
});

client.login(token);