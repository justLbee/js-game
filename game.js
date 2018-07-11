'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if (!(vector instanceof Vector)) {
			throw new Error("Не вектор");
		}

		this.x += vector.x;
		this.y += vector.y;

		return new Vector(this.x, this.y);
		// return this; toDO проверить как лучше
	}

	times(n) {
		this.x *= n;
		this.y *= n;

		return new Vector(this.x, this.y);
	}
}

class Actor {
	constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
		// Object.defineProperty(this, "type", {
		// 	value: "actor",
		// 	writable: false,
		// 	configurable: true
		// });
		// this.act = function () {
		//
		// };

		if (position instanceof Vector) {
			this.pos = position;
			this.left = this.pos.x;
			this.top = this.pos.y;
		}
		else {
			throw Error("Первый аргумент не является вектором");
		}

		if (size instanceof Vector) {
			this.size = size;
			this.right = this.left + this.size.x;
			this.bottom = this.top + this.size.y;
		}
		else {
			throw Error("Второй аргумент не является вектором");
		}

		if (speed instanceof Vector) {
			this.speed = speed;
		}
		else {
			throw Error("Третий аргумент не является вектором");
		}
	}
	act() {

	}

	get type() {
		return 'actor';
	}

	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw Error("Аргумент не является экземпляром Actor");
		}

		// console.log(`Sravnenie: ${this.left} >= ${actor.right} : ${this.left >= actor.right}`);
		// console.log(`Sravnenie: ${this.right} <= ${actor.left} : ${this.right <= actor.left}`);
		// console.log(`Sravnenie: ${this.bottom} <= ${actor.top} : ${this.bottom <= actor.top}`);
		// console.log(`Sravnenie: ${this.top} >= ${actor.bottom} : ${this.top >= actor.bottom}`);
		// console.log(`${(this.left >= actor.right || this.right <= actor.left)
		// || (this.bottom <= actor.top || this.top >= actor.bottom)}`);

		if (this !== actor) {
			// console.log(this);
			// console.log(actor);
			if ((this.left >= actor.right || this.right <= actor.left)
				|| (this.bottom <= actor.top || this.top >= actor.bottom)) {

				return false;
			}
			else {
				if (
					((this.left === actor.left || this.right === actor.right) && this.top < actor.top && this.bottom > actor.bottom) ||
					((this.bottom === actor.bottom || this.top === actor.top) && this.left < actor.left && this.right > actor.right)) {
					return false;
				}
			}
			return true;
		}

		else {
			return false;
		}
	}
}

class Level {
	constructor(grid, actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;

		if (this.actors) {
			this.player = this.actors.find(actor => actor.type === 'player');
		}

		this.height = (this.grid) ? this.grid.length : 0;
		this.width = (this.grid) ? Math.max(...(this.grid.map((line) => (line.length)))) : 0;
	}

	isFinished() {
		return (this.status !== null && this.finishDelay < 0);
	}

	actorAt(movingObject) {
		// console.log('actor:');
		// console.log(movingObject);
		// console.log('actors:');
		// console.log(this.actors);
		if (!movingObject || !(movingObject instanceof Actor)) {
			throw Error('Не движущийся объект');
		}
		else if (movingObject) {
			if (this.actors.length === 1) {
				return undefined;
			}
			else {
				return this.actors.find(actor => actor.isIntersect(movingObject));
			}
		}
	}

	obstacleAt(positionAt, size) {
		if (!(positionAt instanceof Vector) || !(size instanceof Vector)) {
			throw Error('Положение или размер не вектор');
		}
		else {
			positionAt.x = Math.floor(positionAt.x);
			positionAt.y = Math.floor(positionAt.y);
			size.x = Math.floor(size.x);
			size.y = Math.floor(size.y);

			if (positionAt.y >= this.height) {
				return 'lava';
			}
			else if (positionAt.x < 0 || (positionAt.x + size.x) > this.width || positionAt.y < 0) {
				return 'wall';
			}
			else {
				for (let i = 0; i < this.height; i++) {
					if (i === positionAt.y + size.y) {
						for (let j = 0; j < this.width; j++) {
							if (j === positionAt.x + size.x) {
								return this.grid[i][j];
							}
						}
					}
				}
			}
		}
	}

	removeActor(actor) {
		if (actor) {
			this.actors.splice(this.actors.indexOf(actor), 1);
		}
	}

