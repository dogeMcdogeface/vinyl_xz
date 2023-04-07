//------------- SYSTEM CONSTANTS --------------------------------------------------------------------//
const r1 = 150; //Build Plate radius
const r2 = 200; //Print Head arm radius


//----------- SIMULATION CONSTANTS ------------------------------------------------------------------//
const inputSmoothing = 5.;
const targedMinDist = 10;

//----------- SIMULATION VARIABLES ------------------------------------------------------------------//

const world = {
	plateAngle : 0,
	plateSpeed:0,
	plateAccel:0,
	plateMass:0,

	headAngle : 0,
	headSpeed:0,
	headAccel:0,
	headMass:0
}

let reality = {};
let desired = {};
let measure = {}

let pa = 0.0; //Current plate angle
let ha = 0.0; //Current head angle
let paD = 0.0; //Desired plate angle
let haD = 0.0; //Desired head angle
let currentTarget = 0;
let targets = [];
let tx = 0; //current target position on the build plate
let ty = 0; //


function setup() {
	var sketchCanvas = createCanvas(r1 * 5 + 20, r1 + r2 + 100);
	sketchCanvas.parent(document.getElementById('canvas-holder'));
	frameRate(1000);
	textAlign(CENTER, CENTER);
}

function draw() {
	background(70);
	getTarget();
	trackTarget();
	movePrinter();
	drawPrinter();
	debug();
}


//----------- CALCULATE PRINTER MOVEMENT ------------------------------------------------------------//
function trackTarget() {
	//distance of target from center of plate
	to = sqrt(tx * tx + ty * ty);
	//find for what head angle the head is at the same distance from center as the target
	haD = acos(((2 * r2 * r2) - (to * to)) / (2 * r2 * r2));
	//track the position of the head after rotating
	hx = sin(haD) * (r2);
	hy = -cos(haD) * (r2) + r2;
	//rotate the plate to meet head
	paD = PI - (2 * atan((sqrt(tx * tx + ty * ty - hx * hx) + ty) / (tx - hx)));
	//track the position of our target after rotating the plate
	tx1 = cos(paD) * (tx) - sin(paD) * (ty);
	ty1 = sin(paD) * (tx) + cos(paD) * (ty);
}

//----------- SIMULATE PRINTER MOVEMENT -------------------------------------------------------------//
function movePrinter() { //Simulate real component movement
	if ((pa - paD) > PI) { //handle 0 point crossing
		paD = TWO_PI + paD;
	} else if ((pa - paD) < -PI) { //handle 0 point crossing
		paD = -TWO_PI + paD;
	}
	ha -= (ha - haD) / 6;
	pa -= (pa - paD) / 6;
	ha = normalizeAngle(ha);
	pa = normalizeAngle(pa);
}


//----------- GET TARGET TO TRACK FROM MOUSE INPUT --------------------------------------------------//
function getTarget() {
	let mouseV = createVector(mouseX - r1 - 10, mouseY - r1 - 30);
	mouseV.limit(r1 - 5);

	if (!targets.length) {
		//if there are no targets, move target point following mouse
		tx -= (tx - mouseV.x) / inputSmoothing;
		ty -= (ty - mouseV.y) / inputSmoothing;
	} else {
		if (abs(pa - paD) < 0.002) {
			currentTarget += 1;
		}
		currentTarget %= targets.length;
		tx = targets[currentTarget].x;
		ty = targets[currentTarget].y;
	}

	if (mouseIsPressed) {
		if (mouseButton === RIGHT) {
			targets = [];
		} else if (mouseButton === LEFT && targets.every(p => dist(mouseV.x, mouseV.y, p.x, p.y) >= targedMinDist)) {
			targets[targets.length] = {
				x: mouseV.x,
				y: mouseV.y
			};
		}
	}
}

