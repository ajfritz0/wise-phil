// eslint-disable-next-line no-unused-vars
const { Message } = require('discord.js');
/**
 *
 * @param {Message} message
 * @param {Object} list
 */
module.exports = (message, list) => {
	const msgMentions = message.mentions;
	const channels = [], roles = [];

	for (const [snowflake, channel] of msgMentions.channels) {
		if (!list.channels.includes(snowflake)) {
			channels.push(`${channel.name}: Listening`);
		}
		else {
			channels.push(`${channel.name}: Ignoring`);
		}
	}
	for (const [snowflake, role] of msgMentions.roles) {
		if (!list.roles.includes(snowflake)) {
			roles.push(`${role.name}: Listening`);
		}
		else {
			roles.push(`${role.name}: Ignoring`);
		}
	}

	const returnMsg = ((channels.length === 0) ? '' : 'Channels:\n\t' + channels.join('\n\t')) + ((roles.length === 0) ? '' : '\nRoles:\n\t' + roles.join('\n\t'));
	if (returnMsg.length !== 0) {
		message.channel.send(`\`\`\`${returnMsg}\`\`\``);
	}
};