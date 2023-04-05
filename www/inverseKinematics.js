function setup() {
	createCanvas(900, 900);
	frameRate(1000)
	textAlign(CENTER, CENTER);
}

const r1 = 150;
const r2 = 200;

const inputSmoothing = 5.

a1 = 0.0; //plate angle
a2 = 0.0; //head angle
tx = 0; //target position on the build plate
ty = 0; //
p1x = 0; //target position in space (as plate rotates)
p1y = 0; //
hx = 0; //head position
hy = 0; //

function draw() {
	background(70);
	getInput();
	trackPoint();
	drawPrinter();
	drawDebug();
}

function trackPoint() {
	//distance of target from center of plate
	to = sqrt(tx * tx + ty * ty);
	//find for what head angle the head is at the same distance from center as the target
	a2 = acos(((2 * r2 * r2) - (to * to)) / (2 * r2 * r2));
	//track the position of the head after rotating
	hx = sin(a2) * (r2);
	hy = -cos(a2) * (r2) + r2;
	//rotate the plate to meet head
	a1 = PI - (2 * atan((sqrt(tx * tx + ty * ty - hx * hx) + ty) / (tx - hx)));
	//track the position of our target after rotating the plate
	p1x = cos(a1) * (tx) - sin(a1) * (ty);
	p1y = sin(a1) * (tx) + cos(a1) * (ty);
}


function getInput() {
	//move target point following mouse
	mouseV = createVector(mouseX - r1, mouseY - r1);
	mouseV.limit(r1 - 5);
	tx -= (tx - mouseV.x) / inputSmoothing;
	ty -= (ty - mouseV.y) / inputSmoothing;
}

function drawPrinter() {
	textAlign(CENTER, CENTER);

	//Draw the user input
	translate(r1 + 10, r1 + 10);
	fill(255, 255, 255);
	circle(0, 0, r1 * 2);
	line(0, 0, 0, -r1);
	fill(200);
	textSize(15);
	text("N", 0, -r1 + 10);
	text("S", 0, +r1 - 10);
	text("E", -r1 + 10, 0);
	text("W", +r1 - 10, 0);

	fill(0, 200, 200, 100);
	textSize(50);
	text("x", tx, ty);

	resetMatrix();

	//Draw the build plate
	translate(r1 * 4, r1 + 10);
	rotate(a1);
	fill(255, 255, 255);
	circle(0, 0, r1 * 2);
	line(0, 0, 0, -r1);
	fill(200);
	textSize(15);
	text("N", 0, -r1 + 10);
	text("S", 0, +r1 - 10);
	text("E", -r1 + 10, 0);
	text("W", +r1 - 10, 0);
	resetMatrix();

	fill(0, 200, 200, 100);
	textSize(50);
	//Draw the target point on the plate
	translate(r1 * 4, r1 + 10);
	rotate(a1);
	resetMatrix();

	//Draw the rotating head
	fill(100, 100, 0, 50);
	translate(r1 * 4, r1 + 10);
	translate(0, r2);
	rotate(a2);
	//circle(0,0, r2*2);
	arc(0, 0, r2 * 2, r2 * 2, -PI / 2 - PI / 4, -PI / 2 + PI / 4);
	line(0, 0, 0, -r2);
	resetMatrix();

	//Draw the calculated position of the target after rotating plate
	translate(r1 * 4, r1 + 10);
	fill(0, 200, 200, 100);
	text("x", p1x, p1y);
	resetMatrix();

	//Draw the calculated position of the head
	translate(r1 * 4, r1 + 10);
	fill(200, 0, 0, 100);
	text("+", hx, hy);
	resetMatrix();
}

function drawDebug() {
	debugString = "";
	debugString += "plate angle:	" + round(a1 * 180 / PI, 2) + "°\n";
	debugString += "head angle:	" + round(a2 * 180 / PI, 2) + "°\n\n";
	debugString += "tx:" + round(tx, 0) + "\n";
	debugString += "ty:" + round(ty, 0) + "\n";

	translate(20, r1 + r2 + 50);
	textAlign(LEFT, TOP);
	textSize(20);
	fill(0, 100);
	rect(-10, -10, width - 20, height - r1 - 50 - r2);
	fill(255);
	text(debugString, 0, 0);
	resetMatrix();
}