//----------- DRAW GRAPHICS -------------------------------------------------------------------------//
function drawPrinter() {
	//--------- DRAW USER INPUT ----------------------------------------//
	translate(10, 30);
	push();
	translate(r1, r1);
	stroke(0, 0);
	fill(200);
	textSize(20);
	text("BUILD PLATE", 0, -r1 - 15);
	drawPlate(r1);
	stroke(50, 50);
	targets.forEach(point => drawPT(1, 5, point.x, point.y));
	stroke(0, 200, 200, 100);
	if (targets.length == 0) stroke(0, 0, 200, 100);
	drawPT(1, 10, tx, ty);
	pop();

	//--------- DRAW BUILD TABLE ---------------------------------------//
	translate(r1 * 4, r1);
	push();
	stroke(0, 0);
	fill(200);
	textSize(20);
	text("BUILD PLATE + PRINT HEAD", 0, -r1 - 15);
	rotate(pa);
	drawPlate(r1);
	fill(0, 0);
	stroke(50, 50);
	for (let i = 1; i < targets.length; i++) {
		if (i > currentTarget) stroke(0, 200, 200, 100);
		line(targets[i].x, targets[i].y, targets[i - 1].x, targets[i - 1].y);
	}
	stroke(0, 200, 200, 100);
	drawPT(1, 10, tx, ty);
	pop();

	//--------- DRAW PRINT HEAD ----------------------------------------//
	push();
	translate(0, r2);
	rotate(ha);
	drawHead(r2);
	drawPT(0, 5, 0, -r2);
	pop();

	//--------- DRAW DESIRED PLATE ANGLE -------------------------------//
	push();
	fill(0, 0);
	stroke(0, 255, 255);
	drawAngle(r1 * 2 + 5, paD);
	pop();

	//--------- DRAW DESIRED HEAD ANGLE --------------------------------//
	push();
	translate(0, r2);
	fill(0, 0);
	stroke(200, 0, 0);
	drawAngle(r2 * 2, haD);
	pop();
}

//----------- PRINT DEBUG INFO ----------------------------------------------------------------------//
let debugObj = {};

function debug() {
	debugObj.target = {
		x: `${round(tx, 0)}`,
		y: `${round(ty, 0)}`,
		curr: `${currentTarget} / ${targets.length}`,
	};

	debugObj.plate = {
		angle: `${round(pa * 180 / PI, 0)}°`,
		goal: `${round(paD * 180 / PI, 0)}°`,
		error: `${round((pa - paD) * 180 / PI, 2)}°`
	};

	debugObj.head = {
		angle: `${round(ha * 180 / PI, 0)}°`,
		goal: `${round(haD * 180 / PI, 0)}°`,
		error: `${round((ha - haD) * 180 / PI, 2)}°`
	};

	displayDebug(debugObj);
}

//----------- UTILITY FUNCTIONS ---------------------------------------------------------------------//
function drawPT(a, s, x, y) {
	push();
	translate(x, y);
	rotate(QUARTER_PI * a);
	strokeWeight(2);
	line(-s, 0, s, 0);
	line(0, -s, 0, s);
	pop();
}

function drawAngle(r, a) {
	drawingContext.setLineDash([10, 10]);
	arc(0, 0, r, r, -HALF_PI, -HALF_PI + a);
	drawingContext.setLineDash([0]);
}

function drawPlate(r) {
	stroke(0);
	fill(255, 255, 255);
	circle(0, 0, r * 2);
	line(0, 0, 0, -r);
	noStroke();
	fill(200);
	textSize(15);
	text("N", 0, -r + 10);
	text("S", 0, +r - 10);
	text("E", -r + 10, 0);
	text("W", +r - 10, 0);
}

function drawHead(r) {
	stroke(0, 0);
	fill(100);
	circle(0, 0, 30);
	fill(100, 100);
	rect(-10, 0, 20, -r);
	fill(0, 0);
	stroke(200, 0, 0);
	line(0, 0, 0, -r);
}

function normalizeAngle(a) {
	return (a + TWO_PI) % TWO_PI;
}
