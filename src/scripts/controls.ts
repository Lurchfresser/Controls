interface vec {
	x: number,
	y: number,

	toArray(): [number, number]
}

class internalVec implements vec {
	private _length: number;

	constructor(
		private _x: number,
		private _y: number) {
		this._length = Math.sqrt((_x * _x) + (_y * _y));
	}

	get x(): number {
		return this._x;
	}

	get y(): number {
		return this._y;
	}

	get length(): number {
		return this._length;
	}

	stretch(factor: number): void {
		if (this._length === 0) {
			throw new Error("vector with length 0 cant be stretched")
		}
		this._x *= factor;
		this._y *= factor;
		this._length *= factor;
	}

	toArray(): [number, number] {
		return [this._x, this._y];
	}
}

class Controls {
	private MainVec: internalVec;
	private readonly vecHistory: internalVec[];
	private pathLength: number;

	constructor(
		private readonly DEFAULT_PATH_LENGTH: number,
		startX: number,
		startY: number
	) {
		this.MainVec = new internalVec(startX, startY);
		this.vecHistory = [new internalVec(startX, startY)];
		this.pathLength = this.MainVec.length;
	}

	out(): internalVec {
		return this.MainVec;
	}

	//TODO:rewrite, so the MainVec can start at 0 and the error is caught at vec.stretch()
	input(inputVec: internalVec | vec | [number,number]): void {
		let iVec;
		//only create new Object, when it is necessary --> performance
		if (inputVec instanceof Array){
			iVec = new internalVec(...inputVec);
		}
		else if (!(inputVec instanceof internalVec)) {
			iVec = new internalVec(inputVec.x, inputVec.y);
			//else, so typescript knows it's an internalVec
		} else {
			iVec = <internalVec>inputVec;
		}
		let iVecLength = iVec.length;
		//if the inputVec is larger, than the def_path_len, just shorten the Vector, clear the history
		//push the vector to the array, do the calculations and then end the function for better performance
		if (iVecLength >= this.DEFAULT_PATH_LENGTH) {
			iVec.stretch(this.DEFAULT_PATH_LENGTH / iVecLength);
			this.vecHistory.length = 0;
			this.vecHistory.push(iVec);
			this.calculatePathLength();
			this.calculateNewMainVec();
			return;
		}
		let pathLength = this.pathLength;
		//for loop removes the oldest vectors and
		//stops before the path length would be shorter, even if the inputVec is added and then
		//shortens the oldest vec so the inputVec fits in perfectly
		for (let i = 0; i < this.vecHistory.length; i++) {
			let vec = this.vecHistory[i];
			let newPathLength = pathLength - vec.length + iVecLength;
			if (newPathLength > this.DEFAULT_PATH_LENGTH) {
				pathLength -= vec.length;
				this.vecHistory.shift()
				i--;
			} else if (newPathLength === this.DEFAULT_PATH_LENGTH) {
				this.vecHistory.shift();
				break;
			} else { //                       <--        the piece to be "filled"     --> divide by length for factor
				let factor = (this.DEFAULT_PATH_LENGTH - pathLength - iVec.length + vec.length) / vec.length;
				vec.stretch(factor);
				break;
			}
		}
		//gets only checked here, because the algorithm above can fix wrong path length
		if (iVec.length > 0)
			this.vecHistory.push(iVec);
		this.calculatePathLength();
		this.calculateNewMainVec();
	}

	inOutput(inputVec: internalVec | vec | [number,number]) {
		this.input(inputVec);
		return this.out();
	}

	calculateNewMainVec(): void {
		let x = 0;
		let y = 0;
		for (let vec of this.vecHistory) {
			x += vec.x;
			y += vec.y;
		}
		this.MainVec = new internalVec(x, y);
	}

	calculatePathLength() {
		this.pathLength = 0;
		for (let vec of this.vecHistory) {
			this.pathLength += vec.length;
		}
	}
}






let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("test")!;
let btn = document.getElementById("btn")!;

let ctx = canvas.getContext("2d")!;

btn.addEventListener("click", ()=>canvas.requestPointerLock());

document.addEventListener("mousemove", pointerLockControls);

let controls = new Controls(100,100,0);

function pointerLockControls(e:MouseEvent) {
	if (document.pointerLockElement === canvas) {
		//empty canvas
		ctx.clearRect(0,0,canvas.width,canvas.height);
		let outputVec = controls.inOutput([e.movementX, e.movementY]);
		//stretch to length 100
		outputVec.stretch(100/outputVec.length)
		//draw
		draw(...outputVec.toArray());
	}
}


function draw(x: number, y: number, x2?: number, y2?: number) {

	if (isNaN(x) || isNaN(y)) {
		throw new Error();
	}

	//if not defined, the beginning of the line is the middle of the canvas (hardcoded)
	x2 ??= 250;
	y2 ??= 250;

	ctx.beginPath();
	ctx.moveTo(x2, y2);
	ctx.lineTo(x2 + x, y2 + y);
	ctx.stroke();
}