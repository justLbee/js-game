'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if(!(vector instanceof Vector)) {
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

		if(position instanceof Vector) {
			this.pos = position;
			this.left = this.pos.x;
			this.top = this.pos.y;
		}
		else {
			throw Error("Первый аргумент не является вектором");
		}

		if(size instanceof Vector) {
			this.size = size;
			this.right = this.left + this.size.x;
			this.bottom = this.top + this.size.y;
		}
		else {
			throw Error("Второй аргумент не является вектором");
		}

		if(speed instanceof Vector) {
			this.speed = speed;
		}
		else {
			throw Error("Третий аргумент не является вектором");
		}
	}
	isIntersect(actor) {
		if(!(actor instanceof Actor)) {
			throw Error("Аргумент не является экземпляром Actor");
		}
	}
}
