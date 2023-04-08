class Rotor {
    constructor(r) {
        this.angle = r && r.angle || 0;
        this.speed = r && r.speed || 0;
        this.accel = r && r.accel || 0;
        this.maxSpeed = r && r.maxSpeed || 0;
        this.maxAccel = r && r.maxAccel || 0;
        this.mass = r && r.mass || 0;
        this.radius = r && r.radius || 0;
    }

    moveTo(newAngle) {
        this.angle -= (this.angle - newAngle) / 6;
        this.angle = normalizeAngle(this.angle);
    }
}

class System {
    constructor(p, h) {
        this.plate = new Rotor(p);
        this.head = new Rotor(h);
    }
    debug(){
        return {
            plateA: `${round(this.plate.angle * 180 / PI, 2)}°`,
            plateS: `${round(this.plate.speed,5)}`,
            plateAc: `${round(this.plate.accel, 5)}`,
        };
    }
}