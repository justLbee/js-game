'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if (!(vector instanceof Vector)) {
			throw new Error("Можно прибавлять к вектору только вектор типа Vector");
		}

		return new Vector(this.x + vector.x, this.y + vector.y);
	}

	times(n) {
		return new Vector(this.x * n, this.y * n);
	}
}

class Actor {
	constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
		if (!(position instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
			throw Error(`Arguments of 'position', 'size' or 'speed' of Actor class, can be set only by a vector with type of: Vector!`);
		}
		this.pos = position;
		this.size = size;
		this.speed = speed;
	}

	get left() {
		return this.pos.x;
	}

	get top() {
		return this.pos.y;
	}

	get right() {
		return this.pos.x + this.size.x;
	}

	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return 'actor';
	}

	act() {

	}

	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw Error("Аргумент не является экземпляром Actor");
		}

		if (this === actor) {
			return false;
		}

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
		if (!(movingObject instanceof Actor)) {
			throw Error('Не движущийся объект');
		}

		return this.actors.find(actor => actor.isIntersect(movingObject));
	}

	obstacleAt(positionAt, size) {
		if (!(positionAt instanceof Vector) || !(size instanceof Vector)) {
			throw Error('Положение или размер не вектор');
		}
		if ((positionAt.x < 0 || (positionAt.x + size.x) > this.width || positionAt.y < 0)) {
			return 'wall';
		}
		else if ((positionAt.y + size.y) > this.height) {
			return 'lava';
		}

		let left = Math.floor(positionAt.x);
		let top = Math.floor(positionAt.y);

		for (let i = top; i < (positionAt.y + size.y); i++) {
			for (let j = left; j < (positionAt.x + size.x); j++) {
				if (this.grid[i][j]) {
					return this.grid[i][j];
				}
			}
		}
	}

	removeActor(actor) {
		this.actors.splice(this.actors.indexOf(actor), 1);
	}

	noMoreActors(actorType) {
		return !(this.actors.find(actor => actor.type === actorType)) || this.actors.length === 0;
	}

	playerTouched(type, actor) {
		if (this.status !== null) {
			return;
		}

		if (type === 'lava' || type === 'fireball') {
			this.status = 'lost';
		}
		else if (type === 'coin') {
			this.removeActor(actor);
			if (this.noMoreActors(type)) {
				this.status = 'won';
			}
		}
	}
}

class LevelParser {
	constructor(catalog) {
		this.catalog = catalog;
	}

	actorFromSymbol(symbol) {
		return (this.catalog && symbol in this.catalog) ? this.catalog[symbol] : undefined;
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

	parse(parsePlan) {
		return new Level(this.createGrid(parsePlan), this.createActors(parsePlan));
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
		else {
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
		super(position, new Vector(0.6, 0.6), new Vector());
		this.pos = position.plus(new Vector(0.2, 0.1));

		this.position = position.plus(new Vector(0.2, 0.1));
		this.positionStart = new Vector(position.x + 0.2, position.y + 0.1);

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

		this.position.y = this.positionStart.y + this.getSpringVector().y;
		return this.position;
		// return this.position;
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(position = new Vector()) {
		super(position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector());
	}

	get type() {
		return 'player';
	}
}

// const schemas = [
// 	[
// 		"     v                 ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"  |xxx       w         ",
// 		"  o                 o  ",
// 		"  x               = x  ",
// 		"  x          o o    x  ",
// 		"  x  @    *  xxxxx  x  ",
// 		"  xxxxx             x  ",
// 		"      x!!!!!!!!!!!!!x  ",
// 		"      xxxxxxxxxxxxxxx  ",
// 		"                       "
// 	],
// 	[
// 		"     v                 ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"  |                    ",
// 		"  o                 o  ",
// 		"  x               = x  ",
// 		"  x          o o    x  ",
// 		"  x  @       xxxxx  x  ",
// 		"  xxxxx             x  ",
// 		"      x!!!!!!!!!!!!!x  ",
// 		"      xxxxxxxxxxxxxxx  ",
// 		"                       "
// 	],
// 	[
// 		"        |           |  ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"     |                 ",
// 		"                       ",
// 		"         =      |      ",
// 		" @ |  o            o   ",
// 		"xxxxxxxxx!!!!!!!xxxxxxx",
// 		"                       "
// 	],
// 	[
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"    o                  ",
// 		"    x      | x!!x=     ",
// 		"         x             ",
// 		"                      x",
// 		"                       ",
// 		"                       ",
// 		"                       ",
// 		"               xxx     ",
// 		"                       ",
// 		"                       ",
// 		"       xxx  |          ",
// 		"                       ",
// 		" @                     ",
// 		"xxx                    ",
// 		"                       "
// 	], [
// 		"   v         v",
// 		"              ",
// 		"         !o!  ",
// 		"              ",
// 		"              ",
// 		"              ",
// 		"              ",
// 		"         xxx  ",
// 		"          o   ",
// 		"        =     ",
// 		"  @           ",
// 		"  xxxx        ",
// 		"  |           ",
// 		"      xxx    x",
// 		"              ",
// 		"          !   ",
// 		"              ",
// 		"              ",
// 		" o       x    ",
// 		" x      x     ",
// 		"       x      ",
// 		"      x       ",
// 		"   xx         ",
// 		"              "
// 	]
// ];
// const actorDict = {
// 	'@': Player,
// 	'v': FireRain,
// 	'=': HorizontalFireball,
// 	'o': Coin
// };
// const parser = new LevelParser(actorDict);
// runGame(schemas, parser, DOMDisplay)
// 	.then(() => console.log('Вы выиграли приз!'));

const schemas = [
	[
		'         ',
		'    =    ',
		'         ',
		'       o ',
		' @    xxx',
		'         ',
		'xxx      ',
		'!!!!!!!!!'
	],
	[
		'      v  ',
		'    v    ',
		'  v      ',
		'        o',
		'        x',
		'@   x    ',
		'x        ',
		'!!!!!!!!!'
	]
];
const actorDict = {
	'@': Player,
	'v': VerticalFireball,
	'o': Coin,
	'=': HorizontalFireball,
	'|': FireRain


};
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
	.then(() => console.log('Вы  выиграли приз!'));