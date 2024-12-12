// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;

let sceneWidth, sceneHeight;

// game variables
let turn = "X";

let board = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
let onBoard = [];
let tokens = [];
let inputs = [false, false, false, false]
let mechX, mechO, endTurn;
let mechXUI, mechOUI;

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
window.addEventListener("mouseup", reloadMechText);

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
    mttOMarker: "images/MTTTravelMarkO.png",
    mttXMarker: "images/MTTTravelMarkX.png",
    endTurn: "images/EndTurn.png"
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
  mechX = new Mech(assets.mttXMech, [0, 0], "X");
  onBoard.push(mechX);
  stage.addChild(mechX);
  mechO = new Mech(assets.mttOMech, [14, 14], "O");
  onBoard.push(mechO);
  stage.addChild(mechO);

  // Make UI
  mechXUI = new PIXI.Text("Energy: " + mechX.energy + "/" + mechX.energyCapacity + " | Energy Regeneration: " + mechX.energyRegeneration, {
    fill: 0xffffff,
    fontSize: 40,
    fontFamily: "Arial",
    stroke: 0xff0000,
    strokeThickness: 6,
  });
  mechXUI.visible = false;
  stage.addChild(mechXUI);
  mechOUI = new PIXI.Text("Energy: " + mechO.energy + "/" + mechO.energyCapacity + " | Energy Regeneration: " + mechO.energyRegeneration, {
    fill: 0xffffff,
    fontSize: 40,
    fontFamily: "Arial",
    stroke: 0xff0000,
    strokeThickness: 6,
  });
  mechOUI.visible = false;
  stage.addChild(mechOUI);

  endTurn = new EndTurn(assets.endTurn);
  endTurn.x = sceneWidth - endTurn.width;
  endTurn.y = sceneHeight - endTurn.height + 50;
  stage.addChild(endTurn);

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
    if (tokens.length > 0) {
        for (let token in tokens) {
            tokens[token].move(dt, direction);
        }
    }
}

function displayMechData(mech){
    console.log("Clicked: " + mech.team)
    if (mech.team == "X") {
        mechXUI.visible = true;

        if (mech.energy > 0) {
            if (mech.tileNumber[0] - 1 >= 0) {
                let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0] - 1, mech.tileNumber[1]], "X");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[0] + 1 <= 15) {
                let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0] + 1, mech.tileNumber[1]], "X");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[1] - 1 >= 0) {
                let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0], mech.tileNumber[1] - 1], "X");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[1] + 1 <= 15) {
                let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0], mech.tileNumber[1] + 1], "X");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
        }
    }
    else {
        mechOUI.visible = true;

        if (mech.energy > 0) {
            if (mech.tileNumber[0] - 1 >= 0) {
                let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0] - 1, mech.tileNumber[1]], "O");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[0] + 1 <= 14) {
                let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0] + 1, mech.tileNumber[1]], "O");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[1] - 1 >= 0) {
                let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0], mech.tileNumber[1] - 1], "O");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
            if (mech.tileNumber[1] + 1 <= 14) {
                let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0], mech.tileNumber[1] + 1], "O");
                tokens.push(moveToken);
                stage.addChild(moveToken);
            }
        }
    }
}

function stopDisplayingMechData(mech){

}

function deselectAll(){
    for (let thing in onBoard) {
        onBoard[thing].deselect();
    }
    if (tokens.length > 0) {
        for (let token in tokens) {
            tokens[token].deselect();
        }
        tokens = [];
    }
    mechXUI.visible = false;
    mechOUI.visible = false;
}

function moveMech(team, tileNumber) {
    if (team == "X") {
        mechX.moveMech(tileNumber);
        for (let token in tokens) {
                tokens[token].deselect();
        }
        tokens = [];
    }
    else {
        mechO.moveMech(tileNumber);
        for (let token in tokens) {
            tokens[token].deselect();
        }
        tokens = [];
    }
}

function reloadMechText() {
    mechXUI.text = ("Energy: " + mechX.energy + "/" + mechX.energyCapacity + " | Energy Regeneration: " + mechX.energyRegeneration);
    mechOUI.text = ("Energy: " + mechO.energy + "/" + mechO.energyCapacity + " | Energy Regeneration: " + mechO.energyRegeneration);
}

function rejuvinate(mech) {
    mech.energy += mech.energyRegeneration;
    if (mech.energy > mech.energyCapacity) {
        mech.energy = mech.energyCapacity;
    }
}