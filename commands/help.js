// eslint-disable-next-line no-unused-vars
const { Message } = require('discord.js');

/**
 *
 * @param {Message} message
 */
module.exports = (message) => {
	message.channel.send('```' +
		'!status [<role>|<channel>]' +
		'\n\tDisplays listening status of mentions roles or channels' +
		'\n!listen [<role>|<channel>]' +
		'\n\tAllows parsing of text input from mentioned roles or channels' +
		'\n!ignore [<role>|<channel>]' +
		'\n\tRestricts parsing of text input from mentioned roles or channels' +
		'\n!help' +
		'\n\tDisplays this help message' +
		'```',
	);
};