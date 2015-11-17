var canvas, ctx, gui, particles = [];
var gametime = new GameTime();

var settings = {
    idle: {
        particles: 0,
        color: [136, 255, 136],
        freeze: true
    },

    attract: {
        particles: Math.pow(2, 7),
        color: [255, 68, 0],
        radius: 100,
        strength: 15,
        freeze: false
    },

    repel: {
        particles: Math.pow(2, 8),
        color: [0, 136, 255],
        radius: 50,
        strength: 15,
        freeze: false
    },

    drawLines: true,
    elasticity: 0.75,
    friction: 0.002,
    gravity: 0,

    reset: reset,
    share: share
};

window.addEventListener('load', init, false);
window.addEventListener('resize', resizeHandler, false);

function init() {
    canvas = document.getElementById('canvas');
    canvas.addEventListener('click', clickHandler, false);

    ctx = canvas.getContext('2d');

    prepareSettings();
    prepareGUI();
    resizeHandler();
    reset();

    render();
}

function share() {
    window.location = 'share.php?settings=' + JSON.stringify(settings);
}

function prepareSettings() {
    if(typeof __SETTINGS__ === 'undefined') return;
    objectOverwrite(settings, __SETTINGS__);
}

function objectOverwrite(target, src) {
    for(var p in target) {
        if(typeof target[p] !== typeof src[p]) continue;

        if(typeof target[p] === 'object' && !Array.isArray(target[p])) {
            objectOverwrite(target[p],src[p]);
            continue;
        }

        target[p] = src[p];
    }
}

function prepareGUI() {
    var idle, attract, repel;

    gui = new dat.GUI();

    // idle folder
    idle = gui.addFolder('Idle');

    // idle settings
    idle.add(settings.idle, 'particles', 0, 512).step(1).onFinishChange(reset);
    idle.add(settings.idle, 'freeze').onChange(update);
    idle.addColor(settings.idle, 'color').onChange(update);

    // attract folder
    attract = gui.addFolder('Attract');

    // attract settings
    attract.add(settings.attract, 'particles', 0, 512).step(1).onFinishChange(reset);
    attract.add(settings.attract, 'radius', 1, 200).step(1).onFinishChange(update);
    attract.add(settings.attract, 'strength', 0, 300).step(5).onFinishChange(update);
    attract.add(settings.attract, 'freeze').onChange(update);
    attract.addColor(settings.attract, 'color').onChange(update);

    // repel folder
    repel = gui.addFolder('Repel');

    // repel settings
    repel.add(settings.repel, 'particles', 0, 512).step(1).onFinishChange(reset);
    repel.add(settings.repel, 'radius', 1, 200).step(1).onFinishChange(update);
    repel.add(settings.repel, 'strength', 0, 300).step(5).onFinishChange(update);
    repel.add(settings.repel, 'freeze').onChange(update);
    repel.addColor(settings.repel, 'color').onChange(update);

    // general settings
    gui.add(settings, 'elasticity', 0, 1).step(0.01).onFinishChange(update);
    gui.add(settings, 'friction', 0, 0.05).step(0.001).onFinishChange(update);
    gui.add(settings, 'gravity', 0, 80).step(2).onFinishChange(update);
    gui.add(settings, 'drawLines').onChange(update);

    // functions
    gui.add(settings, 'share');
    gui.add(settings, 'reset');
}

function addParticle(prop, behavior) {
    var p = new Particle(canvas, ctx, gametime);

    p.position.x = Math.floor(Math.random() * canvas.width);
    p.position.y = Math.floor(Math.random() * canvas.height);

    p.behavior = behavior;
    p.color = settings[prop].color;
    p.drawLine = settings.drawLines;
    p.elasticity = settings.elasticity;
    p.freeze = settings[prop].freeze;
    p.friction = settings.friction;
    p.gravity = settings.gravity;
    p.radius = settings[prop].radius || 0;
    p.strength = settings[prop].strength || 0;

    p.velocity.x = Math.random() * 2 - 1;
    p.velocity.y = Math.random() * 2 - 1;

    particles.push(p);
}

function render() {
    var i;

    requestAnimationFrame(render);
    gametime.update();

    ctx.globalCompositeOperation = 'over';
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'black';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';

    i = particles.length;
    while(i--) particles[i].update(particles);

    i = particles.length;
    while(i--) particles[i].render(particles);
}

function explode(pos, rad) {
    var i = particles.length;
    var angle, dist, strength, p;

    while(i--) { p = particles[i];
        angle = Point.getAngle(pos, p.position);
        dist = Point.getDistance(pos, p.position);
        strength = (rad / dist) * 20;

        p.velocity.x += Math.cos(angle) * strength;
        p.velocity.y += Math.sin(angle) * strength;
    }
}

function resizeHandler() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

function clickHandler(e) {
    explode(new Point(e.clientX, e.clientY), window.innerWidth);
}

function reset() {
    particles = [];
    var i;

    i = settings.idle.particles;
    while(i--) addParticle('idle', ParticleBehavior.IDLE);

    i = settings.attract.particles;
    while(i--) addParticle('attract', ParticleBehavior.ATTRACT);

    i = settings.repel.particles;
    while(i--) addParticle('repel', ParticleBehavior.REPEL);
}

