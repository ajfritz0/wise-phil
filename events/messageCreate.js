const { MarkovChain } = require('../lib/Markov');
const Graph = require('../lib//Graph');
const pg = require('pg');

const channelIgnoreList = ['admin-only', 'dev'];
let chain = null;

const PostgresConfig = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWD,
	host: process.env.DBHOST,
	database: process.env.DBNAME,
	port: process.env.DBPORT,
};

const postgresClient = new pg.Client(PostgresConfig);
postgresClient.on('notice', (msg) => console.warn('notice: ', msg));
postgresClient.on('error', (err) => console.error('Server error: ', err));

let building = true;

(async () => {
	try {
		const graph = new Graph();
		await postgresClient.connect();
		const data = [];
		data.push(await postgresClient.query('SELECT id, node_value FROM node'));
		data.push(await postgresClient.query('SELECT id, edge_weight, p_id, c_id FROM edge'));

		const nodes = data[0].rows.reduce((acc, val) => {
			acc.set(val.id, val.node_value);
			return acc;
		}, new Map());

		const edges = data[1].rows;
		for (let i = 0; i < edges.length; i++) {
			const edge = edges[i];
			graph.addEdge(nodes.get(edge.p_id), nodes.get(edge.c_id), edge.edge_weight);
		}

		chain = new MarkovChain(graph);
		console.log('Consensus Achieved!');
	}
	catch (error) {
		console.error(error);
		chain = new MarkovChain();
	}

	building = false;
})();

module.exports = async (message) => {
	if (message.author.bot) return;
	if (building) return message.channel.send('We are still building a consensus');
	const chanName = message.channel.name;
	const botID = message.client.user.id;
	const userMentions = message.mentions.users;

	if (userMentions.has(botID)) {
		return message.channel.send(chain.getPhrase());
	}

	if (!channelIgnoreList.includes(chanName)) {
		const data = chain.tokenize(message.content);
		chain.addTokenizedData(data);
	}
};