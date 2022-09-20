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
const time = () => (new Date()).getTime();

class MarkovChainManager extends MarkovChain {
	constructor() {
		super();
		this.ready = false;
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

	async load() {
		try {
			console.log('Starting chain build');
			const start = time();
			const data = await pgPool.query('SELECT text_body FROM phrases');
			console.log('Retrieved %d rows', data.rows.length);
			for (const row of data.rows) {
				const tokens = this.tokenize(row.text_body);
				this.addTokenizedData(tokens);
			}
			console.log(`Chain build completed in ${time() - start}ms`);
		}
		catch (err) {
			console.error(err);
		}
		this.ready = true;
	}
}

module.exports = MarkovChainManager;