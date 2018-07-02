'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if(vector instanceof this) {
			throw new Error("Не вектор");
		}

		return this;
	}
}
