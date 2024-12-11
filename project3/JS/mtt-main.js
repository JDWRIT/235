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

let board = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

window.addEventListener("keydown", keyPressed);

// The "Enter" key now functions like the search button
function keyPressed(e) {
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    if (e.code == "KeyW") {
        moveBoardElements(dt, [0, 10]);
    }
    if (e.code == "KeyA") {
        moveBoardElements(dt, [10, 0]);
    }
    if (e.code == "KeyS") {
        moveBoardElements(dt, [0, -10]);
    }
    if (e.code == "KeyD") {
        moveBoardElements(dt, [-10, 0]);
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
  await app.init({ width: 950, height: 950 });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // Create board tiles
  for(let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      let boardTile = new Tile(assets.mttWhiteTile, [x, y]);
      board[x][y] = boardTile;
      stage.addChild(boardTile);
    }
  }
}

function moveBoardElements(dt, direction){
    for(let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            board[x][y].move(dt, direction);
        }
    }
}