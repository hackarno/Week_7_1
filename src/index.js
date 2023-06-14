import Phaser from "phaser";

/* const gameOptions = {
  dudeGravity: 800,
  dudeSpeed: 300
}; */

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
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
  this.load.image("sky", "src/assets/sky.png");
  this.load.image("ground", "src/assets/platform.png");
  this.load.image("star", "src/assets/star.png");
  this.load.image("superStar", "src/assets/star.png");
  this.load.image("bomb", "src/assets/bomb.png");
  this.load.spritesheet("dude", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
}

let platforms;
let player;
let cursors;
let stars;
let superStars;
let score = 0;
let scoreText;
let bombs;

function create() {
  //Taustakuva
  this.add.image(400, 300, "sky");

  //Alustat (leveys , korkeus)
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(400, 425, "ground");
  platforms.create(50, 300, "ground");
  platforms.create(600, 250, "ground");

  //PELIHAHMO

  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  //Pelihahmon animaatiot, hahmon kuvatiedostossa on 9 framea, joita käytetään alla
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  //Pelihahmon "paino"
  player.body.setGravityY(500);

  //Pelihahmo ja alustat törmäävät tämän rivin myötä:
  this.physics.add.collider(player, platforms);

  //Näppäimet
  cursors = this.input.keyboard.createCursorKeys();

  //Tähdet
  stars = this.physics.add.group({
    key: "star",
    repeat: 4,
    setXY: { x: 100, y: 0, stepX: 150 }
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  //Supertähdet

  superStars = this.physics.add.group();

  this.physics.add.collider(superStars, platforms);

  this.physics.add.collider(player, superStars, hitSuperStar, null, this);

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  //Score

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000"
  });

  //Pommit

  bombs = this.physics.add.group({ key: "bomb" });

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

//Näppäinkomennot

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-630);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 1;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    let x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    let bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    console.log("nyt");

    let superStar = superStars.create(x - 50, 16, "superStar");
    superStar.setTint(0xa020f0);
    superStar.setBounce(0.7);
    superStar.setCollideWorldBounds(true);
    superStar.setVelocity(Phaser.Math.Between(-150, 150), 20);
  }
}

function hitBomb(player, bombs) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  scoreText.setText("Game over! Total score: " + score);
}

function hitSuperStar(player, superStar) {
  superStar.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);

  let x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);
  let bomb = bombs.create(x, 16, "bomb");
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}
