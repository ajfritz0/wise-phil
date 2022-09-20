const { writeFile } = require('fs/promises');
const ignoreFile = '../cfg/channelIgnoreList.json';
const channelIgnoreList = require('../cfg/channelIgnoreList.json');
const { PermissionsBitField } = require('discord.js');

const addToIgnoreList = (channelId, channelName) => {
	if (channelIgnoreList[channelId] !== null && channelIgnoreList[channelId] !== undefined) return;
	channelIgnoreList[channelId] = channelName;
	writeFile(ignoreFile, JSON.stringify(channelIgnoreList), 'utf8')
		.then(() => console.log(`Write to ${ignoreFile} complete`))
		.catch(console.error);
};

const removeFromIgnoreList = (channelId) => {
	if (channelIgnoreList[channelId] === null || channelIgnoreList[channelId] === undefined) return;
	delete channelIgnoreList[channelId];
	writeFile(ignoreFile, JSON.stringify(channelIgnoreList), 'utf8')
		.then(() => console.log(`Write to ${ignoreFile} complete`))
		.catch(console.error);
};

module.exports = async (message) => {
	if (message.author.bot || !message.client._chain.ready) return;

	const chanId = message.channelId;
	const botID = message.client.user.id;
	const userMentions = message.mentions.users;
	const chain = message.client._chain;

	// if the message mentions this bot, return a phrase
	if (userMentions.has(botID)) {
		return message.channel.send(chain.getPhrase());
	}

	// if the message starts with the !ignore command, at the channel to the ignore list
	if (message.content.startsWith('!') && message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
		if (message.content.startsWith('!ignore')) {
			addToIgnoreList(chanId, message.channel.name);
			return message.channel.send('Ok, I will ignore this channel');
		}
		else if (message.content.startsWith('!unignore')) {
			removeFromIgnoreList(chanId);
			return message.channel.send('Ok, I will resume listening on this channel');
		}
	}

	// if the message was generic, add the phrase to the chain and store in the database
	if (channelIgnoreList[chanId] === null || channelIgnoreList[chanId] === undefined) {
		console.log(message.content);
		const data = chain.tokenize(message.content, true);
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