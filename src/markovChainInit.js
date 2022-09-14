const MarkovChainManager = require('./MarkovChainManager');
const pg = require('pg');

const chain = new MarkovChainManager();

const PostgresConfig = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWD,
	host: process.env.DBHOST,
	database: process.env.DBNAME,
	port: process.env.DBPORT,
};
const time = () => (new Date()).getTime();

const postgresClient = new pg.Client(PostgresConfig);
postgresClient.on('notice', (msg) => console.warn('Notice: ', msg));
postgresClient.on('error', (err) => console.log('SERVER ERROR: ', err));

module.exports = (async () => {
	console.log('Beginning Chain Building');
	try {
		const start = time();
		await postgresClient.connect();
		const data = await postgresClient.query('SELECT text_body FROM phrases');

		for (const row of data.rows) {
			const tokens = chain.tokenize(row.text_body);
			chain.addTokenizedData(tokens);
		}

		console.log(`Consensus Achieved in ${time() - start}ms`);
	}
	catch (err) {
		console.error(err);
	}

	return chain;
})();