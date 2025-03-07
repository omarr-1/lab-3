let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  let game = new Phaser.Game(config);
  
  function preload() {
    // Load images (background, columns, road) and the sprite (bird).
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
    this.load.spritesheet("bird", "assets/bird.png", {
      frameWidth: 64,
      frameHeight: 96
    });
  }
  
  // Global variables
  let bird;
  let hasLanded = false;
  let hasBumped = false;
  let isGameStarted = false;
  let cursors;
  let messageToPlayer;
  
  function create() {
    // 1) Background
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
  
    // 2) Road
    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, "road").setScale(2).refreshBody();
  
    // 3) Columns
    const topColumns = this.physics.add.staticGroup({
      key: "column",
      repeat: 1,
      setXY: { x: 200, y: 0, stepX: 300 }
    });
  
    const bottomColumns = this.physics.add.staticGroup({
      key: "column",
      repeat: 1,
      setXY: { x: 350, y: 400, stepX: 300 }
    });
  
    // 4) Bird
    bird = this.physics.add.sprite(0, 50, "bird").setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);
  
    // 5) Detect collisions/overlaps
    //    Order matters: overlap before collider for detection to work
    this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
    this.physics.add.overlap(bird, topColumns, () => (hasBumped = true), null, this);
    this.physics.add.overlap(bird, bottomColumns, () => (hasBumped = true), null, this);
  
    this.physics.add.collider(bird, road);
    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns);
  
    // 6) Keyboard input
    cursors = this.input.keyboard.createCursorKeys();
  
    // 7) Instructions text
    messageToPlayer = this.add.text(
      0, 
      0, 
      `Instructions: Press space bar to start`, 
      { 
        fontFamily: '"Comic Sans MS", Times, serif', 
        fontSize: "20px", 
        color: "white", 
        backgroundColor: "black" 
      }
    );
    // Align instructions at the bottom-center of the background
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);
  }
  
  function update() {
    // Start the game
    if (cursors.space.isDown && !isGameStarted) {
      isGameStarted = true;
      messageToPlayer.text = `Instructions: Press the "^" button to stay upright\nAnd don't hit the columns or ground`;
    }
  
    // Bird should not move down if the game hasn’t started yet;
    // this gives the “hover” effect before the player presses space.
    if (!isGameStarted) {
      bird.setVelocityY(-160);
    }
  
    // Move the bird upward on key press, as long as it hasn't landed or bumped
    if (cursors.up.isDown && !hasLanded && !hasBumped && isGameStarted) {
      bird.setVelocityY(-160);
    }
  
    // Handle horizontal velocity:
    // - Move right if the bird hasn’t landed, bumped, or isGameStarted is true
    // - Otherwise, velocity.x is 0
    if (!hasLanded && !hasBumped && isGameStarted) {
      bird.body.velocity.x = 50;
    } else {
      bird.body.velocity.x = 0;
    }
  
    // If the bird has landed or bumped into a column, game over
    if (hasLanded || hasBumped) {
      messageToPlayer.text = `Oh no! You crashed!`;
    }
  
    // If the bird passes x=750, show "You won!" and let it gently float downward
    if (bird.x > 750) {
      bird.setVelocityY(40);
      messageToPlayer.text = `Congrats! You won!`;
    }
  }
  