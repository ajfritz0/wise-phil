const Graph = require('./Graph');

const isAllowed = (word) => !word.match(/^(http|\/)/g);
const sanitize = (word) => {
	const specialCharFilter = /[^\u0020-\u007a]|["'()+/<`>=[\]\\]/g;
	return word.replace(specialCharFilter, '').trim().toLowerCase();
};
class MarkovChain {
	constructor(_graph = null) {
		this._maximumLength = 20;
		if (_graph instanceof Graph) this._graph = _graph;
		else this._graph = new Graph();
	}

	_getRandomElement(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	_cleanList(list) {
		return list.filter((word) => {
			return this._isAllowed(word);
		});
	}

	tokenize(text) {
		if (typeof text !== 'string' || !text.length) {
			return new Graph();
		}

		const graph = new Graph();
		graph.addNode('__SOL');
		graph.addNode('__EOL');

		const words = text.split(' ').filter(value => value.length <= 50 && value.length > 0 && isAllowed(value)).map(sanitize);

		const bHasPunc = (x) => {
			const punc = ['.', '!', '?', '\n'];
			return !punc.every(curr => !x.endsWith(curr));
		};
		const addEdge = (g, n1, n2) => {
			if (g.hasEdge(n1, n2)) g.incrementEdgeWeight(n1, n2);
			else g.addEdge(n1, n2);
		};

		let isHead = true;
		let i = 0;
		while (i < words.length) {
			const currWord = words[i], nextWord = words[i + 1];
			i += 1;

			if (isHead) {
				addEdge(graph, '__SOL', currWord);
				isHead = false;
			}

			if (bHasPunc(currWord) || i == words.length) {
				addEdge(graph, currWord, '__EOL');
				isHead = true;
				continue;
			}

			addEdge(graph, currWord, nextWord);
		}

		return graph;
	}

	clearBank() {
		delete this._graph;
		this._graph = new Graph();
	}

	addTokenizedData(tokens) {
		if (!(tokens instanceof Graph)) {
			throw new Error('tokens is not an instance of graph');
		}

		if (tokens.adjacent('__SOL').size == 0) throw new Error('Malformed token data');

		for (const node of tokens.getNodes()) {
			const adj = tokens.adjacent(node);
			for (const [adjNode, weight] of adj) {
				if (this._graph.hasEdge(node, adjNode)) {
					const weightSum = weight + this._graph.getEdgeWeight(node, adjNode);
					this._graph.setEdgeWeight(node, adjNode, weightSum);
				}
				else {
					this._graph.addEdge(node, adjNode, weight);
				}
			}
		}
	}

	getPhrase() {
		let currNode = '__SOL';
		let iter = 0;
		const phrase = [];

		while (iter < this._maximumLength) {
			const adj = [...this._graph.adjacent(currNode)];
			if (adj.length == 0) break;

			const dist = cdf(adj);
			const index = selectInd(dist, Math.random());
			currNode = adj[index][0];
			if (currNode == '__EOL') break;
			else phrase.push(currNode);

			iter += 1;
		}

		return phrase.join(' ');
	}
}

const cdf = (list) => {
	let total = 0;
	const dist = [];
	let sum = 0;
	for (const [, value] of list) {
		total += value;
	}
	for (const [, value] of list) {
		sum += value / total;
		dist.push(sum);
	}
	return dist;
};

const selectInd = (dist, value) => {
	let i = 0;
	for (i = 0; (i < dist.length) && (value >= dist[i]); i++);
	return i;
};

module.exports = {
	MarkovChain,
	sanitize,
	isAllowed,
};