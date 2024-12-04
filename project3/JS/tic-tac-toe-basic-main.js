// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;

let sceneWidth, sceneHeight;



// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, gameOverScoreLabel, shootSound, hitSound, fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

// Load all assets
//loadImages();

async function loadImages() {
  /*// https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    spaceship: "images/spaceship.png",
    explosions: "images/explosions.png",
    move: "images/move.png",
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();*/
}

async function setup() {
  await app.init({ width: 600, height: 600 });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // #1 - Create the `start` scene
  startScene = new PIXI.Container();
  stage.addChild(startScene);

  // #8 - Start update loop
  app.ticker.add(gameLoop);
}

function createLabelsAndButtons() {
  // 1C make start game button
  let startButton = new PIXI.Text("Enter, if you dare!", buttonStyle);
  startButton.x = sceneWidth / 2 - startButton.width / 2;
  startButton.y = sceneHeight - 100;
  startButton.interactive = true;
  startButton.buttonMode = true;
  startButton.on("pointerup", startGame); //startGame is a funcion reference
  startButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // conccise arrow function with no brackets
  startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); //ditto
  startScene.addChild(startButton);
}

function gameLoop(){
  
}