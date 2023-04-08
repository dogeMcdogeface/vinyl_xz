//----------- PHYSICS CONSTANTS ---------------------------------------------------------------------//
const TIME_SECOND = 1000;

const PI = Math.PI;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;

const MOTOR_TORQUE = 200000; // g*m^2/s^2

//----------- ROTOR CLASS ---------------------------------------------------------------------------//
class Rotor {
    constructor(r) {
        this.maxTorque = r && r.maxTorque || MOTOR_TORQUE; // g*m^2/s^2
        this.maxAccel = r && r.maxAccel || 0;       // rad/sec
        this.maxSpeed = r && r.maxSpeed || 0;       // rad/sec^2
        this.torque = r && r.torque || 0;           // g*m^2/s^2
        this.accel = r && r.accel || 0;             // rad/sec^2
        this.speed = r && r.speed || 0;             // rad/sec
        this.angle = r && r.angle || 0;             // rad
        this.mass = r && r.mass || 0;               // g
        this.radius = r && r.radius || 0;           // mm
        this.PID = r && r.PID || {p: .0, i: .0, d: .0};
    }

    moveTo(newAngle) {   //Rough lerp towards angle
        this.angle -= (this.angle - newAngle) / 6;
        this.angle = normalizeAngle(this.angle);
    }

    update(){
        let delta = this.last === undefined ? 0 : Date.now() - this.last;
        this.angle += this.speed * delta / TIME_SECOND;
        this.speed += this.accel * delta / TIME_SECOND;
        this.accel = this.torque/this.mass;
        this.angle = normalizeAngle(this.angle);
        this.last = Date.now();
    }

    set torque(v) {this._torq =  clampIfExist(v, this.maxTorque); }
    set accel(v) {this._accel =  clampIfExist(v, this.maxAccel); }
    set speed(v) {this._speed =  clampIfExist(v, this.maxSpeed); }
    get torque(){return this._torq;}
    get accel(){return this._accel;}
    get speed(){return this._speed;}
}

//----------- SYSTEM CLASS --------------------------------------------------------------------------//
class System {
    constructor(p, h) {
        this.disk = new Rotor(p);
        this.head = new Rotor(h);
    }

    autoUpdate(t) {
       return this.updateTimer = setInterval(() => {
            this.disk.update();
            this.head.update();
        }, t);
    }

    debug(){
        return {
            diskA: `${round(this.disk.angle * 180 / PI, 2)}°`,
            diskS: `${round(this.disk.speed,3)}`,
            diskAc: `${round(this.disk.accel, 3)}`,
            diskTorq: `${round(this.disk.torque, 0)}`,
        };
    }
}


//----------- UTILITY FUNCTIONS ---------------------------------------------------------------------//
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const clampIfExist = (num, max) => !max ? num : clamp(num, -max, max);
const normalizeAngle = (a) => (a + TWO_PI) % TWO_PI;