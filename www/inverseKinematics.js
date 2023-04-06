const r1 = 150;
const r2 = 200;

const inputSmoothing = 5.


function setup() {
	var parent = document.getElementById('canvas-holder');
	if(parent){
		var sketchCanvas = createCanvas(parent.offsetWidth, parent.offsetHeight);
		sketchCanvas.parent("canvas-holder");
	}else{
		createCanvas(900, 900);
	}
	frameRate(1000)
}

pa = 0.0; //Current plate angle
ha = 0.0; //Current head angle
paD = 0.0; //Desired plate angle
haD = 0.0; //Desired head angle
tx = 0; //target position on the build plate
ty = 0; //


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
	ha = acos(((2 * r2 * r2) - (to * to)) / (2 * r2 * r2));
	//track the position of the head after rotating
	hx = sin(ha) * (r2);
	hy = -cos(ha) * (r2) + r2;
	//rotate the plate to meet head
	pa = PI - (2 * atan((sqrt(tx * tx + ty * ty - hx * hx) + ty) / (tx - hx)));
	//track the position of our target after rotating the plate
	tx1 = cos(pa) * (tx) - sin(pa) * (ty);
	ty1 = sin(pa) * (tx) + cos(pa) * (ty);
}


function getInput() {
	//move target point following mouse
	mouseV = createVector(mouseX - r1 - 10, mouseY - r1 - 30);
	mouseV.limit(r1 - 5);
	tx -= (tx - mouseV.x) / inputSmoothing;
	ty -= (ty - mouseV.y) / inputSmoothing;
}

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
	stroke(0, 255, 255);
	setLineDash([10, 10]);
	arc(0, 0, r1 * 2 + 5, r1 * 2 + 5, -HALF_PI - pa, -HALF_PI);
	setLineDash([0]); //longer stitches
	//Draw the calculated position of the target after rotating plate
	stroke(0, 200, 200);
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
	setLineDash([10, 10]);
	//circle(0, 0, r2 * 2);
	arc(0, 0, r2 * 2, r2 * 2, -HALF_PI - ha, -HALF_PI);
	setLineDash([0]); //longer stitches
	stroke(200, 0, 0, 100);
	drawX(0, 5, 0, -r2);
	resetMatrix();
}

function drawDebug() {
	debugString = "";
	debugString += "plate angle:	" + round(pa * 180 / PI, 2) + "°\n";
	debugString += "head angle:	" + round(ha * 180 / PI, 2) + "°\n\n";
	debugString += "tx:" + round(tx, 0) + "\n";
	debugString += "ty:" + round(ty, 0) + "\n";

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
