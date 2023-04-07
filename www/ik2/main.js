
//----------- USER INTERFACE CONSTANTS --------------------------------------------------------------//
const inputSmoothing = 5.;
const targetMinDist = 10;

let targetIndex = 0;
let targets = [];

function setup() {
    const sketchCanvas = createCanvas(real.plate.radius * 5 + 20, real.plate.radius + real.head.radius + 100);
    sketchCanvas.parent(document.getElementById('canvas-holder'));
    frameRate(1000);
    textAlign(CENTER, CENTER);
}

function draw() {
    getUserInput();
    computeSystems()
    render();
    debug();
}


//----------- GET TARGET TO TRACK FROM MOUSE INPUT --------------------------------------------------//
function getUserInput() {
    let mouseV = createVector(mouseX - real.plate.radius - 10, mouseY - real.plate.radius - 30);
    mouseV.limit(real.plate.radius - 5);

    if (!targets.length) {
        //if there are no targets, move target point following mouse
        target.x -= (target.x - mouseV.x) / inputSmoothing;
        target.y -= (target.y - mouseV.y) / inputSmoothing;
    } else {
        if (abs(real.plate.angle - goal.plate.angle) < 0.002) {
            targetIndex += 1;
        }
        targetIndex %= targets.length;
        target =  targets[targetIndex];
    }

    if (mouseIsPressed) {
        if (mouseButton === RIGHT) {
            targets = [];
        } else if (mouseButton === LEFT && targets.every(p => dist(mouseV.x, mouseV.y, p.x, p.y) >= targetMinDist)) {
            targets[targets.length] = {
                x: mouseV.x,
                y: mouseV.y
            };
        }
    }
}

//----------- DRAW GRAPHICS -------------------------------------------------------------------------//
function render() {
    background(70);
    //--------- DRAW USER INPUT ----------------------------------------//
    translate(10, 30);
    push();
    translate(real.plate.radius, real.plate.radius);
    stroke(0, 0);
    fill(200);
    textSize(20);
    text("BUILD PLATE", 0, -real.plate.radius - 15);
    drawPlate(real.plate.radius);
    stroke(50, 50);
    targets.forEach(point => drawPT(1, 5, point.x, point.y));
    stroke(0, 200, 200, 100);
    if (targets.length === 0) stroke(0, 0, 200, 100);
    drawPT(1, 10, target.x, target.y);
    pop();

    //--------- DRAW BUILD TABLE ---------------------------------------//
    translate(real.plate.radius * 4, real.plate.radius);
    push();
    stroke(0, 0);
    fill(200);
    textSize(20);
    text("BUILD PLATE + PRINT HEAD", 0, -real.plate.radius - 15);
    rotate(real.plate.angle);
    drawPlate(real.plate.radius);
    fill(0, 0);
    stroke(50, 50);
    for (let i = 1; i < targets.length; i++) {
        if (i > targetIndex) stroke(0, 200, 200, 100);
        line(targets[i].x, targets[i].y, targets[i - 1].x, targets[i - 1].y);
    }
    stroke(0, 200, 200, 100);
    drawPT(1, 10, target.x, target.y);
    pop();

    //--------- DRAW PRINT HEAD ----------------------------------------//
    push();
    translate(0, real.head.radius);
    rotate(real.head.angle);
    drawHead(real.head.radius);
    drawPT(0, 5, 0, -real.head.radius);
    pop();

    //--------- DRAW DESIRED PLATE ANGLE -------------------------------//
    push();
    fill(0, 0);
    stroke(0, 255, 255);
    drawAngle(real.plate.radius * 2 + 5, goal.plate.angle);
    pop();

    //--------- DRAW DESIRED HEAD ANGLE --------------------------------//
    push();
    translate(0, real.head.radius);
    fill(0, 0);
    stroke(200, 0, 0);
    drawAngle(real.head.radius * 2, goal.head.angle);
    pop();
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