	noMoreActors(actorType) {
		// console.log(this.actors.find(actor => actor.type === actorType));

		return !(this.actors.find(actor => actor.type === actorType)) || this.actors.length === 0;
	}

	playerTouched(type, actor = new Actor()) {
		if (this.status === null) {
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
			}
			else if (type === 'coin' && actor.type === 'coin') {
				this.removeActor(actor);
				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}
		}
	}
}

class LevelParser {
	constructor(catalog) {
		this.catalog = catalog;
	}

	actorFromSymbol(symbol) {
		if (symbol) {
			return (this.catalog.hasOwnProperty(symbol)) ? this.catalog[symbol] : undefined;
		}
	}

	obstacleFromSymbol(symbol) {
		if (symbol) {
			if (symbol === 'x') {
				return 'wall';
			}
			else if (symbol === '!') {
				return 'lava';
			}
		}
	}

	createGrid(gridPlans) {
		let arrayGrid = [];
		if (gridPlans.length === 0) {
			return arrayGrid;
		}
		else {
			arrayGrid = gridPlans.map(plan => {
				return plan.replace().split('').map(symbol => {
					return this.obstacleFromSymbol(symbol) && symbol.replace(symbol, this.obstacleFromSymbol(symbol));
				});
			});
			return arrayGrid;
		}
	}

	createActors(actorsPlan) {
		if (actorsPlan.length === 0 || this.catalog === undefined) {
			return [];
		}
		else {
			return actorsPlan.reduce((newGrid, actorsPlanString, positionY) => {
				actorsPlanString.split('').forEach((symbol, positionX) => {
					const actorConst = this.actorFromSymbol(symbol);
					if (actorConst) {
						if (actorConst === Actor || Actor.prototype.isPrototypeOf(actorConst.prototype)) {
							let position = new Vector(positionX, positionY);

							newGrid.push(new actorConst(position));
						}
					}
				});

				return newGrid;
			}, []);
		}
	}

	parse(parsePlan) {
		let level = new Level(parsePlan);
		level.grid = this.createGrid(parsePlan);
		level.actors = this.createActors(parsePlan);

		return level;
	}
}

class Fireball extends Actor {
	constructor(position = new Vector(0, 0), speed = new Vector(0, 0)) {
		super(position, new Vector(1, 1), speed);
		this.pos = position;
	}

	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		let newPositionX = this.pos.x + this.speed.x * time;
		let newPositionY = this.pos.y + this.speed.y * time;

		return new Vector(newPositionX, newPositionY);
	}

	handleObstacle() {
		this.speed.x *= -1;
		this.speed.y *= -1;
	}

	act(time, level) {
		let newPosition = this.getNextPosition(time);

		if (level.obstacleAt(newPosition, this.size)) {
			this.handleObstacle();
		}
		else{
			this.pos = newPosition;
		}
	}
}

class HorizontalFireball extends Fireball {
	constructor(position) {
		super(position);
		this.speed = new Vector(2, 0);
	}
}

class VerticalFireball extends Fireball {
	constructor(position) {
		super(position);
		this.speed = new Vector(0, 2);
	}
}

class FireRain extends Fireball {
	constructor(position) {
		super(position);
		this.position = position;
		this.speed = new Vector(0, 3);
	}

	handleObstacle() {
		this.speed.x *= 1;
		this.speed.y *= 1;
		this.pos.x = this.position.x;
		this.pos.y = this.position.y;
	}
}

class Coin extends Actor {
	constructor(position = new Vector()) {
		super(position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
		this.startPos = position;

		const MINSPRING = 0;
		const MAXSTRING = 2 * Math.PI;

		this.spring = Math.random() * (MAXSTRING - MINSPRING) + MINSPRING;
		this.springSpeed = 8;
		this.springDist = 0.07;

		Object.defineProperty(this, 'type', {
			writable: false,
			value: 'coin'
		});
	}

	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		let newPosY = Math.sin(this.spring) * this.springDist;

		return new Vector(0, newPosY);
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);

		return this.startPos.plus(this.getSpringVector());
	}
}

class Player extends Actor {
	constructor(vector = new Vector()) {
		let position = new Vector(vector.x, vector.y - 0.5);
		let size = new Vector(0.8, 1.5);
		let speed = new Vector(0, 0);
		super(position, size, speed);

		Object.defineProperty(this, 'type', {
			writable: false,
			value: 'player'
		});
	}
}