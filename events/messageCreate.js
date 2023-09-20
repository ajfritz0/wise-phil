const { writeFile } = require('fs/promises');
const { readFileSync } = require('node:fs');
const ignoreFile = 'cfg/channelIgnoreList.json';
// eslint-disable-next-line no-unused-vars
const { PermissionsBitField, Message } = require('discord.js');
const ignoreList = JSON.parse(readFileSync(ignoreFile, { encoding: 'utf8' }));

const commands = {
	help: require('../commands/help'),
	ignore: require('../commands/ignore'),
	listen: require('../commands/listen'),
	status: require('../commands/status'),
};

const saveIgnoreList = () => {
	writeFile(ignoreFile, JSON.stringify(ignoreList), 'utf8')
		.then(() => console.log(`Write to ${ignoreFile} complete`))
		.catch(console.error);
};

if (ignoreList.channels === undefined) ignoreList.channels = [];
if (ignoreList.roles === undefined) ignoreList.roles = [];

/**
 * @param {Message} message
 */
module.exports = async (message) => {
	if (message.author.bot || !message.client._chain.ready || message.guild === null) return;

	const chanId = message.channelId;
	const botID = message.client.user.id;
	const userMentions = message.mentions.users;
	const chain = message.client._chain;

	if (message.content.startsWith('!') && message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
		const cmd = message.content.split(' ')[0].slice(1);
		if (commands[cmd] !== undefined) {
			commands[cmd](message, ignoreList);
			saveIgnoreList();
			return;
		}
	}

	// if the message mentions this bot, return a phrase
	if (userMentions.has(botID)) {
		return message.channel.send(chain.getPhrase());
	}

	const memberRoles = message.member.roles.cache;
	if (memberRoles.hasAny(...ignoreList.roles) || ignoreList.channels.includes(chanId)) return;

	try {
		const data = chain.tokenize(message.content, true);
		chain.addTokenizedData(data);
		chain.save(
			message.content,
			message.createdTimestamp,
			message.author.id,
			message.author.username,
			chanId,
			message.channel.name,
			message.guildId,
			message.guild.name,
		);
	}
	catch (e) {
		console.error(e, '-----\n', message.content + '\n', '-----\n');
	}
};