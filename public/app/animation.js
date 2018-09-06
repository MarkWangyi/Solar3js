/*
 Name: Yineng Wang
 Class: CS3200 Computer Simulations
 Project Name: Solar System Orbit Simulation
 References & Inspiration:
 Michael Chang: Making 100,000 Stars
 Pablo Terres & Robert Lord: Project Kepler
 */
var G = 6.67384e-11 // // gravitational constant
    , STEPS_PER_FRAME = 5000
    , METERS_PER_UNIT = 1000000000// 1 unit = 1x10^9 meters in Real Life.
    , SEC_PER_STEP = 8
    , MIN_GHOST_DISTANCE = 100
    , MAX_TRAIL_VERTICES = 50000 //trail length
    , MAX_GHOST_OPACITY = 0.15
    , GHOST_DISTANCE_SCALE = 150;

(function(exports) {
    //camera setting
    var graphics = {
        view_angle: 45,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 200000,

        _createCamera: function() {
            var camera = new THREE.PerspectiveCamera(this.view_angle,
                this.aspect,
                this.near,
                this.far);
            camera.position.set(0, 700, 0);
            return camera;
        },

        _createRenderer: function() {
            var renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);

            var container = document.getElementById("canvas");
            container.appendChild(renderer.domElement);

            return renderer;
        },

        init: function() {
            this.focus = new THREE.Vector3();
            this.scene = new THREE.Scene();
            this.camera = this._createCamera();
            this.renderer = this._createRenderer();
            this.ambientLight = new THREE.AmbientLight(0xCCCCCC);

            this.camera.lookAt(this.scene.position);
            this.scene.add(this.camera);
            this.scene.add(this.ambientLight);
        },

        _createTrail: function(x, y, z) {
            var trailGeometry = new THREE.Geometry();
            for (i = 0; i < MAX_TRAIL_VERTICES; i++) {
                trailGeometry.vertices.push(new THREE.Vector3(x, y, z));
            }
            var trailMaterial = new THREE.LineBasicMaterial();
            return new THREE.Line(trailGeometry, trailMaterial);
        },

        _createSphere: function(r, x, y, z, textureUrl, astro) {
            if (astro === undefined) {
                astro = {};
            }
            if (astro.vel === undefined) {
                astro.vel = new THREE.Vector3();
            }
            if (astro.trail === undefined) {
                astro.trail = this._createTrail(x, y, z);
            }

            var geometry = new THREE.SphereGeometry(r, 32, 16);
            var texture = THREE.ImageUtils.loadTexture(textureUrl);
            var material = new THREE.MeshBasicMaterial({ map: texture });
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(x, y, z);
            sphere.astro = astro;

            var ghostGeometry = new THREE.SphereGeometry(1, 32, 16);
            //var ghostTexture = THREE.ImageUtils.loadTexture(textureUrl);
            var ghostMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
            var ghostSphere = new THREE.Mesh(ghostGeometry, ghostMaterial);
            ghostSphere.position.set(x, y, z);
            sphere.astro.ghost = ghostSphere;
            return sphere;
        },

        addNewSphere: function(r, x, y, z, textureUrl, astro) {
            var sphere = this._createSphere(r, x, y, z, textureUrl, astro);

            this.scene.add(sphere);
            this.scene.add(sphere.astro.ghost);
            this.scene.add(sphere.astro.trail);

            return sphere;
        },

        removeSphere: function(sphere) {
            graphics.scene.remove(sphere);
        },

        focusCameraOn: function(newFocus) {
            // subtraction vector of the new focus minus the current one
            var focusVector = new THREE.Vector3();

            focusVector.subVectors(newFocus.position,
                this.focus.position);

            this.camera.position.add(focusVector);
            this.camera.lookAt(newFocus.position);

            this.focus = newFocus;
        },

        render: function() {
            this.renderer.render(this.scene, this.camera);
        },

        prepareFollowFocus: function() {
            if (typeof this.followFocusVector === 'undefined') {
                // Helper vector required to follow the focus. Create it only once and
                // mutate it as needed.
                this.followFocusVector = new THREE.Vector3();
            }
            this.followFocusVector.copy(this.focus.position);
        },

        followFocus: function() {
            this.followFocusVector.subVectors(this.focus.position,
                this.followFocusVector);
            this.camera.position.add(this.followFocusVector);
        }
    };


    function getDistance(v1, v2) {
        var x = v1.x - v2.x;
        var y = v1.y - v2.y;
        var z = v1.z - v2.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    function getAcceleration(distance, starMass) {
        return G * starMass / (Math.pow(distance, 2)); //  a = F/Msun = G*Msun*Mplanet/r^2/Msun = G*Mplanet/r^2
    }

    function leaveTrail(sphere) {
        sphere.astro.trail.geometry.vertices.unshift(new THREE.Vector3().copy(sphere.position));
        sphere.astro.trail.geometry.vertices.length = MAX_TRAIL_VERTICES;
        sphere.astro.trail.geometry.verticesNeedUpdate = true;
    }

    function updateVelocity(planet, star) {
        var vel = new THREE.Vector3();
        var speed;
        for(var i=0; i < STEPS_PER_FRAME; i++) {
            speed = getAcceleration(getDistance(star.position, planet.position) * METERS_PER_UNIT, star.astro.mass) * SEC_PER_STEP; // v = at
            vel.subVectors(star.position, planet.position).setLength(speed / METERS_PER_UNIT);
            planet.astro.vel.add(vel);

            planet.position.x += planet.astro.vel.x * SEC_PER_STEP;
            planet.position.y += planet.astro.vel.y * SEC_PER_STEP;
            planet.position.z += planet.astro.vel.z * SEC_PER_STEP;

            if (i % 10000 === 0) {
                leaveTrail(planet);
            }
        }
    }
    //the highlighting effect to help viewer find the position of planet even faraway, By Pablo Terres & Robert Lord
    function updateGhost(planet) {
        planet.astro.ghost.position.copy(planet.position);

        var distance = getDistance(graphics.camera.position, planet.position);
        if (distance < MIN_GHOST_DISTANCE) {
            planet.astro.ghost.material.opacity = 0;
        } else {
            planet.astro.ghost.scale.x = planet.astro.ghost.scale.y = planet.astro.ghost.scale.z = distance/GHOST_DISTANCE_SCALE;
            planet.astro.ghost.material.opacity = MAX_GHOST_OPACITY;
        }
    }

    function orbit(planet, star) {
        updateVelocity(planet, star);
        updateGhost(star);
        updateGhost(planet);
    }

    var animation = exports.animation = {
        init: function() {
            this.paused = false;

            graphics.init();

            this.sun = null;
            this.planets = [];
        },

        addSun: function(r, x, y, z, textureUrl, astro) {
            this.sun = graphics.addNewSphere(r, x, y, z, textureUrl, astro);
        },

        addPlanet: function(r, x, y, z, textureUrl, astro) {
            var planet = graphics.addNewSphere(r, x, y, z, textureUrl, astro);
            this.planets.push(planet);
        },

        addControls: function(sliderElementId) {
            this.controls = new THREE.OrbitControls(graphics.camera,
                graphics.renderer.domElement);

            var slider = document.getElementById(sliderElementId);
            slider.onchange = function() {
                STEPS_PER_FRAME = +this.value;
            };
        },

        focusOnSun: function() {
            graphics.focusCameraOn(this.sun);
        },
        focusOnPlanet: function(planetId) {
            graphics.focusCameraOn(this.planets[planetId]);
        },

        togglePause: function() {
            this.paused = !this.paused;
        },

        animate: function () {

            graphics.render();

            if (animation.sun && !animation.paused) {
                animation.sun.rotation.y += 0.05;
                graphics.prepareFollowFocus();
                for (var i = 0; i < animation.planets.length; i++) {
                    orbit(animation.planets[i], animation.sun);
                }
                graphics.followFocus();
                animation.controls.target.copy(graphics.focus.position);
            }

            window.requestAnimationFrame(animation.animate);

        },

        run: function(hideId, showId) {
            document.getElementById(hideId).style.display = "none";
            document.getElementById(showId).style.display = "block";

            this.paused = false;
            graphics.focus = this.sun;

            window.requestAnimationFrame(this.animate);
        },

        destroy: function() {
            this.paused = true;

            for (var p in this.planets) {
                graphics.removeSphere(this.planets[p].astro.ghost);
                graphics.removeSphere(this.planets[p].astro.trail);
                graphics.removeSphere(this.planets[p]);
            }
            graphics.removeSphere(this.sun.astro.ghost);
            graphics.removeSphere(this.sun);

            this.planets = [];
            this.sun = null;
        }
    };
})(this);