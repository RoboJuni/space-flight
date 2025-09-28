
import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `<div id="game-ui">
  <h1>Space Flight</h1>
  <div id="score">Score: 0</div>
  <div id="hits">Hits: 0</div>
  <div id="game-over" style="display:none; color:red; font-size:2em;">Game Over!</div>
</div>`;

const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
document.body.appendChild(renderer.domElement);

// Advanced Spaceship Model
const shipGroup = new THREE.Group();

// Main Hull
const hullShape = new THREE.Shape();
hullShape.moveTo(0, 0);
hullShape.lineTo(0.7, 0.2);
hullShape.lineTo(0.7, -0.2);
hullShape.lineTo(0, 0);

const extrudeSettings = {
    steps: 1,
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
};

const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0x3366cc,
    metalness: 0.8,
    roughness: 0.3,
});
const hull = new THREE.Mesh(hullGeometry, hullMaterial);
hull.rotation.y = Math.PI / 2;
shipGroup.add(hull);

// Advanced Cockpit
const cockpitGeometry = new THREE.SphereGeometry(0.12, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
const cockpitMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.9,
    metalness: 0.2,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
cockpit.position.set(0.25, 0, 0);
cockpit.rotation.z = -Math.PI / 2;
shipGroup.add(cockpit);

// Detailed Wings
const wingShape = new THREE.Shape();
wingShape.moveTo(0, 0);
wingShape.lineTo(0.4, 0.15);
wingShape.lineTo(0.5, 0);
wingShape.lineTo(0.4, -0.15);
wingShape.lineTo(0, 0);

const wingExtrudeSettings = {
    steps: 1,
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2
};

const wingGeometry = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc3333,
    metalness: 0.7,
    roughness: 0.3
});

const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(-0.1, -0.2, 0);
leftWing.rotation.y = Math.PI / 2;
shipGroup.add(leftWing);

const rightWing = leftWing.clone();
rightWing.position.set(-0.1, 0.2, 0);
shipGroup.add(rightWing);

// Engine Exhausts
const engineGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.1, 16);
const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.9,
    roughness: 0.4
});

const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
leftEngine.position.set(-0.3, -0.15, 0);
leftEngine.rotation.z = Math.PI / 2;
shipGroup.add(leftEngine);

const rightEngine = leftEngine.clone();
rightEngine.position.set(-0.3, 0.15, 0);
shipGroup.add(rightEngine);

// Collision Boxes
const collisionBoxes = [];
// Main hull collision box
const hullBox = new THREE.Box3();
hullBox.setFromObject(hull);
collisionBoxes.push(hullBox);
// Wing collision boxes
const leftWingBox = new THREE.Box3();
leftWingBox.setFromObject(leftWing);
collisionBoxes.push(leftWingBox);
const rightWingBox = new THREE.Box3();
rightWingBox.setFromObject(rightWing);
collisionBoxes.push(rightWingBox);

shipGroup.collisionBoxes = collisionBoxes;
shipGroup.position.z = 0;
scene.add(shipGroup);

let shipX = 0;
let shipY = 0;
let shipZ = 0;

// Lighting for 3D
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(1, 2, 3);
scene.add(dirLight);

// Starfield
function createStarfield(numStars = 300) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < numStars; i++) {
    positions.push((Math.random() - 0.5) * 8); // x
    positions.push((Math.random() - 0.5) * 6); // y
    positions.push(-Math.random() * 10); // z
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
createStarfield();

// Advanced Asteroid Creation
function createAsteroidFragment() {
    const radius = 0.1 + Math.random() * 0.08;
    const detail = 2;
    const geometry = new THREE.DodecahedronGeometry(radius, detail);
    
    // Distort vertices for irregularity
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        positions.setXYZ(
            i,
            x + (Math.random() - 0.5) * 0.05,
            y + (Math.random() - 0.5) * 0.05,
            z + (Math.random() - 0.5) * 0.05
        );
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.2,
        roughness: 0.8,
        flatShading: true
    });

    return new THREE.Mesh(geometry, material);
}

