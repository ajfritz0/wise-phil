class Graph {
	constructor() {
		this._nodes = new Set();
		this._adjacencyList = new Map();
	}

	hasNode(name) {
		return this._nodes.has(name);
	}

	*getNodes() {
		for (const iter of this._nodes) yield iter;
	}

	addNode(name = '') {
		if (name.length == 0) return null;
		if (this.hasNode(name)) return this;

		this._nodes.add(name);
		this._adjacencyList.set(name, new Map());
		return this;
	}

	hasEdge(node1, node2) {
		if (!this._nodes.has(node1) || !this._nodes.has(node2)) return false;

		if (this._adjacencyList.get(node1).has(node2)) return true;
		else return false;
	}

	addEdge(node1, node2, weight = 1) {
		if (this.hasEdge(node1, node2)) return null;
		if (weight < 1) weight = 1;

		if (this.addNode(node1) == null || this.addNode(node2) == null) return null;
		this._adjacencyList.get(node1).set(node2, weight);
		return this;
	}

	getEdgeWeight(node1, node2) {
		if (!this.hasEdge(node1, node2)) return -1;
		return this._adjacencyList.get(node1).get(node2);
	}

	setEdgeWeight(node1, node2, weight) {
		if (!this.hasEdge(node1, node2)) return false;

		this._adjacencyList.get(node1).set(node2, weight);
		return true;
	}

	incrementEdgeWeight(node1, node2) {
		if (!this.hasEdge(node1, node2)) return false;

		this.setEdgeWeight(node1, node2, this.getEdgeWeight(node1, node2) + 1);
		return true;
	}

	decrementEdgeWeight(node1, node2) {
		if (this.hasEdge(node1, node2)) return false;

		const w = this.getEdgeWeight(node1, node2);
		if (w - 1 < 1) return false;
		this.setEdgeWeight(node1, node2, w - 1);
		return true;
	}

	// returns a Map with the [key,value] pairs of the adjacent nodes the node points to
	adjacent(node) {
		if (!this.hasNode(node)) return new Map();
		return this._adjacencyList.get(node);
	}

	getRandomNode() {
		const rand = Math.floor(Math.random() * this._nodes.size);

		const nodeIter = this._nodes.values();
		let i = 0;
		while (i < rand) {
			i++;
			nodeIter.next();
		}
		return nodeIter.next().value;
	}

	serialize() {
		const serializeData = {
			_nodes: [],
			_adjacencyList: {},
		};
		for (const n of this._nodes) {
			serializeData._nodes.push(n);
		}
		for (const [key, value] of this._adjacencyList) {
			serializeData._adjacencyList[key] = {};
			for (const [node, weight] of value) {
				serializeData._adjacencyList[key][node] = weight;
			}
		}

		return serializeData;
	}

	deserialize(obj) {
		for (let i = 0; i < obj._nodes.length; i++) {
			this.addNode(obj._nodes[i]);
		}
		const keys = Object.keys(obj._adjacencyList);
		for (let i = 0; i < keys.length; i++) {
			const adjKeys = Object.keys(obj._adjacencyList[keys[i]]);
			for (let j = 0; j < adjKeys.length; j++) {
				this.addEdge(keys[i], adjKeys[j], obj._adjacencyList[keys[i]][adjKeys[j]]);
			}
		}
	}
}

module.exports = Graph;