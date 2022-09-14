const { MarkovChain } = require('../lib/Markov');
const pg = require('pg');

const pgConfig = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWD,
	host: process.env.DBHOST,
	port: process.env.DBPORT,
	database: process.env.DBNAME,
};
const pgPool = new pg.Pool(pgConfig);

pgPool.on('error', (err) => {
	console.error(err);
});

class MarkovChainManager extends MarkovChain {
	constructor() {
		super();
	}

	// needs to save the message content, author + id, channel + id, guild + id, and date created
	save(content = '', timestamp = 0, authorId, authorName, channelId, channelName, guildId, guildName) {
		let dateString = null;
		if (timestamp == 0) {
			dateString = (new Date()).toISOString();
		}
		else {
			dateString = (new Date(timestamp)).toISOString();
		}
		pgPool.query(
			'INSERT INTO phrases (text_body, author_name, channel_name, guild_name, author_id, channel_id, guild_id, date_created) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
			[content, authorName, channelName, guildName, authorId, channelId, guildId, dateString],
		).then(rows => {
			console.log('QUERY FINISHED\n');
			console.log(rows);
		}).catch(console.error);
	}
}

module.exports = MarkovChainManager;