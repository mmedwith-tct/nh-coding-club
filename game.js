// Add pause state variables at the top of the file
let isPaused = true;
let isGameStarted = false;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Sky gradient
scene.background = new THREE.Color(0x1a2a4a);
scene.fog = new THREE.Fog(0x1a2a4a, 50, 300);

// Lighting
const ambientLight = new THREE.AmbientLight(0x6666aa, 0.8);
scene.add(ambientLight);

// Add pause handling function
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseMenu').style.display = isPaused ? 'block' : 'none';
}

// Movement variables
const moveSpeed = 0.1;
const cameraRotationSpeed = 0.05;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (isPaused) return;
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

document.addEventListener('mousedown', (event) => {
    if (!isGameStarted) {
        isGameStarted = true;
        isPaused = false;
        document.getElementById('startOverlay').style.display = 'none';
        return;
    }
    
    if (isPaused) return;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (isPaused) {
        renderer.render(scene, camera);
        return;
    }

    // Update camera rotation based on arrow keys
    if (keys.ArrowLeft) {
        camera.rotation.y += cameraRotationSpeed;
    }
    if (keys.ArrowRight) {
        camera.rotation.y -= cameraRotationSpeed;
    }

    // Calculate movement direction based on camera rotation
    const moveDirection = new THREE.Vector3();
    const strafeDirection = new THREE.Vector3();
    
    // Get forward direction (negative Z axis)
    moveDirection.set(0, 0, -1).applyQuaternion(camera.quaternion);
    // Get right direction (positive X axis)
    strafeDirection.set(1, 0, 0).applyQuaternion(camera.quaternion);

    // Camera movement
    if (keys.w || keys.ArrowUp) {
        camera.position.addScaledVector(moveDirection, moveSpeed);
    }
    if (keys.s || keys.ArrowDown) {
        camera.position.addScaledVector(moveDirection, -moveSpeed);
    }
    if (keys.a) {
        camera.position.addScaledVector(strafeDirection, -moveSpeed);
    }
    if (keys.d) {
        camera.position.addScaledVector(strafeDirection, moveSpeed);
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate(); 