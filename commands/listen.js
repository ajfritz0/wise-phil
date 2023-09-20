// eslint-disable-next-line no-unused-vars
const { Message } = require('discord.js');

/**
 *
 * @param {Message} message
 * @param {Object} list
 */
module.exports = (message, list) => {
	const msgMentions = message.mentions;
	let ruleChangeCount = 0;
	for (const [snowflake] of msgMentions.channels) {
		if (list.channels.includes(snowflake)) {
			ruleChangeCount += 1;
			list.channels.splice(list.channels.indexOf(snowflake), 1);
		}
	}
	for (const [snowflake] of msgMentions.roles) {
		if (list.roles.includes(snowflake)) {
			ruleChangeCount += 1;
			list.roles.splice(list.roles.indexOf(snowflake), 1);
		}
	}

	message.channel.send(`${ruleChangeCount} rules updated.`);
};