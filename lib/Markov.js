const Graph = require('./Graph');
module.exports = class MarkovChain {
	constructor() {
		this._defaultBank = {
			start: [],
			end: [],
			map: new Graph(),
		};
		this._minimumLength = 5;
		this._maximumLength = 100;
		this._bank = this._defaultBank;
	}

	_getRandomElement(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	_isAllowed(word) {
		return !word.match(/^(http|\/)/);
	}

	_cleanList(list) {
		return list.filter((word) => {
			return this._isAllowed(word);
		});
	}
	/*
	_cleanBank() {
		this._bank.start = this._cleanList(this._bank.start);
		this._bank.end = this._cleanList(this._bank.end);
		Object.keys(this._bank.map).forEach((key) => {
			this._bank.map[key] = this._cleanList(this._bank.map[key]);
		});
	}
	*/

	_sanitizeWord(text) {
		const specialCharFilter = /[(){}[\]"]/g;
		const whitespaceFilter = /([ \t])\1*/g;

		return text.replace(specialCharFilter, '').replace(whitespaceFilter, ' ').trim().toLowerCase();
	}

	_processText(text) {
		if (typeof text !== 'string' || !text.length) {
			return;
		}

		const words = this._sanitizeWord(text).split(' ');
		// const _start = words[0];
		const _end = words[words.length - 1];

		// this._isAllowed(words[0]) && !this._bank.start.includes(_start) && this._bank.start.push(_start);
		this._isAllowed(words[words.length - 1]) && !this._bank.end.includes(_end) && this._bank.end.push(_end);
		let bSentStart = true;

		for (let w = 0; w < words.length - 1; w++) {
			const curr = this._sanitizeWord(words[w]), next = this._sanitizeWord(words[w + 1]);
			if (!this._isAllowed(curr) ||
				!this._isAllowed(next)) {
				continue;
			}

			if (bSentStart) {
				if (!this._bank.start.includes(curr)) this._bank.start.push(curr);
				bSentStart = false;
			}
			if (curr.endsWith('.') || curr.endsWith('!') || curr.endsWith('?')) {
				bSentStart = true;
				this._bank.map.addNode(curr);
				this._bank.end.push(curr);
			}
			else if (this._bank.map.hasEdge(curr, next)) {
				const weight = this._bank.map.getEdgeWeight(curr, next);
				this._bank.map.setEdgeWeight(curr, next, weight + 1);
			}
			else {
				this._bank.map.addEdge(curr, next, 1);
			}
		}
	}

	clearBank() {
		this._bank = this._defaultBank;
	}

	addPhrase(phrase) {
		this._processText(phrase);
	}

	getPhrase() {
		let currentWord = this._getRandomElement(this._bank.start);
		const phrase = [currentWord];
		let iter = 0;

		while (this._bank.map.hasNode(currentWord) && iter < this._maximumLength) {
			const nextWords = this._bank.map.adjacent(currentWord);
			if (nextWords === null || nextWords === undefined) break;

			const dist = cdf(nextWords);
			const index = selectInd(dist, Math.random());
			currentWord = nextWords[index][0];
			phrase.push(currentWord);

			if (currentWord in this._bank.end) {
				break;
			}
			iter += 1;
		}

		return phrase.join(' ');
	}

	export() {
		return JSON.stringify({
			start: this._bank.start,
			end: this._bank.end,
			map: this._bank.map.serialize(),
		});
	}

	import(str) {
		const data = JSON.parse(str);

		this._bank.start = data.start;
		this._bank.end = data.end;
		this._bank.map.deserialize(data.map);
	}
};

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