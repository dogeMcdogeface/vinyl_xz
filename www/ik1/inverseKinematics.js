
//----------- SIMULATION VARIABLES ------------------------------------------------------------------//
const disk = {radius: 150, mass: 100, maxSpeed: PI, maxAccel: PI, PID: {p: 10, i: 0, d: 0.1}}; //Build disk
const head = {radius: 200, mass: 100, maxSpeed: PI, maxAccel: PI, PID: {p: 10, i: 0, d: 0.1}}; //Print Head


//------------- SYSTEM CONSTANTS --------------------------------------------------------------------//
const real = new System(disk, head);	//Real status of the system
const goal = new System(disk, head);	//Desired status of the system
const sens = new System(disk, head);	//Measured status of the system
let target = {x:0, y:0};

function setupSystems(){
	real.autoUpdate(0);
}

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
	//distance of target from center of disk
	const to = sqrt(x * x + y * y);
	//find for what head angle the head is at the same distance from center as the target
	goal.head.angle = acos(((2 * real.head.radius * real.head.radius) - (to * to)) / (2 * real.head.radius * real.head.radius));
	//track the position of the head after rotating
	const hx = sin(goal.head.angle) * (real.head.radius);
	//rotate the disk to meet head
	goal.disk.angle = PI - (2 * atan((sqrt(x * x + y * y - hx * hx) + y) / (x - hx)));
}

//----------- SIMULATE PRINTER MOVEMENT -------------------------------------------------------------//
function computeReal() {	//TODO Implement PID here
	const goalP = zeroCross(goal.disk.angle, sens.disk.angle);
	const goalH = zeroCross(goal.head.angle, sens.head.angle);

	//real.disk.moveTo(goalP);
	//real.head.moveTo(goalH);
	real.disk.speed = PID(goalP, sens.disk.angle, real.disk.PID);
	real.head.speed = PID(goalH, sens.head.angle, real.head.PID);
}



//----------- COMPUTE PID OUTPUT --------------------------------------------------------------------//
function PID(goal, current, pid) {
	pid.integral = (pid.integral === undefined) ? 0 : pid.integral;
	pid.lastError = (pid.lastError === undefined) ? 0 : pid.lastError;

	// Initialize error terms
	let error = goal - current;

	// Calculate proportional, integral, and derivative terms
	let proportional = pid.p * error;
	pid.integral += pid.i * error;
	let derivative = pid.d * (error - pid.lastError);

	// Calculate the output
	let output = proportional + pid.integral + derivative;

	// Update the last error term
	pid.lastError = error;

	return output;
}

//----------- SIMULATE PRINTER SENSOR READINGS ------------------------------------------------------//
function computeMeas() {	//TODO Simulate sensor jitter + low resolution here
	sens.disk.angle = real.disk.angle;
	sens.head.angle =  real.head.angle;
	readOuts[readOuts.length] = anglesToXY(sens.disk.angle, sens.head.angle);
}

//----------- CONVERT SENSED ANGLE READINGS BACK TO CARTESIAN POINT ---------------------------------//
function anglesToXY(a,b) {
	//Calculate absolute head position
	const hx = sin(b)*(real.head.radius);
	const hy = cos(b)*(-real.head.radius)+real.head.radius;

	//Calculate head position relative to disk
	const x = cos(-a)*(hx)-sin(-a)*(hy);
	const y = sin(-a)*(hx)+cos(-a)*(hy);

	return{x,y};
}

//----------- HANDLE ZERO POINT CROSSING ------------------------------------------------------------//
function zeroCross(a, b) {
	return a += (b - a > Math.PI) ? Math.PI * 2 : (b - a < -Math.PI) ? -Math.PI * 2 : 0;
}
