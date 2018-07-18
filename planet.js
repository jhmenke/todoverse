class Planet {
    constructor(level, label, sun=null, x=-1, y=-1) {
        // basic data
        this.level = 0;
        this.planets = {};
        this.orbit_lines = {};
        this.big = 100 - 10 * this.level;
        this.circle = createCircleShape(this.big);
        this.label = createPlanetLabel(this.circle, label);
        this.drag_offset = [0, 0];

        // motion
        this.updatePos(createVector(x, y));
        this.speed = radians(0.1); // * Math.PI / 180;
        if (level > 0) {
            this.assignOrbit(sun, level, random(0, 2 * Math.PI));
        } else {
            if (x < 0 || y < 0) {
                alert("invalid x / y -> " + x + " / " + y);
            } else {
                this.updatePos(createVector(x, y));
            }
        }
    }
}

Planet.prototype.assignOrbit = function(star, level, angle) {
    // assign this planet to the orbit of the given star. level defines the distance and angle the initial position in the orbit
    this.star = star;
    this.level = level;
    this.distance = 150 * level;
    this.angle = angle;
    this.updatePos(createVector(Math.cos(this.angle) * this.distance, Math.sin(this.angle) * this.distance));
    this.star_pos = this.star.pos.copy();
    this.star.addToOwnOrbit(this, this.level);
}

Planet.prototype.updatePos = function(pos) {
    // update the position of the planet
    this.pos = pos;
    this.pixel_overlay = [this.pos.x, this.pos.y, this.pos.x + this.big, this.pos.y + this.big];
}

Planet.prototype.addToOwnOrbit = function(planet, level) {
    // add a new planet to this planets orbit. this planet is now a star.
    if(!this.planets.hasOwnProperty(level)) {
        this.planets[level] = [planet];
    } else {
        this.planets[level].push(planet);
    }
    if (!this.orbit_lines.hasOwnProperty(level)) {
        // create orbit line circle, if it does not exist yet
        // [center_x, center_y, radius]
        var new_orbit = [this.pos.x + this.big / 2, this.pos.y + this.big / 2, planet.distance];
        this.orbit_lines[level] = new_orbit;
    }
}

Planet.prototype.removeFromOwnOrbit = function(remove_planet) {
    // remove a planet from an orbit
    for (level in this.planets) {
        for(var j = 0; j < this.planets[level].size; j++) {
            if (this.planets[level][j] == remove_planet) {
                delete this.planets[level][j];
                return
            }
        }
    }
}

Planet.prototype.removeOrbit = function(new_pos) {
    // remove this planet from an active orbit 
    this.level = 0;
    this.distance = 0;
    this.star_pos = null;
    this.star.removeFromOwnOrbit(this);
    this.star = null;
    this.updatePos(new_pos);
}

Planet.prototype.anythingAttached = function() {
    // check if this planet is a star (= has planets attached in an orbit)
    if (this.level > 0) {
        return false;
    }
    for (level in this.planets) {
        // todo
        if (this.planets[level].size > 0) {
            console.log("has planets");
            return true;
        }
    }
    return false;
}

Planet.prototype.render = function() {
    // render the current planet with p5js
    if (this.level == 0) {   
        push();
        stroke('rgba(0, 255, 0, 0.5)');
        noFill();
        for (var property in this.orbit_lines) {
            if (this.orbit_lines.hasOwnProperty(property)) {
                var def = this.orbit_lines[property];
                ellipse(def[0], def[1], 2 * def[2], 2 * def[2]);
            }
        }
        pop();
    } else if (this.level > 0 && !universe_stopped) {
        this.angle += this.speed;
        var new_x = this.star_pos.x + (this.distance * Math.cos(this.angle));
        var new_y = this.star_pos.y + (this.distance * Math.sin(this.angle));
        this.pos = createVector(new_x, new_y);
    }
    this.circle.position(this.pos.x, this.pos.y);
}

function createPlanetLabel(planet, label) {
    // create a text label on this planet
    var pixels = planet.elt.attributes.big.value / 10 + 3;
    var lab = createDiv(label);
    lab.parent(planet);
    lab.addClass("content");
    lab.style("font-size: " + pixels.toString() + "px;");
    lab.doubleClicked(function () {
        if (!universe_stopped) {
            moving_planet = null;
            universe_stopped = true;
            editing_current_text = this.html();
            editing_input = createInput(editing_current_text);
            editing_input.parent(planet);
            editing_input.addClass("content");
            editing_planet = planet;
            this.remove();
        }
    });
    return lab;
}

function createCircleShape(big) {
    // create a CSS div with a circle/planet shape
    var cir = createDiv();
    cir.addClass("planet");
    cir.attribute("big", big);
    cir.style("height: " + big + "px; width: " + big + "px;");
    return cir;
}
