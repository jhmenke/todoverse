let x = 100;
let y = 100;
let sz = 100;
var bg;

// universe definition (planets and running state)
let universe = [];
let universe_stopped = false;

// active editing element
let editing_input = null;
let editing_planet = null;
let editing_current_text = null;

// active moving element
let moving_planet = null;

function setup() {
  bg = loadImage('assets/img/universe.png');
  // bg = color("black");

  // createCanvas(windowWidth, windowHeight);
  createCanvas(1140, 1080);
 
  // create example star system
  universe.push(new Planet(0, "Project 1", null, 500, 300));
  universe.push(new Planet(1, "To Do 1", universe[0]));
  universe.push(new Planet(2, "To Do 2", universe[0]));

  // frameRate(30);
  button = createButton("New To Do");
  button.position(50, 50);
  button.mousePressed(createPlanet);
}

function keyPressed() {
  // finish editing of a label on a planet
  if (universe_stopped && (keyCode == ENTER || keyCode == ESCAPE)) {
    editing_planet.label = createPlanetLabel(editing_planet, keyCode == ESCAPE ? editing_current_text : editing_input.value(), editing_planet.big);
    editing_input.remove();
    editing_input = null;
    editing_planet = null;
    editing_current_text = null;
    universe_stopped = false;
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    // begin dragging of planet
    // universe_stopped = true;
    var p = intersectingPlanet(mouseX, mouseY);
    if (p != null && !p.anythingAttached()) {
      p.drag_offset = [(mouseX - p.pos.x), (mouseY - p.pos.y)];
      moving_planet = p;
    }
  } else if (mouseButton == RIGHT) {
    // to do: disable right click, this does not work
    return false;
  }
}

function mouseReleased() {
  // if (universe_stopped) {
  //   universe_stopped = false;
  // }
  if (moving_planet != null) {
    // release a dragged planet
    radius = moving_planet.big / 2;
    var new_x = mouseX - moving_planet.drag_offset[0];
    var new_y = mouseY - moving_planet.drag_offset[1];
    moving_planet.updatePos(createVector(new_x, new_y));
    moving_planet = null;
    return false;
  }
}

function mouseDragged() {
  if (mouseButton == LEFT && moving_planet != null) {
    // check if the new position of the dragged planet is on an orbit and assign it
    // if ((mouseX < moving_planet.pixel_overlay[0] || mouseX > moving_planet.pixel_overlay[2]) || (mouseY < moving_planet.pixel_overlay[1] || mouseY > moving_planet.pixel_overlay[3])) {
    radius = moving_planet.big / 2;
    var new_x = mouseX - moving_planet.drag_offset[0];
    var new_y = mouseY - moving_planet.drag_offset[1];
    moving_planet.updatePos(createVector(new_x, new_y));
    changeOrbit(moving_planet);
    // }
    return false;
  }
}

function draw() {
  // redraw the GUI
  background(bg);
  for (planet of universe) {
    planet.render();
  }
}

function intersectsWithPlanet(x, y) {
  // check if position [x, y] intersects with a planet's current position
  for (planet of universe) {
    radius = planet.big / 2;
    if(dist(planet.pos.x + radius, planet.pos.y + radius, x, y) <= radius) {
      return true;
    }
  }
  return false;
}

function intersectingPlanet(x, y) {
  // return the intersecting planet if position [x, y] intersects with a planet, else return null
  for (planet of universe) {
    radius = planet.big / 2;
    if(dist(planet.pos.x + radius, planet.pos.y + radius, x, y) <= radius) {
      return planet;
    }
  }
  return null;
}

function changeOrbit(moving_planet) {
  // change the orbit of the planet "moving_planet"
  for (planet of universe) {
    if (planet.level > 0) {
      continue;
    }
    var p = 0;
    var found_orbit = -1;
    var found_angle = -1;
    var orb = null;
    for (var orbit in planet.orbit_lines) {
      orb = planet.orbit_lines[orbit];
      for (var a = 0; a < 2 * Math.PI; a+= 0.05) {
        p = createVector(orb[0] - mouseX + orb[2] * Math.cos(a), orb[1] - mouseY + orb[2] * Math.sin(a))
        if (Math.abs(p.x) < 30 && Math.abs(p.y) < 30) {
          found_orbit = orbit;
          found_angle = a;
          break;
        }
      }
      if (found_orbit > 0) {
        // console.log("assigning to orbit ", orbit, " at ", found_angle, " Rd");
        moving_planet.assignOrbit(planet, orbit, found_angle);
        return;
      } else {
        if (moving_planet.level > 0) {
          moving_planet.removeOrbit(createVector(mouseX, mouseY));
        }
      }
    }
  }
}

function createPlanet() {
  // create a new planet on the top left of the screen (triggered by button)
  // x / y are top left of the planet. get to the center by adding the radius to x and y
  var new_planet_pos_x = 50;
  var new_planet_pos_y = 100;
  var level_0_planet_radius = 100 / 2;
  if (!intersectsWithPlanet(new_planet_pos_x + level_0_planet_radius, 
                            new_planet_pos_y + level_0_planet_radius)) {
    var p = new Planet(0, "New", null, 50, 100);
    universe.push(p);
  }
}