function createAsteroid() {
    const asteroidGroup = new THREE.Group();
    const fragmentCount = 3 + Math.floor(Math.random() * 3);
    
    // Create main body
    const mainFragment = createAsteroidFragment();
    asteroidGroup.add(mainFragment);
    
    // Add additional fragments
    for (let i = 0; i < fragmentCount; i++) {
        const fragment = createAsteroidFragment();
        fragment.scale.multiplyScalar(0.6);
        fragment.position.set(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        fragment.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        asteroidGroup.add(fragment);
    }
    
    // Set asteroid properties
    asteroidGroup.position.x = (Math.random() - 0.5) * 3;
    asteroidGroup.position.y = 2.5;
    asteroidGroup.position.z = (Math.random() - 0.5) * 1.5;
    asteroidGroup.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
    };
    
    // Create bounding sphere for collision detection
    const boundingSphere = new THREE.Sphere();
    const box = new THREE.Box3().setFromObject(asteroidGroup);
    box.getBoundingSphere(boundingSphere);
    asteroidGroup.boundingSphere = boundingSphere;
    
    scene.add(asteroidGroup);
    return asteroidGroup;
}

let asteroids = [];
let score = 0;
let hits = 0;
let gameOver = false;

function updateUI() {
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('hits').textContent = `Hits: ${hits}`;
  if (gameOver) {
    document.getElementById('game-over').style.display = 'block';
  }
}

// Controls
window.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') shipX -= 0.2;
  if (e.key === 'ArrowRight') shipX += 0.2;
  if (e.key === 'ArrowUp') shipY += 0.2;
  if (e.key === 'ArrowDown') shipY -= 0.2;
  shipX = Math.max(Math.min(shipX, 1.4), -1.4);
  shipY = Math.max(Math.min(shipY, 1.2), -1.2);
});

let asteroidTimer = 0;

// Create particle system for engine effects
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleMaterial = new THREE.PointsMaterial({
    color: 0xff6622,
    size: 0.02,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.7
});

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = 0;
    particlePositions[i * 3 + 2] = 0;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const engineParticles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(engineParticles);

function updateEngineParticles() {
    const positions = engineParticles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Update existing particles
        positions[i3] -= 0.01;
        if (positions[i3] < -0.3) {
            // Reset particle to engine position
            positions[i3] = -0.3;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }
    }
    engineParticles.geometry.attributes.position.needsUpdate = true;
}

function checkCollision(asteroid) {
    // Update asteroid's bounding sphere position
    asteroid.boundingSphere.center.copy(asteroid.position);
    
    // Check collision with each ship component
    for (const box of shipGroup.collisionBoxes) {
        // Update collision box position
        box.min.add(shipGroup.position);
        box.max.add(shipGroup.position);
        
        if (asteroid.boundingSphere.intersectsBox(box)) {
            // Reset collision box position
            box.min.sub(shipGroup.position);
            box.max.sub(shipGroup.position);
            return true;
        }
        
        // Reset collision box position
        box.min.sub(shipGroup.position);
        box.max.sub(shipGroup.position);
    }
    return false;
}

function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);

    // Update ship position and rotation with smooth interpolation
    const targetX = shipX;
    const targetY = shipY;
    shipGroup.position.x += (targetX - shipGroup.position.x) * 0.1;
    shipGroup.position.y += (targetY - shipGroup.position.y) * 0.1;
    shipGroup.position.z = shipZ;

    // Dynamic ship rotation based on movement
    const targetRotationZ = -shipX * 0.4; // Bank when moving left/right
    const targetRotationX = -shipY * 0.2; // Pitch when moving up/down
    shipGroup.rotation.z += (targetRotationZ - shipGroup.rotation.z) * 0.1;
    shipGroup.rotation.x += (targetRotationX - shipGroup.rotation.x) * 0.1;

    // Update engine particles
    updateEngineParticles();
    engineParticles.position.copy(shipGroup.position);
    engineParticles.position.x -= 0.3;

    asteroidTimer++;
    if (asteroidTimer % 50 === 0) {
        asteroids.push(createAsteroid());
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.position.y -= 0.04;
        
        // Complex rotation
        asteroid.rotation.x += asteroid.rotationSpeed.x;
        asteroid.rotation.y += asteroid.rotationSpeed.y;
        asteroid.rotation.z += asteroid.rotationSpeed.z;

        if (checkCollision(asteroid)) {
            hits++;
            // Visual feedback on hit
            const flash = new THREE.PointLight(0xff0000, 1, 1);
            flash.position.copy(asteroid.position);
            scene.add(flash);
            setTimeout(() => scene.remove(flash), 100);
            
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            
            if (hits >= 5) {
                gameOver = true;
                updateUI();
                return;
            }
        } else if (asteroid.position.y < -2.5) {
            score++;
            scene.remove(asteroid);
            asteroids.splice(i, 1);
        }
    }

    updateUI();
    renderer.render(scene, camera);
}

animate();
