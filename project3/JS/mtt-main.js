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
let onBoard = [];
let inputs = [false, false, false, false]

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

// The "Enter" key now functions like the search button
function keyDown(e) {
    if (e.code == "KeyW") {
        inputs[0] = true;
    }
    if (e.code == "KeyA") {
        inputs[1] = true;
    }
    if (e.code == "KeyS") {
        inputs[2] = true;
    }
    if (e.code == "KeyD") {
        inputs[3] = true;
    }
}

function keyUp(e) {
    if (e.code == "KeyW") {
        inputs[0] = false;
    }
    if (e.code == "KeyA") {
        inputs[1] = false;
    }
    if (e.code == "KeyS") {
        inputs[2] = false;
    }
    if (e.code == "KeyD") {
        inputs[3] = false;
    }
}

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    mttWhiteTile: "images/MTTTileWhite.png",
    mttOMech: "images/MTTO.png",
    mttXMech: "images/MTTX.png",
    mttOMarker: "images/MTTTravelMarkerO",
    mttXMarker: "images/MTTTravelMarkerX"
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

  // Make mechs
  let mechX = new Mech(assets.mttXMech, [0, 0], "X");
  onBoard.push(mechX);
  stage.addChild(mechX);
  let mechO = new Mech(assets.mttOMech, [14, 14], "O");
  onBoard.push(mechO);
  stage.addChild(mechO);

  app.ticker.add(gameLoop);
}

function gameLoop(){
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    if (inputs[0]) {
        moveBoardElements(dt, [0, 10]);
    }
    if (inputs[1]) {
        moveBoardElements(dt, [10, 0]);
    }
    if (inputs[2]) {
        moveBoardElements(dt, [0, -10]);
    }
    if (inputs[3]) {
        moveBoardElements(dt, [-10, 0]);
    }
}

function moveBoardElements(dt, direction){
    for(let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            board[x][y].move(dt, direction);
        }
    }
    for (let thing in onBoard) {
        onBoard[thing].move(dt, direction);
    }
}

function displayMechData(mech){
    console.log("displayMechData!");
    console.log("Clicked: " + mech.team)
}

function stopDisplayingMechData(mech){
    console.log("stopDisplayingMechData!");
    console.log("Unclicked: " + mech.team)
}

function deselectAll(){
    for (let thing in onBoard) {
        onBoard[thing].deselect();
    }
}