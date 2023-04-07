class Rotor {
    constructor(r) {
        this.angle = r && r.angle || 0;
        this.speed = r && r.speed || 0;
        this.accel = r && r.accel || 0;
        this.mass = r && r.mass || 0;
        this.radius = r && r.radius || 0;
    }

    moveTo(newAngle) {	// TODO implement physics motion here...
        this.angle -= (this.angle - newAngle) / 6;

        //angle += speed
        //speed += accel
        //accel = force/mass

        this.angle = normalizeAngle(this.angle);
    }
}

class System {
    constructor(p, h) {
        this.plate = new Rotor(p);
        this.head = new Rotor(h);
    }
}