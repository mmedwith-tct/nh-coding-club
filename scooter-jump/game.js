import * as THREE from 'three';

class ScooterJumpGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.obstacles = [];
        this.coins = [];
        this.speed = 0.2;
        this.jumpForce = 0;
        this.gravity = 0.015;
        this.groundY = -2;
        this.maxJumpForce = 0.4;
        this.isJumping = false;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(-5, 3, 10);
        this.camera.lookAt(0, 0, 0);

        // Create lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x404040,
            roughness: 0.8,
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = this.groundY;
        this.scene.add(this.ground);

        // Create player (scooter)
        this.createPlayer();

        // Create initial obstacles
        this.createObstacle();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createPlayer() {
        // Create scooter group
        this.player = new THREE.Group();

        // Base
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.player.add(base);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        frontWheel.rotation.z = Math.PI / 2;
        frontWheel.position.set(0.6, -0.2, 0);
        this.player.add(frontWheel);

        const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        backWheel.rotation.z = Math.PI / 2;
        backWheel.position.set(-0.6, -0.2, 0);
        this.player.add(backWheel);

        // Handlebar
        const handlebarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
        const handlebarMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
        handlebar.position.set(0.6, 0.6, 0);
        this.player.add(handlebar);

        // Rider
        const riderGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
        const riderMaterial = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
        const rider = new THREE.Mesh(riderGeometry, riderMaterial);
        rider.position.set(0, 0.7, 0);
        this.player.add(rider);

        this.player.position.set(0, 0, 0);
        this.scene.add(this.player);
    }

    createObstacle() {
        const types = [
            { geometry: new THREE.BoxGeometry(1, 1, 1), color: 0x8B4513 }, // Brown box
            { geometry: new THREE.ConeGeometry(0.5, 1, 8), color: 0xFFA500 }, // Orange cone
            { geometry: new THREE.CylinderGeometry(0.3, 0.3, 1), color: 0x666666 } // Gray pole
        ];

        const type = types[Math.floor(Math.random() * types.length)];
        const obstacle = new THREE.Mesh(
            type.geometry,
            new THREE.MeshStandardMaterial({ color: type.color })
        );

        obstacle.position.set(
            30 + Math.random() * 10, // Random distance ahead
            this.groundY + type.geometry.parameters.height / 2,
            0
        );

        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }

    jump() {
        if (!this.isJumping && !this.gameOver) {
            this.isJumping = true;
            this.jumpForce = this.maxJumpForce;
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                if (!this.gameStarted) {
                    this.startGame();
                } else {
                    this.jump();
                }
                event.preventDefault();
            }
        });

        // Mobile controls
        const jumpButton = document.getElementById('jump-button');
        jumpButton.addEventListener('touchstart', (event) => {
            if (!this.gameStarted) {
                this.startGame();
            } else {
                this.jump();
            }
            event.preventDefault();
        });

        // Start button
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        
        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        this.updateScore();
        this.animate();
    }

    restartGame() {
        // Reset player position
        this.player.position.y = 0;
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];
        
        // Create new obstacle
        this.createObstacle();
        
        // Start game
        this.startGame();
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }

    checkCollisions() {
        const playerBox = new THREE.Box3().setFromObject(this.player);

        for (let obstacle of this.obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            if (playerBox.intersectsBox(obstacleBox)) {
                this.gameOver = true;
                document.getElementById('game-over').style.display = 'flex';
                document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
                return;
            }
        }
    }

    animate() {
        if (!this.gameStarted || this.gameOver) return;

        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update player
        if (this.isJumping) {
            this.player.position.y += this.jumpForce;
            this.jumpForce -= this.gravity;

            if (this.player.position.y <= 0) {
                this.player.position.y = 0;
                this.isJumping = false;
                this.jumpForce = 0;
            }
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.position.x -= this.speed;

            // Remove obstacles that are off screen
            if (obstacle.position.x < -20) {
                this.scene.remove(obstacle);
                this.obstacles.splice(i, 1);
                this.score++;
                this.updateScore();
            }
        }

        // Create new obstacles
        if (this.obstacles.length < 3) {
            this.createObstacle();
        }

        // Check collisions
        this.checkCollisions();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new ScooterJumpGame(); 