// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;

let sceneWidth, sceneHeight;

// game variables
let turn = "x";

let board = [[]];

window.addEventListener("keydown", keyPressed);

// The "Enter" key now functions like the search button
function keyPressed(e) {
    if (e.code == "KeyR") {
        location.reload();
    }
}             

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    mttWhiteTile: "images/MTTTileWhite.png"
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}

async function setup() {
  await app.init({ width: 800, height: 800 });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // Make greater board
  let boardVisual = new PIXI.Sprite(assets.boardImage);
  boardVisual.width = 600;
  boardVisual.height = 600;
  stage.addChild(boardVisual);

  // Create board tiles
  for(let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      //let boardTile = new Tile(assets.boardTileImage, 30 + (x*192), 30 + (y*192), { x: x, y: y});
      //stage.addChild(boardTile);
    }
  }
}
