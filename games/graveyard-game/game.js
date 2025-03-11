// Add pause state variables at the top of the file
let isPaused = true;
let isGameStarted = false;

try {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup with error handling
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Error handler for texture loading
    const textureLoader = new THREE.TextureLoader();
    textureLoader.onError = function(err) {
        console.error('Error loading texture:', err);
    };

    // Sky and stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.5,
        transparent: true,
        opacity: 1,
        sizeAttenuation: false,
        blending: THREE.AdditiveBlending
    });

    // Create stars with better positioning
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
        // Use spherical distribution for more realistic star placement
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 500 + Math.random() * 500; // Stars between 500 and 1000 units away
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = Math.abs(radius * Math.sin(phi) * Math.sin(theta)) + 100; // Keep stars above horizon
        const z = radius * Math.cos(phi);
        
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(20, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.8,
        shininess: 0,
        transparent: true,
        opacity: 0.9
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(100, 150, -300);
    scene.add(moon);

    // Moon light
    const moonLight = new THREE.PointLight(0x6699FF, 3, 1000);
    moonLight.position.copy(moon.position);
    scene.add(moonLight);

    // Sky gradient
    scene.background = new THREE.Color(0x1a2a4a);
    scene.fog = new THREE.Fog(0x1a2a4a, 50, 300);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6666aa, 0.8); // Brighter blueish ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x6699FF, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add ground reflection light
    const groundLight = new THREE.HemisphereLight(0x6699ff, 0x335533, 0.5);
    scene.add(groundLight);

    // Add atmospheric fog glow
    const fogLight = new THREE.PointLight(0x6699ff, 0.5, 100);
    fogLight.position.set(0, 10, 0);
    scene.add(fogLight);

    // Ground (grass)
    const groundSize = 1000;

    // Create repeating grass pattern
    const grassGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x225522,
        roughness: 0.8,
        metalness: 0.1,
        wireframe: false,
        depthWrite: true
    });

    // Add grass detail
    grassGeometry.vertices = grassGeometry.attributes.position.array;
    for (let i = 0; i < grassGeometry.vertices.length; i += 3) {
        grassGeometry.vertices[i + 1] = Math.random() * 0.3; // Random height variation
    }
    grassGeometry.attributes.position.needsUpdate = true;

    // Create ground mesh
    const ground = new THREE.Mesh(grassGeometry, grassMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    // Add grass tufts
    const tuftGeometry = new THREE.PlaneGeometry(0.4, 0.4);
    const tuftMaterial = new THREE.MeshStandardMaterial({
        color: 0x225522,  // Darker green to match ground better
        roughness: 1,
        metalness: 0,
        transparent: true,
        alphaTest: 0.8,   // Increased alpha test to prevent transparency artifacts
        side: THREE.DoubleSide,
        depthWrite: true  // Enable depth writing
    });

    // Add random grass tufts with improved positioning
    for (let i = 0; i < 2500; i++) {  // Reduced number of tufts
        const tuft = new THREE.Mesh(tuftGeometry, tuftMaterial);
        const x = (Math.random() - 0.5) * (groundSize - 10);  // Keep away from edges
        const z = (Math.random() - 0.5) * (groundSize - 10);  // Keep away from edges
        tuft.position.set(x, 0.1, z);  // Slightly above ground
        tuft.rotation.x = -Math.PI / 2;  // Lay flat
        ground.add(tuft);
    }

    scene.add(ground);

    // Create tombstones
    function createTombstone(x, z) {
        const tombstoneGroup = new THREE.Group();
        
        // Random style selection
        const style = Math.floor(Math.random() * 4);
        const stoneMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0.6 + Math.random() * 0.2, 0.6 + Math.random() * 0.2, 0.6 + Math.random() * 0.2),
            roughness: 0.8 + Math.random() * 0.2,
            metalness: 0.1
        });

        switch(style) {
            case 0: // Classic rounded top
                const roundedGeometry = new THREE.Shape();
                roundedGeometry.moveTo(-0.4, 0);
                roundedGeometry.lineTo(-0.4, 1.5);
                roundedGeometry.arc(0.4, 0, 0.4, Math.PI, 0, true);
                roundedGeometry.lineTo(0.4, 0);
                
                const extrudeSettings = {
                    depth: 0.2,
                    bevelEnabled: true,
                    bevelThickness: 0.05,
                    bevelSize: 0.05,
                    bevelSegments: 3
                };
                
                const tombstone = new THREE.Mesh(
                    new THREE.ExtrudeGeometry(roundedGeometry, extrudeSettings),
                    stoneMaterial
                );
                break;
                
            case 1: // Cross-topped
                const crossBase = new THREE.BoxGeometry(0.8, 1.8, 0.2);
                const crossBaseMesh = new THREE.Mesh(crossBase, stoneMaterial);
                tombstoneGroup.add(crossBaseMesh);
                
                const crossVertical = new THREE.BoxGeometry(0.2, 0.6, 0.15);
                const crossHorizontal = new THREE.BoxGeometry(0.4, 0.2, 0.15);
                
                const verticalPart = new THREE.Mesh(crossVertical, stoneMaterial);
                verticalPart.position.y = 2.1;
                const horizontalPart = new THREE.Mesh(crossHorizontal, stoneMaterial);
                horizontalPart.position.y = 1.9;
                
                tombstoneGroup.add(verticalPart);
                tombstoneGroup.add(horizontalPart);
                break;
                
            case 2: // Gothic pointed
                const gothicGeometry = new THREE.Shape();
                gothicGeometry.moveTo(-0.4, 0);
                gothicGeometry.lineTo(-0.4, 1.5);
                gothicGeometry.lineTo(0, 2);
                gothicGeometry.lineTo(0.4, 1.5);
                gothicGeometry.lineTo(0.4, 0);
                
                const gothicTombstone = new THREE.Mesh(
                    new THREE.ExtrudeGeometry(gothicGeometry, {
                        depth: 0.2,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.05,
                        bevelSegments: 3
                    }),
                    stoneMaterial
                );
                tombstoneGroup.add(gothicTombstone);
                break;
                
            case 3: // Angel statue
                const angelBase = new THREE.BoxGeometry(1, 0.5, 0.5);
                const angelBaseMesh = new THREE.Mesh(angelBase, stoneMaterial);
                tombstoneGroup.add(angelBaseMesh);
                
                const pillarGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
                const pillar = new THREE.Mesh(pillarGeom, stoneMaterial);
                pillar.position.y = 1;
                tombstoneGroup.add(pillar);
                
                const angelGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
                const angel = new THREE.Mesh(angelGeom, stoneMaterial);
                angel.position.y = 2;
                tombstoneGroup.add(angel);
                break;
        }

        // Add base/platform
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.2, 0.8),
            new THREE.MeshStandardMaterial({ 
                color: 0x505050,
                roughness: 1,
                metalness: 0
            })
        );
        platform.position.y = -0.1;
        tombstoneGroup.add(platform);

        // Add ground disturbance effect (dirt mound)
        const moundGeometry = new THREE.SphereGeometry(0.8, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const moundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            roughness: 1,
            metalness: 0
        });
        const mound = new THREE.Mesh(moundGeometry, moundMaterial);
        mound.position.y = -0.2;
        mound.scale.y = 0.3;
        tombstoneGroup.add(mound);

        // Random rotation and tilt
        tombstoneGroup.rotation.y = (Math.random() - 0.5) * 0.5;
        tombstoneGroup.rotation.x = (Math.random() - 0.5) * 0.1;
        tombstoneGroup.rotation.z = (Math.random() - 0.5) * 0.1;
        tombstoneGroup.position.set(x, 0, z);

        scene.add(tombstoneGroup);
        return tombstoneGroup;
    }

    // Enemy types
    const ENEMY_TYPES = {
        GHOST: 'ghost',
        ZOMBIE: 'zombie',
        SKELETON: 'skeleton'
    };

    // Create enemies
    function createEnemy(type, x, z) {
        const enemy = new THREE.Group();
        
        switch(type) {
            case ENEMY_TYPES.GHOST:
                // Ghost body (flowing robe effect)
                const ghostBody = new THREE.Group();
                
                // Main ghost body (semi-transparent)
                const ghostGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 8);
                const ghostMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.7,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const ghostMain = new THREE.Mesh(ghostGeometry, ghostMaterial);
                ghostMain.castShadow = true;
                ghostBody.add(ghostMain);

                // Ghost head
                const ghostHead = new THREE.SphereGeometry(0.3, 8, 8);
                const ghostHeadMesh = new THREE.Mesh(ghostHead, ghostMaterial);
                ghostHeadMesh.position.y = 1.8;
                ghostHeadMesh.castShadow = true;
                ghostBody.add(ghostHeadMesh);

                // Floating effect
                ghostBody.position.y = 0.5;
                enemy.add(ghostBody);
                enemy.floatOffset = 0;
                enemy.floatSpeed = 0.02;
                break;

            case ENEMY_TYPES.ZOMBIE:
                // Zombie body
                const zombieBody = new THREE.Group();
                
                // Torso
                const zombieTorso = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
                const zombieMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x2ecc71,
                    roughness: 0.9,
                    metalness: 0.1
                });
                const zombieTorsoMesh = new THREE.Mesh(zombieTorso, zombieMaterial);
                zombieTorsoMesh.castShadow = true;
                zombieBody.add(zombieTorsoMesh);

                // Head
                const zombieHead = new THREE.SphereGeometry(0.3, 8, 8);
                const zombieHeadMesh = new THREE.Mesh(zombieHead, zombieMaterial);
                zombieHeadMesh.position.y = 1.5;
                zombieHeadMesh.castShadow = true;
                zombieBody.add(zombieHeadMesh);

                // Arms
                const zombieArm = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
                const leftZombieArm = new THREE.Mesh(zombieArm, zombieMaterial);
                leftZombieArm.position.set(-0.4, 1.2, 0);
                leftZombieArm.rotation.z = Math.PI / 2;
                leftZombieArm.castShadow = true;
                zombieBody.add(leftZombieArm);

                const rightZombieArm = new THREE.Mesh(zombieArm, zombieMaterial);
                rightZombieArm.position.set(0.4, 1.2, 0);
                rightZombieArm.rotation.z = -Math.PI / 2;
                rightZombieArm.castShadow = true;
                zombieBody.add(rightZombieArm);

                // Legs
                const zombieLeg = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
                const leftZombieLeg = new THREE.Mesh(zombieLeg, zombieMaterial);
                leftZombieLeg.position.set(-0.2, 0, 0);
                leftZombieLeg.castShadow = true;
                zombieBody.add(leftZombieLeg);

                const rightZombieLeg = new THREE.Mesh(zombieLeg, zombieMaterial);
                rightZombieLeg.position.set(0.2, 0, 0);
                rightZombieLeg.castShadow = true;
                zombieBody.add(rightZombieLeg);

                enemy.add(zombieBody);
                enemy.walkCycle = 0;
                break;

            case ENEMY_TYPES.SKELETON:
                // Skeleton body
                const skeletonBody = new THREE.Group();
                
                // Torso
                const skeletonTorso = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
                const skeletonMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xecf0f1,
                    roughness: 0.7,
                    metalness: 0.3
                });
                const skeletonTorsoMesh = new THREE.Mesh(skeletonTorso, skeletonMaterial);
                skeletonTorsoMesh.castShadow = true;
                skeletonBody.add(skeletonTorsoMesh);

                // Head
                const skeletonHead = new THREE.SphereGeometry(0.25, 8, 8);
                const skeletonHeadMesh = new THREE.Mesh(skeletonHead, skeletonMaterial);
                skeletonHeadMesh.position.y = 1.5;
                skeletonHeadMesh.castShadow = true;
                skeletonBody.add(skeletonHeadMesh);

                // Arms
                const skeletonArm = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
                const leftSkeletonArm = new THREE.Mesh(skeletonArm, skeletonMaterial);
                leftSkeletonArm.position.set(-0.4, 1.2, 0);
                leftSkeletonArm.rotation.z = Math.PI / 2;
                leftSkeletonArm.castShadow = true;
                skeletonBody.add(leftSkeletonArm);

                const rightSkeletonArm = new THREE.Mesh(skeletonArm, skeletonMaterial);
                rightSkeletonArm.position.set(0.4, 1.2, 0);
                rightSkeletonArm.rotation.z = -Math.PI / 2;
                rightSkeletonArm.castShadow = true;
                skeletonBody.add(rightSkeletonArm);

                // Legs
                const skeletonLeg = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
                const leftSkeletonLeg = new THREE.Mesh(skeletonLeg, skeletonMaterial);
                leftSkeletonLeg.position.set(-0.2, 0, 0);
                leftSkeletonLeg.castShadow = true;
                skeletonBody.add(leftSkeletonLeg);

                const rightSkeletonLeg = new THREE.Mesh(skeletonLeg, skeletonMaterial);
                rightSkeletonLeg.position.set(0.2, 0, 0);
                rightSkeletonLeg.castShadow = true;
                skeletonBody.add(rightSkeletonLeg);

                enemy.add(skeletonBody);
                enemy.walkCycle = 0;
                break;
        }

        enemy.position.set(x, 1, z);
        enemy.type = type;
        enemy.speed = 0.02;
        enemy.health = 100;
        enemy.lastAttack = 0;
        enemy.attackCooldown = 1000;
        enemy.walkSpeed = 0.1;
        enemy.walkAmplitude = 0.3;
        scene.add(enemy);
        return enemy;
    }

    // Enemy management
    const enemies = [];
    const maxEnemies = 10;
    let lastSpawnTime = 0;
    const spawnCooldown = 5000; // 5 seconds between spawns

    function spawnEnemy() {
        const now = Date.now();
        if (now - lastSpawnTime < spawnCooldown || enemies.length >= maxEnemies) return;

        // Select random tombstone for spawning
        const spawnTombstone = tombstones[Math.floor(Math.random() * tombstones.length)];
        const spawnPos = spawnTombstone.position.clone();
        
        const types = Object.values(ENEMY_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Create enemy at tombstone position
        const enemy = createEnemy(type, spawnPos.x, spawnPos.z);
        
        // Set initial state for rising animation
        enemy.position.y = -2;
        enemy.scale.set(0.1, 0.1, 0.1);
        enemy.userData.isRising = true;
        enemy.userData.riseStartTime = now;
        enemy.userData.spawnTombstone = spawnTombstone;
        
        enemies.push(enemy);
        lastSpawnTime = now;
    }

    // Add multiple tombstones
    const tombstones = [];
    for (let i = 0; i < 50; i++) { // Increased from 20 to 50 tombstones
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 40; // More clustered distribution
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        tombstones.push(createTombstone(x, z));
    }

    // First person sword
    function createFirstPersonSword() {
        const sword = new THREE.Group();
        
        // Hand (visible in first person)
        const handGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
        const handMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,
            roughness: 0.8,
            metalness: 0.1
        });
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        hand.position.set(0.3, -0.2, -0.5);
        hand.castShadow = true;
        sword.add(hand);

        // Sword blade (tapered)
        const bladeGeometry = new THREE.CylinderGeometry(0.03, 0.08, 2.5, 8);
        const bladeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffffff,
            emissiveIntensity: 0.2
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 0, -1.2);
        blade.rotation.x = -Math.PI / 2;
        blade.castShadow = true;
        hand.add(blade);

        // Sword guard
        const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
        const guard = new THREE.Mesh(guardGeometry, bladeMaterial);
        guard.position.set(0, 0, -0.1);
        guard.castShadow = true;
        hand.add(guard);

        // Sword handle
        const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 0, 0);
        handle.rotation.x = -Math.PI / 2;
        handle.castShadow = true;
        hand.add(handle);

        // Sword pommel
        const pommelGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const pommel = new THREE.Mesh(pommelGeometry, handleMaterial);
        pommel.position.set(0, 0, 0.25);
        pommel.castShadow = true;
        hand.add(pommel);

        return sword;
    }

    // After the createFirstPersonSword function, add:
    function createBow() {
        const bow = new THREE.Group();
        
        // Hand (visible in first person)
        const handGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
        const handMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,
            roughness: 0.8,
            metalness: 0.1
        });
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        hand.position.set(0.3, -0.2, -0.5);
        hand.castShadow = true;
        bow.add(hand);

        // Bow body (curved)
        const bowCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.2, 0.5),
            new THREE.Vector3(0, 0, 1)
        ]);
        const bowGeometry = new THREE.TubeGeometry(bowCurve, 20, 0.05, 8, false);
        const bowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const bowBody = new THREE.Mesh(bowGeometry, bowMaterial);
        bowBody.position.set(0, 0, -0.5);
        bowBody.rotation.x = -Math.PI / 2;
        bowBody.castShadow = true;
        hand.add(bowBody);

        // Bow string
        const stringGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ]);
        const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const bowString = new THREE.Line(stringGeometry, stringMaterial);
        bowString.position.set(0, 0, -0.5);
        bowString.rotation.x = -Math.PI / 2;
        hand.add(bowString);

        // Arrow
        const arrow = new THREE.Group();
        
        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
        const shaftMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x331100,  // Add slight glow to shaft
            emissiveIntensity: 0.2
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.set(0, 0, -0.6);
        shaft.rotation.x = -Math.PI / 2;
        shaft.castShadow = true;
        arrow.add(shaft);

        // Arrow head with glow
        const headGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff3300,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xff3300,
            emissiveIntensity: 1.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0, -1.3);
        head.rotation.x = -Math.PI / 2;
        head.castShadow = true;
        arrow.add(head);

        // Add flame effect
        const flameGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.7
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.copy(head.position);
        flame.scale.y = 1.5;
        arrow.add(flame);

        // Add point light to arrow
        const arrowLight = new THREE.PointLight(0xff6600, 2, 5);
        arrowLight.position.copy(head.position);
        arrow.add(arrowLight);

        // Arrow fletching
        const fletchingGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.05);
        const fletchingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        const fletching = new THREE.Mesh(fletchingGeometry, fletchingMaterial);
        fletching.position.set(0, 0, -0.1);
        fletching.rotation.x = -Math.PI / 2;
        fletching.castShadow = true;
        arrow.add(fletching);

        bow.arrow = arrow;
        hand.add(arrow);

        return bow;
    }

    // Create and add weapons to camera
    const fpSword = createFirstPersonSword();
    const fpBow = createBow();
    camera.add(fpSword);
    camera.add(fpBow);

    // Weapon switching
    let currentWeapon = 'sword';
    fpSword.visible = true;  // Make sure sword is visible by default
    fpBow.visible = false;   // Hide bow initially

    // Add camera to scene (this was missing)
    scene.add(camera);

    // Combat variables
    let isAttacking = false;
    let attackCooldown = 0;
    const ATTACK_COOLDOWN = 500;
    const ATTACK_DURATION = 300;

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
        ArrowUp: false,    // Add up arrow
        ArrowDown: false   // Add down arrow
    };

    // Add pause handling function
    function togglePause() {
        isPaused = !isPaused;
        document.getElementById('pauseMenu').style.display = isPaused ? 'block' : 'none';
    }

    // Modify event listeners section
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            togglePause();
            return;
        }
        
        if (isPaused) return;
        
        if (keys.hasOwnProperty(event.key)) {
            keys[event.key] = true;
        }
        if (event.code === 'Space' && !isAttacking) {
            startAttack();
        }
        if (event.key.toLowerCase() === 'q' && !isAttacking) {
            switchWeapon();
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
        
        if (event.button === 0 && !isAttacking) {
            startAttack();
        }
    });

    // Arrow management
    const arrows = [];
    const ARROW_SPEED = 15.0;  // Reduced from 30.0 to 15.0 for slower arrows
    const ARROW_LIFETIME = 5000;
    const ARROW_GRAVITY = 0.004;

    function createArrow() {
        const arrow = new THREE.Group();
        
        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
        const shaftMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x331100,  // Add slight glow to shaft
            emissiveIntensity: 0.2
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.set(0, 0, -0.6);
        shaft.rotation.x = -Math.PI / 2;
        shaft.castShadow = true;
        arrow.add(shaft);

        // Arrow head with glow
        const headGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff3300,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xff3300,
            emissiveIntensity: 1.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0, -1.3);
        head.rotation.x = -Math.PI / 2;
        head.castShadow = true;
        arrow.add(head);

        // Add flame effect
        const flameGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.7
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.copy(head.position);
        flame.scale.y = 1.5;
        arrow.add(flame);

        // Add point light to arrow
        const arrowLight = new THREE.PointLight(0xff6600, 2, 5);
        arrowLight.position.copy(head.position);
        arrow.add(arrowLight);

        // Arrow fletching
        const fletchingGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.05);
        const fletchingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        const fletching = new THREE.Mesh(fletchingGeometry, fletchingMaterial);
        fletching.position.set(0, 0, -0.1);
        fletching.rotation.x = -Math.PI / 2;
        fletching.castShadow = true;
        arrow.add(fletching);

        return arrow;
    }

    function startAttack() {
        if (isAttacking) return;
        
        isAttacking = true;
        attackCooldown = Date.now();
        
        const weapon = currentWeapon === 'sword' ? fpSword : fpBow;
        const originalRotation = weapon.rotation.clone();
        const originalPosition = weapon.position.clone();
        const startTime = Date.now();
        
        function attackAnimation() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / ATTACK_DURATION, 1);
            
            // Smooth easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            if (currentWeapon === 'sword') {
                // Sword swing animation
                weapon.rotation.z = originalRotation.z + Math.sin(eased * Math.PI) * 1.5;
                weapon.position.x = originalPosition.x + Math.sin(eased * Math.PI) * 0.2;
                weapon.position.y = originalPosition.y + Math.sin(eased * Math.PI) * 0.1;
            } else {
                // Bow draw and release animation
                if (progress < 0.5) {
                    // Drawing phase
                    weapon.children[0].children[2].position.z = -0.5 - eased * 0.3; // Draw string back
                    weapon.rotation.z = -eased * 0.2; // Tilt bow slightly
                } else if (progress === 0.5) {
                    // Release arrow
                    const arrow = createArrow();
                    
                    // Position arrow at bow tip with offset
                    const bowTip = new THREE.Vector3(0.3, -0.2, -1.5);  // Adjusted starting position
                    bowTip.applyQuaternion(camera.quaternion);
                    bowTip.add(camera.position);
                    arrow.position.copy(bowTip);
                    
                    // Get forward direction from camera with minimal upward angle
                    const direction = new THREE.Vector3(0, 0.02, -1);  // Reduced upward angle
                    direction.applyQuaternion(camera.quaternion);
                    direction.normalize();
                    
                    // Add arrow to scene with enhanced physics properties
                    scene.add(arrow);
                    arrows.push({
                        mesh: arrow,
                        velocity: direction.multiplyScalar(ARROW_SPEED),
                        spawnTime: Date.now(),
                        hasTrail: true,
                        stuckIn: null
                    });
                } else {
                    // Return to rest position
                    const returnEase = (progress - 0.5) * 2;
                    weapon.children[0].children[2].position.z = -0.5 - (1 - returnEase) * 0.3;
                    weapon.rotation.z = -(1 - returnEase) * 0.2;
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(attackAnimation);
            } else {
                // Reset position
                if (currentWeapon === 'sword') {
                    weapon.rotation.copy(originalRotation);
                    weapon.position.copy(originalPosition);
                } else {
                    weapon.children[0].children[2].position.z = -0.5; // Reset string
                    weapon.rotation.set(0, 0, 0);
                }
                isAttacking = false;
            }
        }
        
        attackAnimation();
    }

    // Weapon switching function
    function switchWeapon() {
        if (isAttacking) return;
        
        currentWeapon = currentWeapon === 'sword' ? 'bow' : 'sword';
        fpSword.visible = currentWeapon === 'sword';
        fpBow.visible = currentWeapon === 'bow';
        
        // Reset positions and rotations
        if (currentWeapon === 'sword') {
            fpSword.position.set(0.3, -0.2, -0.5);
            fpSword.rotation.set(0, 0, 0);
        } else {
            fpBow.position.set(0.3, -0.2, -0.5);
            fpBow.rotation.set(0, 0, 0);
        }
        
        console.log(`Switched to ${currentWeapon}`); // Debug message
    }

    // Camera setup
    camera.position.set(0, 1.7, 0);
    camera.lookAt(new THREE.Vector3(0, 1.7, -1));

    // Animation loop with error handling
    function animate() {
        try {
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

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                
                // Handle rising animation for newly spawned enemies
                if (enemy.userData.isRising) {
                    const riseElapsed = Date.now() - enemy.userData.riseStartTime;
                    const riseDuration = 2000; // 2 seconds to rise
                    const riseProgress = Math.min(riseElapsed / riseDuration, 1);
                    
                    // Easing function for smooth rise
                    const eased = 1 - Math.pow(1 - riseProgress, 3);
                    
                    // Rise from ground
                    enemy.position.y = -2 + (3 * eased);
                    
                    // Scale up to full size
                    const scale = 0.1 + (0.9 * eased);
                    enemy.scale.set(scale, scale, scale);
                    
                    // Add particle effect during rise
                    if (riseProgress < 1 && Math.random() < 0.3) {
                        const particle = new THREE.Mesh(
                            new THREE.SphereGeometry(0.1),
                            new THREE.MeshBasicMaterial({
                                color: 0x3d2817,
                                transparent: true,
                                opacity: 0.5
                            })
                        );
                        particle.position.copy(enemy.position);
                        particle.position.x += (Math.random() - 0.5) * 0.5;
                        particle.position.z += (Math.random() - 0.5) * 0.5;
                        scene.add(particle);
                        
                        // Animate particle
                        const startY = particle.position.y;
                        const startTime = Date.now();
                        function animateParticle() {
                            const elapsed = Date.now() - startTime;
                            const duration = 1000;
                            const progress = elapsed / duration;
                            
                            if (progress < 1) {
                                particle.position.y = startY + progress * 2;
                                particle.material.opacity = 0.5 * (1 - progress);
                                requestAnimationFrame(animateParticle);
                            } else {
                                scene.remove(particle);
                                particle.geometry.dispose();
                                particle.material.dispose();
                            }
                        }
                        animateParticle();
                    }
                    
                    if (riseProgress >= 1) {
                        enemy.userData.isRising = false;
                    }
                    continue;
                }
                
                // Calculate direction to player
                const direction = new THREE.Vector3();
                direction.subVectors(camera.position, enemy.position).normalize();
                
                // Move towards player
                enemy.position.x += direction.x * enemy.speed;
                enemy.position.z += direction.z * enemy.speed;
                
                // Rotate to face player
                enemy.rotation.y = Math.atan2(direction.x, direction.z);

                // Update animations based on enemy type
                switch(enemy.type) {
                    case ENEMY_TYPES.GHOST:
                        // Floating animation
                        enemy.floatOffset += enemy.floatSpeed;
                        enemy.children[0].position.y = 0.5 + Math.sin(enemy.floatOffset) * 0.2;
                        break;

                    case ENEMY_TYPES.ZOMBIE:
                    case ENEMY_TYPES.SKELETON:
                        // Walking animation
                        enemy.walkCycle += enemy.walkSpeed;
                        const body = enemy.children[0];
                        
                        // Leg movement
                        const leftLeg = body.children[4];
                        const rightLeg = body.children[5];
                        leftLeg.rotation.x = Math.sin(enemy.walkCycle) * enemy.walkAmplitude;
                        rightLeg.rotation.x = -Math.sin(enemy.walkCycle) * enemy.walkAmplitude;

                        // Arm movement (opposite to legs)
                        const leftArm = body.children[2];
                        const rightArm = body.children[3];
                        leftArm.rotation.x = -Math.sin(enemy.walkCycle) * enemy.walkAmplitude;
                        rightArm.rotation.x = Math.sin(enemy.walkCycle) * enemy.walkAmplitude;

                        // Add slight body sway
                        body.rotation.z = Math.sin(enemy.walkCycle * 0.5) * 0.05;
                        break;
                }
                
                // Check for collision with player
                const distance = enemy.position.distanceTo(camera.position);
                if (distance < 2) {
                    const now = Date.now();
                    if (now - enemy.lastAttack >= enemy.attackCooldown) {
                        console.log(`Enemy ${enemy.type} attacks player!`);
                        enemy.lastAttack = now;
                    }
                }

                // Check for weapon hit
                if (isAttacking) {
                    const weaponDistance = enemy.position.distanceTo(camera.position);
                    if (weaponDistance < (currentWeapon === 'sword' ? 3 : 10)) { // Bow has longer range
                        enemy.health -= currentWeapon === 'sword' ? 25 : 15; // Bow does less damage
                        if (enemy.health <= 0) {
                            startDeathAnimation(enemy);
                            enemies.splice(i, 1);
                            console.log(`Enemy ${enemy.type} defeated!`);
                        }
                    }
                }
            }

            // Update arrows
            for (let i = arrows.length - 1; i >= 0; i--) {
                const arrow = arrows[i];
                
                // Skip physics if arrow is stuck
                if (arrow.stuckIn) {
                    // If stuck in an enemy that died, remove the arrow
                    if (arrow.stuckIn.parent === null) {
                        scene.remove(arrow.mesh);
                        arrows.splice(i, 1);
                    }
                    continue;
                }
                
                // Move arrow
                arrow.mesh.position.add(arrow.velocity);
                
                // Add drop over time
                arrow.velocity.y -= ARROW_GRAVITY;
                
                // Rotate arrow to follow trajectory
                arrow.mesh.quaternion.setFromRotationMatrix(
                    new THREE.Matrix4().lookAt(
                        arrow.mesh.position,
                        arrow.mesh.position.clone().add(arrow.velocity),
                        new THREE.Vector3(0, 1, 0)
                    )
                );
                
                // Animate flame
                const flame = arrow.mesh.children[2]; // The flame mesh
                const light = arrow.mesh.children[3]; // The point light
                if (flame && light) {
                    // Pulse the flame size
                    const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
                    flame.scale.set(pulseScale, pulseScale * 1.5, pulseScale);
                    
                    // Flicker the light intensity
                    light.intensity = 2 + Math.random() * 0.5;
                    
                    // Random flame color variation
                    const hue = (Math.sin(Date.now() * 0.003) * 0.1 + 0.1); // Vary between orange and yellow
                    flame.material.color.setHSL(hue, 1, 0.5);
                    light.color.setHSL(hue, 1, 0.5);
                }
                
                // Add trail effect with more particles
                if (arrow.hasTrail && Math.random() < 0.8) { // Increased trail frequency
                    const trail = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05), // Larger trail particles
                        new THREE.MeshBasicMaterial({
                            color: 0xff6600,
                            transparent: true,
                            opacity: 0.8,
                            blending: THREE.AdditiveBlending // Add blending for better visibility
                        })
                    );
                    trail.position.copy(arrow.mesh.position);
                    scene.add(trail);
                    
                    // Animate trail with flame color
                    const startTime = Date.now();
                    function animateTrail() {
                        const elapsed = Date.now() - startTime;
                        const duration = 500; // Longer trail duration
                        const progress = elapsed / duration;
                        
                        if (progress < 1) {
                            trail.material.opacity = 0.8 * (1 - progress);
                            trail.material.color.setHSL(0.1, 1 - progress * 0.5, 0.5 + progress * 0.2);
                            trail.scale.multiplyScalar(1.02);
                            requestAnimationFrame(animateTrail);
                        } else {
                            scene.remove(trail);
                            trail.geometry.dispose();
                            trail.material.dispose();
                        }
                    }
                    animateTrail();
                }
                
                // Add motion blur effect
                if (arrow.velocity.length() > 0.1) {
                    const blur = new THREE.Mesh(
                        new THREE.SphereGeometry(0.1),
                        new THREE.MeshBasicMaterial({
                            color: 0xff6600,
                            transparent: true,
                            opacity: 0.3,
                            blending: THREE.AdditiveBlending
                        })
                    );
                    blur.position.copy(arrow.mesh.position);
                    scene.add(blur);
                    
                    // Animate blur
                    const startTime = Date.now();
                    function animateBlur() {
                        const elapsed = Date.now() - startTime;
                        const duration = 200;
                        const progress = elapsed / duration;
                        
                        if (progress < 1) {
                            blur.material.opacity = 0.3 * (1 - progress);
                            requestAnimationFrame(animateBlur);
                        } else {
                            scene.remove(blur);
                            blur.geometry.dispose();
                            blur.material.dispose();
                        }
                    }
                    animateBlur();
                }
                
                // Check for arrow lifetime
                if (Date.now() - arrow.spawnTime > ARROW_LIFETIME) {
                    scene.remove(arrow.mesh);
                    arrows.splice(i, 1);
                    continue;
                }
                
                // Check for ground collision
                if (arrow.mesh.position.y < 0.1) {
                    arrow.mesh.position.y = 0.1;
                    arrow.velocity.set(0, 0, 0);
                    arrow.hasTrail = false;
                    
                    // Remove arrow after sticking in ground for a moment
                    setTimeout(() => {
                        scene.remove(arrow.mesh);
                        const index = arrows.indexOf(arrow);
                        if (index > -1) arrows.splice(index, 1);
                    }, 2000);
                    continue;
                }
                
                // Check for enemy hits
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    const distance = arrow.mesh.position.distanceTo(enemy.position);
                    
                    if (distance < 1 && arrow.velocity.length() > 0.1) {
                        // Stick arrow to enemy
                        arrow.mesh.parent = enemy;
                        arrow.velocity.set(0, 0, 0);
                        arrow.hasTrail = false;
                        arrow.stuckIn = enemy;
                        
                        // Deal damage
                        enemy.health -= 25;
                        
                        if (enemy.health <= 0) {
                            startDeathAnimation(enemy);
                            enemies.splice(j, 1);
                            console.log(`Enemy ${enemy.type} defeated by arrow!`);
                        }
                        break;
                    }
                }
            }

            // Spawn new enemies
            spawnEnemy();

            // Subtle moon glow animation
            const timeMoon = Date.now() * 0.001;
            moonLight.intensity = 3 + Math.sin(timeMoon) * 0.2;
            moonMaterial.emissiveIntensity = 0.8 + Math.sin(timeMoon) * 0.1;
            fogLight.intensity = 0.5 + Math.sin(timeMoon * 0.5) * 0.1;

            renderer.render(scene, camera);
        } catch (error) {
            console.error('Animation error:', error);
            document.getElementById('errorOverlay').style.display = 'flex';
            return;
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Create crosshair
    const crosshair = document.createElement('div');
    crosshair.style.position = 'fixed';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.transform = 'translate(-50%, -50%)';
    crosshair.style.width = '20px';
    crosshair.style.height = '20px';
    crosshair.style.pointerEvents = 'none';
    crosshair.style.zIndex = '1000';

    // Create crosshair lines
    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.left = '50%';
    verticalLine.style.top = '0';
    verticalLine.style.width = '2px';
    verticalLine.style.height = '20px';
    verticalLine.style.backgroundColor = 'red';
    verticalLine.style.boxShadow = '0 0 5px red';

    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.left = '0';
    horizontalLine.style.top = '50%';
    horizontalLine.style.width = '20px';
    horizontalLine.style.height = '2px';
    horizontalLine.style.backgroundColor = 'red';
    horizontalLine.style.boxShadow = '0 0 5px red';

    // Add lines to crosshair
    crosshair.appendChild(verticalLine);
    crosshair.appendChild(horizontalLine);

    // Add crosshair to document
    document.body.appendChild(crosshair);

    // Start the animation
    animate();

    // Add after enemy management section
    function startDeathAnimation(enemy) {
        const bodyParts = [];
        const body = enemy.children[0];
        
        // Different death effects based on enemy type
        switch(enemy.type) {
            case ENEMY_TYPES.GHOST:
                // For ghosts, just fade out the whole body
                body.traverse((part) => {
                    if (part.isMesh) {
                        part.material = part.material.clone();
                        part.material.transparent = true;
                    }
                });
                
                const startTime = Date.now();
                const DEATH_DURATION = 1500;
                
                function animateGhostDeath() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / DEATH_DURATION, 1);
                    
                    // Float upward and fade out
                    body.position.y += 0.02;
                    body.traverse((part) => {
                        if (part.isMesh) {
                            part.material.opacity = 1 - progress;
                        }
                    });
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateGhostDeath);
                    } else {
                        scene.remove(enemy);
                    }
                }
                
                animateGhostDeath();
                break;
                
            case ENEMY_TYPES.ZOMBIE:
            case ENEMY_TYPES.SKELETON:
                // For physical enemies, break apart into pieces
                try {
                    // Safely get meshes
                    const meshes = [];
                    body.traverse((part) => {
                        if (part.isMesh) {
                            meshes.push(part);
                        }
                    });
                    
                    // Process each mesh
                    meshes.forEach((mesh) => {
                        // Clone the mesh and its material
                        const clonedMesh = mesh.clone();
                        const material = mesh.material.clone();
                        material.transparent = true;
                        clonedMesh.material = material;
                        
                        // Get world position and rotation
                        mesh.updateMatrixWorld();
                        const worldPos = mesh.getWorldPosition(new THREE.Vector3());
                        const worldRot = mesh.getWorldQuaternion(new THREE.Quaternion());
                        
                        // Set position and rotation
                        clonedMesh.position.copy(worldPos);
                        clonedMesh.quaternion.copy(worldRot);
                        
                        // Add to scene
                        scene.add(clonedMesh);
                        
                        // Add physics properties
                        bodyParts.push({
                            mesh: clonedMesh,
                            velocity: new THREE.Vector3(
                                (Math.random() - 0.5) * 0.15,
                                Math.random() * 0.3,
                                (Math.random() - 0.5) * 0.15
                            ),
                            rotationVel: new THREE.Vector3(
                                (Math.random() - 0.5) * 0.2,
                                (Math.random() - 0.5) * 0.2,
                                (Math.random() - 0.5) * 0.2
                            )
                        });
                    });
                    
                    // Remove original enemy
                    scene.remove(enemy);
                    
                    // Animate the parts
                    const startTime = Date.now();
                    const DEATH_DURATION = 2000;
                    
                    function animatePhysicalDeath() {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / DEATH_DURATION, 1);
                        
                        bodyParts.forEach((part) => {
                            // Apply gravity
                            part.velocity.y -= 0.015;
                            
                            // Update position
                            part.mesh.position.add(part.velocity);
                            
                            // Rotate
                            part.mesh.rotation.x += part.rotationVel.x;
                            part.mesh.rotation.y += part.rotationVel.y;
                            part.mesh.rotation.z += part.rotationVel.z;
                            
                            // Ground collision
                            if (part.mesh.position.y < 0) {
                                part.mesh.position.y = 0;
                                part.velocity.y = Math.abs(part.velocity.y) * 0.4;
                                // Reduce horizontal movement on bounce
                                part.velocity.x *= 0.8;
                                part.velocity.z *= 0.8;
                            }
                            
                            // Fade out
                            part.mesh.material.opacity = 1 - (progress * progress);
                        });
                        
                        if (progress < 1) {
                            requestAnimationFrame(animatePhysicalDeath);
                        } else {
                            // Clean up
                            bodyParts.forEach(part => {
                                scene.remove(part.mesh);
                                part.mesh.geometry.dispose();
                                part.mesh.material.dispose();
                            });
                        }
                    }
                    
                    animatePhysicalDeath();
                } catch (error) {
                    // Fallback: if anything goes wrong, just remove the enemy
                    console.log("Death animation failed, removing enemy:", error);
                    scene.remove(enemy);
                }
                break;
                
            default:
                // Fallback: just remove the enemy if type is unknown
                scene.remove(enemy);
        }
    }
} catch (error) {
    console.error('Game initialization error:', error);
    document.getElementById('errorOverlay').style.display = 'flex';
} 