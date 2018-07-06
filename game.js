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
		this.act = function () {

		};

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
			if ((this.left >= actor.right || this.right <= actor.left)
				|| (this.bottom <= actor.top || this.top >= actor.bottom)) {
				return false;
			}
			else {
				if (
					((this.left === actor.left || this.right === actor.right) && this.top <= actor.top && this.bottom >= actor.bottom) ||
					((this.bottom === actor.bottom || this.top === actor.top) && this.left <= actor.left && this.right >= actor.right)) {
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

		if (this.grid) {
			console.log(grid.length);
			this.height = this.grid.length;
			for (let element of this.grid) {
				this.width = Math.max(element.length);
			}
		}
		else {
			this.height = 0;
			this.width = 0;
		}
		// console.log(this.height + ' ' + this.width);
	}

	isFinished() {
		if (this.status !== null && this.finishDelay < 0) {
			return true;
		}
		else return false;
	}

	actorAt(actor) {
		if (!actor || !(actor instanceof Actor)) {
			throw Error('Не движущийся объект');
		}
		else if (actor) {
			if (this.actors.length === 1) {
				return undefined;
			}

			for (let obj in this.actors) {
				console.log(obj);
				if (obj.isIntersect(actor)) {
					return obj;
				}
			}
		}
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

		console.log(this);
	}
}