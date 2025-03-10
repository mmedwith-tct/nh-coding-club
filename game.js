let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
let velocity = new THREE.Vector3();
let shells = [];
let score = 0;
let scoreElement;
let character;
let cameraOffset = new THREE.Vector3(0, 5, 10);
let cameraTarget = new THREE.Vector3();

const moveSpeed = 100.0;
const jumpSpeed = 350.0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create ground (beach)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf4d03f,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create ocean with waves
    const oceanGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const oceanMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3498db,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.1
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.5;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // Add sky
    scene.background = new THREE.Color(0x87CEEB);

    // Create character
    createCharacter();

    // Create shells
    createShells();

    // Setup controls
    controls = new THREE.PointerLockControls(camera, document.body);

    // Click to start
    const blocker = document.getElementById('instructions');
    blocker.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
    });

    // Movement controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Setup score display
    scoreElement = document.getElementById('scoreValue');

    // Position camera
    updateCameraPosition();
}

function createCharacter() {
    // Create a simple character model
    const characterGroup = new THREE.Group();
    
    // Body (torso)
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    characterGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFE4C4,
        roughness: 0.7,
        metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    characterGroup.add(head);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 1.5, 0);
    leftArm.castShadow = true;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 1.5, 0);
    rightArm.castShadow = true;
    characterGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0, 0);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0, 0);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    characterGroup.position.y = 1;
    character = characterGroup;
    scene.add(character);
}

function createShells() {
    // Create different types of shells
    const shellTypes = [
        {
            geometry: new THREE.ConeGeometry(0.3, 0.8, 8),
            color: 0xFFD700,
            rotation: [0, Math.PI / 2, 0]
        },
        {
            geometry: new THREE.SphereGeometry(0.4, 8, 8),
            color: 0xFFA500,
            rotation: [0, 0, 0]
        },
        {
            geometry: new THREE.TorusGeometry(0.3, 0.1, 8, 16),
            color: 0xFF69B4,
            rotation: [Math.PI / 2, 0, 0]
        }
    ];

    for (let i = 0; i < 20; i++) {
        const shellType = shellTypes[Math.floor(Math.random() * shellTypes.length)];
        const shellMaterial = new THREE.MeshStandardMaterial({ 
            color: shellType.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const shell = new THREE.Mesh(shellType.geometry, shellMaterial);
        shell.position.x = (Math.random() - 0.5) * 80;
        shell.position.z = (Math.random() - 0.5) * 80;
        shell.position.y = 0.5;
        shell.rotation.set(...shellType.rotation);
        shell.userData.collected = false;
        shell.castShadow = true;
        shell.receiveShadow = true;
        shells.push(shell);
        scene.add(shell);
    }
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump) {
                velocity.y = jumpSpeed;
                canJump = false;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkShellCollection() {
    shells.forEach(shell => {
        if (!shell.userData.collected) {
            const distance = character.position.distanceTo(shell.position);
            if (distance < 2) {
                shell.userData.collected = true;
                shell.visible = false;
                score += 10;
                scoreElement.textContent = score;
            }
        }
    });
}

function updateCharacterRotation() {
    if (moveForward || moveBackward || moveLeft || moveRight) {
        const angle = Math.atan2(
            moveLeft || moveRight ? (moveRight ? 1 : -1) : 0,
            moveForward || moveBackward ? (moveBackward ? 1 : -1) : 0
        );
        character.rotation.y = angle;
    }
}

function updateCameraPosition() {
    // Calculate the camera's target position based on character's position and rotation
    const characterRotation = character.rotation.y;
    const offsetX = Math.sin(characterRotation) * cameraOffset.z;
    const offsetZ = Math.cos(characterRotation) * cameraOffset.z;
    
    cameraTarget.x = character.position.x;
    cameraTarget.y = character.position.y + cameraOffset.y;
    cameraTarget.z = character.position.z;

    // Update camera position
    camera.position.x = character.position.x - offsetX;
    camera.position.y = character.position.y + cameraOffset.y;
    camera.position.z = character.position.z - offsetZ;

    // Make camera look at character
    camera.lookAt(cameraTarget);
}

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const time = performance.now();
        velocity.x -= velocity.x * 10.0 * 0.016;
        velocity.z -= velocity.z * 10.0 * 0.016;
        velocity.y -= 9.8 * 100.0 * 0.016;

        if (moveForward) velocity.z -= moveSpeed * 0.016;
        if (moveBackward) velocity.z += moveSpeed * 0.016;
        if (moveLeft) velocity.x -= moveSpeed * 0.016;
        if (moveRight) velocity.x += moveSpeed * 0.016;

        // Update character position
        character.position.x += velocity.x * 0.016;
        character.position.z += velocity.z * 0.016;
        character.position.y += velocity.y * 0.016;

        // Update character rotation
        updateCharacterRotation();

        // Update camera position
        updateCameraPosition();

        if (character.position.y < 1) {
            velocity.y = 0;
            character.position.y = 1;
            canJump = true;
        }

        checkShellCollection();
    }

    renderer.render(scene, camera);
} 