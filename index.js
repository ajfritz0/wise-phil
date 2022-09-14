const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./cfg/config.json');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const eventName = file.slice(0, -3);

	console.log(`Loading Event Module ${file}`);
	const cb = require(`./events/${file}`);

	client.on(eventName, cb);
}

client._mChain = null;
require('./src/markovChainInit')
	.then(chain => client._mChain = chain)
	.catch(err => console.log(err));

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);