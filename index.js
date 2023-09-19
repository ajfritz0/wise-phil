require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./cfg/config.json');
const fs = require('fs');
const MarkovChainManager = require('./src/MarkovChainManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const eventName = file.slice(0, -3);

	console.log(`Loading Event Module ${file}`);
	const cb = require(`./events/${file}`);

	client.on(eventName, cb);
}

client._chain = new MarkovChainManager();
client._chain.load();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('error', console.error);

client.login(token);