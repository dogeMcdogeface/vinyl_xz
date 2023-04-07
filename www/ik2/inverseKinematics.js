
//----------- SIMULATION VARIABLES ------------------------------------------------------------------//
const plate = {radius: 150, mass: 100}; //Build Plate
const head = {radius: 200, mass: 100}; //Print Head


//------------- SYSTEM CONSTANTS --------------------------------------------------------------------//
const real = new System(plate, head);	//Real status of the system
const goal = new System(plate, head);	//Desired status of the system
const sens = new System(plate, head);	//Measured status of the system
let target = {x:0, y:0};


//----------- CALCULATE MOTION UPDATES --------------------------------------------------------------//
function computeSystems(){
	computeGoal();
	computeReal();
	computeMeas();
}

//----------- CALCULATE DESIRED MOVEMENT ------------------------------------------------------------//
function computeGoal() {
	const x = target.x;
	const y = target.y;
	//distance of target from center of plate
	const to = sqrt(x * x + y * y);
	//find for what head angle the head is at the same distance from center as the target
	goal.head.angle = acos(((2 * real.head.radius * real.head.radius) - (to * to)) / (2 * real.head.radius * real.head.radius));
	//track the position of the head after rotating
	const hx = sin(goal.head.angle) * (real.head.radius);
	//rotate the plate to meet head
	goal.plate.angle = PI - (2 * atan((sqrt(x * x + y * y - hx * hx) + y) / (x - hx)));
}

//----------- SIMULATE PRINTER MOVEMENT -------------------------------------------------------------//
function computeReal() {	//Implement PID here
	real.head.moveTo(zeroCross(goal.head.angle, sens.head.angle));
	real.plate.moveTo(zeroCross(goal.plate.angle, sens.plate.angle));
}

//----------- SIMULATE PRINTER SENSOR READINGS ------------------------------------------------------//
function computeMeas() {	//Implement sensor jitter + low resolution here
	sens.head.angle =  real.head.angle;
	sens.plate.angle = real.plate.angle;
}


//----------- HANDLE ZERO POINT CROSSING ------------------------------------------------------------//
function zeroCross(a, b) {
	return a += (b - a > Math.PI) ? Math.PI * 2 : (b - a < -Math.PI) ? -Math.PI * 2 : 0;
}
function normalizeAngle(a) {			//range reduction
	return (a + TWO_PI) % TWO_PI;
}


//----------- PRINT DEBUG INFO ----------------------------------------------------------------------//
let debugObj = {};

function debug() {
	debugObj.target = {
		x: `${round(target.x, 0)}`,
		y: `${round(target.y, 0)}`,
		curr: `${targetIndex} / ${targets.length}`,
	};

	debugObj.plate = {
		angle: `${round(real.plate.angle * 180 / PI, 0)}°`,
		goal: `${round(goal.plate.angle * 180 / PI, 0)}°`,
		error: `${round((real.plate.angle - goal.plate.angle) * 180 / PI, 2)}°`
	};

	debugObj.head = {
		angle: `${round(real.head.angle * 180 / PI, 0)}°`,
		goal: `${round(goal.head.angle * 180 / PI, 0)}°`,
		error: `${round((real.head.angle - goal.head.angle) * 180 / PI, 2)}°`
	};

	displayDebug(debugObj);
}