const MarkovChain = require('../lib/Markov');
const { readFile, writeFile } = require('fs/promises');
const { readFileSync } = require('fs');
const path = require('path');
const sch = require('node-schedule');

const dbPath = path.resolve(process.cwd(), 'databases/markovdb.json');

module.exports = (client) => {
	const chain = new MarkovChain();

	// const data = readFileSync(path.resolve(process.cwd(), 'databases/import.json'), { encoding: 'utf8' });
	// if (data != null) chain.import(data);

	readFile(dbPath, { encoding: 'utf8' })
		.then(readData => {
			chain.import(readData);
		})
		.catch(console.error);

	client.on('messageCreate', message => {
		if (message.author.bot) return;
		if (message.channel.name != 'admin-only' || message.channel.name != 'dev') chain.addPhrase(message.content);
		const botID = message.client.user.id;

		const users = message.mentions.users;

		if (users.has(botID)) {
			message.channel.send(chain.getPhrase());
		}
	});

	sch.scheduleJob('0 */4 * * *', () => {
		console.log('Beginning database write');
		writeFile(dbPath, chain.export())
			.then(() => console.log('Database write complete'))
			.catch(console.error);
	});
};