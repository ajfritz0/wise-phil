const { readFile, writeFile } = require('fs/promises');
const channelIgnoreList = [];
const ignoreFile = './cfg/channelIgnoreList';

readFile(ignoreFile, { encoding: 'utf8' })
	.then((body) => {
		channelIgnoreList.push(...(body.split('\n').map(x => x.split('|')[0])));
	})
	.catch(err => {
		if (err.code == 'ENOENT') {
			writeFile(ignoreFile, '', { encoding: 'utf8' });
		}
		else {
			console.error(`Error reading channelIgnoreFile\n${err}`);
		}
	});

const addToIgnoreList = (key) => {
	channelIgnoreList.push(key);
	writeFile(ignoreFile, channelIgnoreList.join('\n'), { encoding: 'utf8' });
};

module.exports = async (message) => {
	if (message.author.bot) return;
	if (message.client._mChain === null) return;

	const chanId = message.channelId;
	const botID = message.client.user.id;
	const userMentions = message.mentions.users;
	const chain = message.client._mChain;

	// if the message mentions this bot, return a phrase
	if (userMentions.has(botID)) {
		return message.channel.send(chain.getPhrase());
	}

	// if the message starts with the !ignore command, at the channel to the ignore list
	if (message.content.startsWith('!ignore')) {
		const ident = `${chanId}|${message.channel.name}`;
		addToIgnoreList(ident);
	}

	// if the message was generic, add the phrase to the chain and store in the database
	if (!channelIgnoreList.includes(chanId)) {
		console.log(message.content);
		const data = chain.tokenize(message.content);
		chain.addTokenizedData(data);
		chain.save(
			message.content,
			message.createdTimestamp,
			message.author.id,
			chanId,
			message.guildId,
			message.author.username,
			message.channel.name,
			message.guild.name,
		);
	}
};