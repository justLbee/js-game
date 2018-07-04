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
		Object.defineProperty(this, "type", {
			value: "actor",
			writable: false, // запретить присвоение "user.name="
			configurable: false // запретить удаление "delete user.name"
		});
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

	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw Error("Аргумент не является экземпляром Actor");
		}

		let topLeft = {
			x: actor.left,
			y: actor.top
		};
		let topRight = {
			x: actor.right,
			y: actor.top
		}
		let bottomLeft = {
			x: actor.left,
			y: actor.bottom
		}
		let bottomRight = {
			x: actor.right,
			y: actor.bottom
		}

		let topPlayerLeft = {
			x: this.left,
			y: this.top
		};
		let topPlayerRight = {
			x: this.right,
			y: this.top
		}
		let bottomPlayerLeft = {
			x: this.left,
			y: this.bottom
		}
		let bottomPlayerRight = {
			x: this.right,
			y: this.bottom
		}
		console.log(this.left + ' ' + actor.left);
		console.log(this.right + ' ' + actor.right);
		console.log(this.top + ' ' + actor.top);
		console.log(this.bottom + ' ' + actor.bottom);
		// if (topLeft.x < topRight.x && topLeft.y < bottomRight.y && topLeft.x < bottomLeft.x) {
		// 	if (topPlayerLeft >= topRight && topPlayerRight <= topLeft && bottomPlayerLeft >= bottomRight
		// 		&& bottomPlayerRight <= topRight) {
		// 		return true;
		// 	}
		// 	if ((topPlayerLeft === topLeft && topPlayerRight === topRight && bottomPlayerLeft === bottomLeft.y
		// 		&& bottomPlayerRight === bottomRight) && (actor.pos.x < 0 || actor.pos.y < 0)) {
		// 		return true;
		// 	}
		// }
		if (this.left !== actor.left && this.right !== actor.right && this.top !== actor.top &&
			this.bottom !== actor.bottom) {
			return true;
		}
		else if (topPlayerLeft >= topRight && topPlayerRight <= topLeft && bottomPlayerLeft >= bottomRight
			&& bottomPlayerRight <= topRight) {
			return true;
		}
		else if ((topPlayerLeft === topLeft && topPlayerRight === topRight && bottomPlayerLeft === bottomLeft.y
			&& bottomPlayerRight === bottomRight) && (actor.pos.x < 0 || actor.pos.y < 0)) {
			return true;
		}
		else if ((this.left < actor.left && this.right > actor.right && this.top < actor.top
			&& this.bottom > actor.bottom) || this.left === actor.left) {
			return true;
		}
		// else if () {
		// 	return true;
		// }
		// else
		// else if(topActorLeft < topLeft && topActorRight > topRight && bottomActorLeft > bottomLeft
		// 	&& bottomActorRight > bottomRight) {
		// 	return true;
		// }
		else {
			return false;
		}
	}
}
