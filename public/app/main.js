/*
 Name: Yineng Wang
 Class: CS3200 Computer Simulations
 Project Name: Solar System Orbit Simulation
 References & Inspiration:
 Michael Chang: Making 100,000 Stars
 Pablo Terres & Robert Lord: Project Kepler
 */
animation.init();
// Align top-left

animation.addControls('speedSlider');

function addPlanetToFocusOptions(planetId) {
    var node = document.createElement("option");
    node.value = planetId;
    node.innerHTML = "Planet #" + (planetId + 1);
    document.getElementById("focus").appendChild(node);
}


function simulateHome() {
    animation.addSun(0.6955, 0, 0, 0, "sun.jpg", { mass: 1.988435e30 });
    animation.addPlanet(0.0024397, 50.32, 0, 0, "mercury.jpg", { mass: 3.30104e23, vel: new THREE.Vector3(0, 0, 4.74e-5) });
    animation.addPlanet(0.0060519, 108.8, 0, 0, "venus.jpg", { mass: 4.86732e24, vel: new THREE.Vector3(0, 0, 3.5e-5) });
    animation.addPlanet(0.0063674447, 150, 0, 0, "earth.jpg", { mass: 5.9721986e24, vel: new THREE.Vector3(0, 0, 2.963e-5) });
    animation.addPlanet(0.003386, 227.94, 0, 0, "mars.jpg", { mass: 6.41693e23, vel: new THREE.Vector3(0, 0, 0.0000228175) });
    animation.addPlanet(0.069173, 778.33, 0, 0, "jupiter.jpg",  { mass: 1.89813e27, vel: new THREE.Vector3(0, 0, 0.0000129824) });
    animation.addPlanet(0.057316, 1429.4, 0, 0, "saturn.jpg",  { mass: 5.68319e26, vel: new THREE.Vector3(0, 0, 9.280e-6) });
    animation.addPlanet(0.025266, 2870.99, 0, 0, "uranus.jpg",  { mass: 8.68103e25, vel: new THREE.Vector3(0, 0, 6.509e-6) });
    animation.addPlanet(0.024553, 4504, 0, 0, "neptune.jpg",  { mass: 1.0241e26, vel: new THREE.Vector3(0, 0, 5.449e-6) });

    for (var i = 0; i < 8; i++) {
        addPlanetToFocusOptions(i);
    }

    animation.run('input', 'model');
}

function simulateJupiter() {
    animation.addSun(0.6955, 0, 0, 0, "sun.jpg", { mass: 1.988435e30 });
    // Jupiter at Mars' distance.
    animation.addPlanet(0.069173, 227.94, 0, 0, "jupiter.jpg",  { mass: 1.89813e27, vel: new THREE.Vector3(0, 0, 0.0000129824) });
    addPlanetToFocusOptions(0);

    animation.run('input', 'model');
}

function simulateMercury() {
    animation.addSun(0.6955, 0, 0, 0, "sun.jpg", { mass: 1.988435e30 });
    // Mercury at Mars' distance.
    animation.addPlanet(0.0024397, 227.94, 0, 0, "mercury.jpg", { mass: 3.30104e23, vel: new THREE.Vector3(0, 0, 4.74e-5) });
    addPlanetToFocusOptions(0);

    animation.run('input', 'model');
}
document.getElementById('preload').onchange = function() {
    if (this.value === 'home') {
        simulateHome();
    } else if (this.value === 'jupiter') {
        simulateJupiter();
    } else if (this.value === 'mercury') {
        simulateMercury();
    }
};

document.getElementById("pauseButton").onclick = function() {
    animation.togglePause();
};

document.getElementById("focus").onchange = function() {
    if (+this.value === -1) {
        animation.focusOnSun();
    } else {
        animation.focusOnPlanet(+this.value);
    }
}