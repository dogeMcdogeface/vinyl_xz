
//----------- USER INTERFACE CONSTANTS --------------------------------------------------------------//
const inputSmoothing = 5.;
const targetMinDist = 10;

let targetIndex = 0;
let targets = [];

let readOuts = [];

function setup() {
    const sketchCanvas = createCanvas(real.disk.radius * 5 + 20, real.disk.radius + real.head.radius + 100);
    sketchCanvas.parent(document.getElementById('canvas-holder'));
    frameRate(1000);
    textAlign(CENTER, CENTER);
    setupSystems();
}

function draw() {
    getUserInput();
    computeSystems()
    render();
    debug();
}


//----------- GET TARGET TO TRACK FROM MOUSE INPUT --------------------------------------------------//
function getUserInput() {
    let mouseV = createVector(mouseX - real.disk.radius - 10, mouseY - real.disk.radius - 30);
    mouseV.limit(real.disk.radius - 5);

    if (!targets.length) {
        //if there are no targets, move target point following mouse
        target.x -= (target.x - mouseV.x) / inputSmoothing;
        target.y -= (target.y - mouseV.y) / inputSmoothing;
    } else {
        if (abs(goal.disk.angle - sens.disk.angle) < 0.02 && abs(goal.head.angle - sens.head.angle) < 0.02) {
            targetIndex += 1;
        }
        targetIndex %= targets.length;
        target =  targets[targetIndex];
    }

    readOuts = readOuts.slice(readOuts.length - 1000);
    if(!targets.length || targetIndex === 0 ) readOuts = readOuts.slice(readOuts.length - 1);

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


//----------- PRINT DEBUG INFO ----------------------------------------------------------------------//
let debugObj = {};

let trackFPS = [];
setInterval(()=>{
    debugObj.stat.minFPS = round(Math.min(...trackFPS), 1);
    debugObj.stat.avgFPS = round(arrAvg(trackFPS), 1);
    trackFPS = [];
}, 1000);

function debug() {
    debugObj.stat = !debugObj.stat ? {} : debugObj.stat;
    trackFPS[trackFPS.length] = frameRate();
    debugObj.stat.fps = round(frameRate(),1);

    debugObj.target = {
        x: `${round(target.x, 0)}`,
        y: `${round(target.y, 0)}`,
        curr: `${targetIndex} / ${targets.length}`,
    };



    debugObj.goal = goal.debug();
    debugObj.real = real.debug();
    debugObj.sens = sens.debug();
    debugObj.diskPID =  {
        pid: `${real.disk.PID.p}\t| ${real.disk.PID.i}\t| ${real.disk.PID.d}`,
        e: `${round(real.disk.PID.lastError, 5)}`,
    };
    debugObj.headPID =  {
        pid: `${real.head.PID.p}\t| ${real.head.PID.i}\t| ${real.head.PID.d}`,
        e: `${round(real.head.PID.lastError, 5)}`,
    };
    displayDebug(debugObj);
}

//----------- DRAW GRAPHICS -------------------------------------------------------------------------//
function render() {
    background(70);
    //--------- DRAW USER INPUT ----------------------------------------//
    translate(10, 30);
    push();
    translate(real.disk.radius, real.disk.radius);
    stroke(0, 0);
    fill(200);
    textSize(20);
    text("BUILD PLATE", 0, -real.disk.radius - 15);
    drawdisk(real.disk.radius);
    stroke(50, 50);
    targets.forEach(point => drawPT(1, 5, point.x, point.y));
    for (let i = 1; i < readOuts.length; i++) {
        stroke(50 + (200*i/readOuts.length),0,0, 255);
        line(readOuts[i].x, readOuts[i].y, readOuts[i - 1].x, readOuts[i - 1].y);
    }
    stroke(0, 200, 200, 100);
    if (targets.length === 0) stroke(0, 0, 200, 100);
    drawPT(1, 10, target.x, target.y);
    pop();

    //--------- DRAW BUILD TABLE ---------------------------------------//
    translate(real.disk.radius * 4, real.disk.radius);
    push();
    stroke(0, 0);
    fill(200);
    textSize(20);
    text("BUILD PLATE + PRINT HEAD", 0, -real.disk.radius - 15);
    rotate(real.disk.angle);
    drawdisk(real.disk.radius);
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

    //--------- DRAW DESIRED disk ANGLE -------------------------------//
    push();
    fill(0, 0);
    stroke(0, 255, 255);
    drawAngle(real.disk.radius * 2 + 5, goal.disk.angle);
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

function drawdisk(r) {
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

const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