function update() {
    var i = particles.length;
    var p;

    if(typeof settings.idle.color === 'object' && typeof settings.attract.color === 'object' && typeof settings.repel.color === 'object') {
        settings.idle.color = settings.idle.color.map(Math.floor);
        settings.attract.color = settings.attract.color.map(Math.floor);
        settings.repel.color = settings.repel.color.map(Math.floor);
    }

    while(i--) { p = particles[i];
        p.elasticity = settings.elasticity;
        p.friction = settings.friction;
        p.gravity = settings.gravity;
        p.drawLine = settings.drawLines;

        if(p.behavior === ParticleBehavior.IDLE) {
            p.color = settings.idle.color;
            p.freeze = settings.idle.freeze;
        } else if(p.behavior === ParticleBehavior.ATTRACT) {
            p.color = settings.attract.color;
            p.freeze = settings.attract.freeze;
            p.radius = settings.attract.radius;
            p.strength = settings.attract.strength;
        } else if(p.behavior === ParticleBehavior.REPEL) {
            p.color = settings.repel.color;
            p.freeze = settings.repel.freeze;
            p.radius = settings.repel.radius;
            p.strength = settings.repel.strength;
        }
    }
}


/* OBJECTS */

function Particle(canvas, ctx, gametime) {
    this.canvas = canvas;
    this.canvas.ctx = ctx;
    this.gametime = gametime;

    this.behavior = ParticleBehavior.ATTRACT;
    this.color = [255, 255, 255];
    this.drawLine = true;
    this.elasticity = 1;
    this.freeze = false;
    this.friction = 0.001;
    this.gravity = 0;
    this.position = new Point();
    this.velocity = new Point(0, 0);
    this.radius = 100;
    this.strength = 0.5;

    this._drawn = [];
}

Particle.prototype.update = function(particles) {
    var p, dist, angle;

    if(!this.freeze) {
        this.velocity.x /= (this.friction + 1);
        this.velocity.y /= (this.friction + 1);
        this.velocity.y += this.gravity * this.gametime.delta;
        this.position.x += this.velocity.x * this.gametime.delta;
        this.position.y += this.velocity.y * this.gametime.delta;
    }

    var i = particles.length;

    while(i--) { p = particles[i];
        if(this === p) continue;
        if(this.behavior === ParticleBehavior.IDLE && p.behavior === ParticleBehavior.IDLE) continue;
        if(this.behavior === ParticleBehavior.ATTRACT && p.behavior === ParticleBehavior.REPEL && this.radius === p.radius) continue;
        if(this.behavior === ParticleBehavior.REPEL && p.behavior === ParticleBehavior.ATTRACT && this.radius === p.radius) continue;

        dist = Point.getDistance(this.position, p.position);
        angle = Point.getAngle(this.position, p.position);

        if(dist < this.radius) {
            var strength = (this.radius / dist) * this.strength * this.gametime.delta;
            var xv = (Math.cos(angle) * 0.5) * strength;
            var yv = (Math.sin(angle) * 0.5) * strength;

            if(this.behavior === ParticleBehavior.ATTRACT) {
                if(!this.freeze) {
                    this.velocity.x += xv;
                    this.velocity.y += yv;
                }

                if(!p.freeze) {
                    p.velocity.x -= xv;
                    p.velocity.y -= yv;
                }
            } else if(this.behavior === ParticleBehavior.REPEL) {
                if(!this.freeze) {
                    this.velocity.x -= xv;
                    this.velocity.y -= yv;
                }

                if(!p.freeze) {
                    p.velocity.x += xv;
                    p.velocity.y += yv;
                }
            }
        }
    }

    if(this.position.x <= 0) {
        this.position.x = 0;
        this.velocity.x = -this.velocity.x * this.elasticity * this.gametime.delta;
    }

    if(this.position.x > canvas.width) {
        this.position.x = canvas.width;
        this.velocity.x = -this.velocity.x * this.elasticity * this.gametime.delta;
    }

    if(this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = -this.velocity.y * this.elasticity * this.gametime.delta;
    }

    if(this.position.y > canvas.height) {
        this.position.y = canvas.height;
        this.velocity.y = -this.velocity.y * this.elasticity * this.gametime.delta;
    }

    this._drawn.length = 0;
};

Particle.prototype.render = function(particles) {
    var p, dist, strength;
    var i = particles.length;

    var r, g, b;

    this.canvas.ctx.fillStyle = 'rgb( ' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ')';
    this.canvas.ctx.globalAlpha = 1;

    this.canvas.ctx.beginPath();
    this.canvas.ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2, true);
    this.canvas.ctx.fill();

    this.canvas.ctx.lineWidth = 1;

    while(this.drawLine && i--) { p = particles[i];
        if(this === particles[i]) continue;
        if(this.behavior === ParticleBehavior.IDLE && p.behavior === ParticleBehavior.IDLE) continue;

        dist = Point.getDistance(this.position, p.position);

        if(!this.radius || dist > this.radius) continue;
        if(p._drawn.indexOf(this) >= 0) continue;

        if(this.color !== p.color) {
            r = Math.floor((this.color[0] + p.color[0]) * 0.5);
            g = Math.floor((this.color[1] + p.color[1]) * 0.5);
            b = Math.floor((this.color[2] + p.color[2]) * 0.5);

            this.canvas.ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        } else {
            this.canvas.ctx.strokeStyle = 'rgb(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ')';
        }

        strength = 1 - (dist / this.radius);

        this.canvas.ctx.globalAlpha = strength;

        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(this.position.x, this.position.y);
        this.canvas.ctx.lineTo(particles[i].position.x, particles[i].position.y);
        this.canvas.ctx.stroke();

        this._drawn.push(p);
    }
};

function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Point.getDistance = function(p1, p2) {
    var xd = p2.x - p1.x;
    var yd = p2.y - p1.y;

    return Math.sqrt(xd * xd + yd * yd);
};

Point.getAngle = function(p1, p2) {
    var xd = p2.x - p1.x;
    var yd = p2.y - p1.y;

    return Math.atan2(yd, xd);
};

var ParticleBehavior = {
    IDLE: 0,
    ATTRACT: 1,
    REPEL: 2
};
