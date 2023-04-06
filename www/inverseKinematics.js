//------------- SYSTEM CONSTANTS --------------------------------------------------------------------//
const r1 = 150; //Build Plate radius
const r2 = 200; //Print Head arm radius


//----------- SIMULATION CONSTANTS ------------------------------------------------------------------//
const inputSmoothing = 5.;
const targedMinDist = 10;

//----------- SIMULATION VARIABLES ------------------------------------------------------------------//
let pa = 0.0; //Current plate angle
let ha = 0.0; //Current head angle
let paD = 0.0; //Desired plate angle
let haD = 0.0; //Desired head angle
let currentTarget = 0;
let targets = [];
let tx = 0; //current target position on the build plate
let ty = 0; //


function setup() {
	var parent = document.getElementById('canvas-holder');
	if (parent) {
		var sketchCanvas = createCanvas(parent.offsetWidth, parent.offsetHeight);
		sketchCanvas.parent("canvas-holder");
	} else {
		createCanvas(900, 900);
	}
	frameRate(1000);
}

function draw() {
	background(70);
	getTarget();
	trackTarget();
	movePrinter();
	drawPrinter();
	drawDebug();
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
function getTarget() { //Get a target point 
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
	textAlign(CENTER, CENTER);
	//Draw the user input
	translate(r1 + 10, r1 + 30);
	stroke(0, 0);
	fill(200);
	textSize(20);
	text("BUILD PLATE", 0, -r1 - 15);
	stroke(0);
	fill(255, 255, 255);
	circle(0, 0, r1 * 2);
	line(0, 0, 0, -r1);
	stroke(0, 0);
	fill(200);
	textSize(15);
	text("N", 0, -r1 + 10);
	text("S", 0, +r1 - 10);
	text("E", -r1 + 10, 0);
	text("W", +r1 - 10, 0);
	stroke(50, 50);
	targets.forEach(point => drawX(1, 5, point.x, point.y));
	stroke(0, 200, 200, 100);
	drawX(1, 10, tx, ty);
	resetMatrix();


	//Draw the build plate
	translate(r1 * 4, r1 + 30);
	stroke(0, 0);
	fill(200);
	textSize(20);
	text("BUILD PLATE + PRINT HEAD", 0, -r1 - 15);
	push();
	rotate(pa);
	stroke(0);
	fill(255, 255, 255);
	circle(0, 0, r1 * 2);
	line(0, 0, 0, -r1);
	noStroke();
	fill(200);
	textSize(15);
	text("N", 0, -r1 + 10);
	text("S", 0, +r1 - 10);
	text("E", -r1 + 10, 0);
	text("W", +r1 - 10, 0);
	fill(0, 0);
	stroke(50, 50);
	fill(0, 0);
	beginShape();
	targets.forEach(point => vertex(point.x, point.y));
	endShape();
	//targets.forEach(point => drawX(1, 5,point.x,point.y));stroke(0, 200, 200);
	stroke(0, 200, 200, 100);
	drawX(1, 10, tx, ty);
	resetMatrix();

	//Draw the rotating head
	translate(r1 * 4, r1 + 30);
	translate(0, r2);
	rotate(ha);
	stroke(0, 0);
	fill(100);
	circle(0, 0, 30);
	fill(100, 100);
	rect(-10, 0, 20, -r2);
	fill(0, 0);
	stroke(200, 0, 0);
	line(0, 0, 0, -r2);
	drawX(0, 5, 0, -r2);
	resetMatrix();


	//Draw Desired plate angle
	translate(r1 * 4, r1 + 30);
	stroke(0, 255, 255);
	setLineDash([10, 10]);
	arc(0, 0, r1 * 2 + 5, r1 * 2 + 5, -HALF_PI, -HALF_PI + paD);
	setLineDash([0]);
	resetMatrix();

	//Draw Desired head angle
	translate(r1 * 4, r1 + 30);
	translate(0, r2);
	stroke(200, 0, 0);
	setLineDash([10, 10]);
	//circle(0, 0, r2 * 2);
	arc(0, 0, r2 * 2, r2 * 2, -HALF_PI, -HALF_PI + haD);
	setLineDash([0]); //longer stitches
	resetMatrix();
}

//----------- PRINT DEBUG INFO ----------------------------------------------------------------------//
function drawDebug() {
	debugString = "";
	debugString += "plate angle:	" + round(pa * 180 / PI, 2) + "°\n";
	debugString += "plate goal:		" + round(paD * 180 / PI, 2) + "°\n";
	debugString += "plate error:	" + round((pa - paD) * 180 / PI, 2) + "°\n\n";

	debugString += "head angle:	" + round(ha * 180 / PI, 2) + "°\n";
	debugString += "head goal:	" + round(haD * 180 / PI, 2) + "°\n";
	debugString += "head error:	" + round((ha - haD) * 180 / PI, 2) + "°\n\n";

	debugString += "target:	" + currentTarget + "	/	" + targets.length + "\n";
	debugString += "tx:" + round(tx, 0) + "\n";
	debugString += "ty:" + round(ty, 0) + "\n\n";

	translate(20, r1 + r2 + 50);
	textAlign(LEFT, TOP);
	textSize(20);
	stroke(0);
	fill(0, 100);
	rect(-10, -10, width - 20, height - r1 - 50 - r2);
	noStroke();
	fill(255);
	text(debugString, 0, 0);
	resetMatrix();
}

//----------- UTILITY FUNCTIONS ---------------------------------------------------------------------//
function drawX(a, s, x, y) {
	push();
	translate(x, y);
	rotate(QUARTER_PI * a);
	strokeWeight(2);
	line(-s, 0, s, 0);
	line(0, -s, 0, s);
	pop();
}

function setLineDash(list) {
	drawingContext.setLineDash(list);
}

function normalizeAngle(a) {
	return (a + TWO_PI) % TWO_PI;
}
