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
let buildMarkers = [];
let factories = [];
let inputs = [false, false, false, false]
let hsms = [[],[],[]];
let mechX, mechO, endTurn;
let mechXUI, mechOUI, turnUI, buildUI;
let knocking, powerUp, mechMove, oreGrind;
let mainGame, userInterface;
let backDeselector;

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
window.addEventListener("mouseup", reloadMechText);

// The keys are logged when pressed down
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

// The keys are unlogged when released
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
    mttGreenTile: "images/MTTTileGreen.png",
    mttGrayTile: "images/MTTTileGray.png",
    mttLakeTile: "images/MTTTileGreenLake.png",
    mttRiverTile: "images/MTTTileGreenRiver.png",
    mttVolcanoTile: "images/MTTTileVolcano.png",
    mttOMech: "images/MTTO.png",
    mttXMech: "images/MTTX.png",
    mttOMarker: "images/MTTTravelMarkO.png",
    mttXMarker: "images/MTTTravelMarkX.png",
    endTurn: "images/EndTurn.png",
    hsmNull: "images/HSMNull.png",
    hsmX: "images/HSMX.png",
    hsmO: "images/HSMO.png",
    hsmBack: "images/HSMBackground.png",
    hsmPowerNull: "images/HSMPowerNull.png",
    hsmPowerX: "images/HSMPowerX.png",
    hsmPowerO: "images/HSMPowerO.png",
    oWins: "images/TicTacToeBoardBasicOWins.png",
    xWins: "images/TicTacToeBoardBasicXWins.png",
    oreImage: "images/Ore.png",
    factoryXImg: "images/FactoryX.png",
    factoryOImg: "images/FactoryO.png",
    buildButton: "images/BuildButton.png",
    buildMarkerImg: "images/BuildMarker.png",
    factoryBackImg: "images/FactoryBkg.png",
    fillImg: "images/FactoryFillButton.png",
    backgroundDeselector: "images/BackgroundDeselector.png"
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    //console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}

async function setup() {
    await app.init({ width: 950, height: 950 });

    document.body.appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    backDeselector = new BackSelector();
    stage.addChild(backDeselector);

    mainGame = new PIXI.Container();
    stage.addChild(mainGame);
    userInterface = new PIXI.Container();
    stage.addChild(userInterface);


    // Load audio
    knocking = new Howl({src: ["audio/knocking.mp3"],});
    powerUp = new Howl({src: ["audio/powerUp.mp3"],});
    mechMove = new Howl({src: ["audio/mechMove.mp3"],});
    oreGrind = new Howl({src: ["audio/oreGrind.mp3"],});

    // Create board tiles
    for(let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            let boardTile = new Tile(boardTileColor(), [y, x]);
            board[y][x] = boardTile;
            mainGame.addChild(boardTile);
        }
    }

    // Make mechs
    mechX = new Mech(assets.mttXMech, [0, 0], "X");
    onBoard.push(mechX);
    mainGame.addChild(mechX);
    mechO = new Mech(assets.mttOMech, [14, 14], "O");
    onBoard.push(mechO);
    mainGame.addChild(mechO);

    // Make HSMs
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            makeHSM([(y * 5) + 2, (x * 5) + 2], y, x);
        }
    }

    // Make ore
    for (let i = 0; i < 50; i++) {
        let oreTile = [Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)];
        let notFound = true;
        while (notFound) {
            if (board[oreTile[0]][oreTile[1]].content == null) {
                notFound = false;
            }
            else {
                oreTile = [Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)];
            }
        }
        let ore = new Ore([oreTile[0], oreTile[1]]);
        onBoard.push(ore);
        mainGame.addChild(ore);
    }

    // Make UI
    mechXUI = new PIXI.Text("Energy: " + mechX.energy + "/" + mechX.energyCapacity + " | Energy Regeneration: " + mechX.energyRegeneration + " | Ore: " + mechX.ore, {
        fill: 0xffffff,
        fontSize: 35,
        fontFamily: "Arial",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    mechXUI.visible = false;
    userInterface.addChild(mechXUI);
    mechOUI = new PIXI.Text("Energy: " + mechO.energy + "/" + mechO.energyCapacity + " | Energy Regeneration: " + mechO.energyRegeneration + " | Ore: " + mechO.ore, {
        fill: 0xffffff,
        fontSize: 35,
        fontFamily: "Arial",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    mechOUI.visible = false;
    userInterface.addChild(mechOUI);

    turnUI = new PIXI.Text("Turn: X", {
        fill: 0xffffff,
        fontSize: 35,
        fontFamily: "Arial",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    turnUI.x = sceneWidth - 150;
    userInterface.addChild(turnUI);

    buildUI = new BuildButton;
    userInterface.addChild(buildUI);

    endTurn = new EndTurn(assets.endTurn);
    endTurn.x = sceneWidth - endTurn.width;
    endTurn.y = sceneHeight - endTurn.height;
    userInterface.addChild(endTurn);

  app.ticker.add(gameLoop);
}

// Makes HSMs given a position, as well as an X, Y coordinate for the 3x3 HSM board
function makeHSM(position, y, x) {
    let hsm = new HSM([position[0], position[1]]);
    hsms[y][x] = hsm;
    onBoard.push(hsm);
    mainGame.addChild(hsm);
}

// Randomizes the type of tile that spawns, although not uniformly
function boardTileColor() {
    let randomNumber = Math.floor(Math.random() * 101);

    if (randomNumber < 50) {
        return assets.mttGreenTile;
    }
    else if (randomNumber < 70) {
        return assets.mttGrayTile;
    }
    else if (randomNumber < 80) {
        return assets.mttWhiteTile;
    }
    else if (randomNumber < 90) {
        return assets.mttRiverTile;
    }
    else if (randomNumber < 95) {
        return assets.mttLakeTile;
    }
    else {
        return assets.mttVolcanoTile;
    }
}

// Moves everything based on user inputs
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

// Does the actual moving that gameLoop provides information for
function moveBoardElements(dt, direction){
    for(let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            board[y][x].move(dt, direction);
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
    if (buildMarkers.length > 0) {
        for (let marker in buildMarkers) {
            buildMarkers[marker].move(dt, direction);
        }
    }
}

// Displays the information/stats for the mech and also the movement tokens
function displayMechData(mech){
    if (mech.team == "X") {
        mechXUI.visible = true;

        if (mech.energy > 0) {
            console.log("mech.tileNumber[0]: " + mech.tileNumber[0]);
            console.log("mech.tileNumber[1]: " + mech.tileNumber[1]);
            if (mech.tileNumber[0] - 1 >= 0) {
                console.log("1 content pre: " + board[mech.tileNumber[0] - 1][[mech.tileNumber[1]]].content);
                if (board[mech.tileNumber[0] - 1][[mech.tileNumber[1]]].content == null){
                    let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0] - 1, mech.tileNumber[1]], "X");
                    console.log("1");
                    console.log("1 content post: " + board[mech.tileNumber[0] - 1][[mech.tileNumber[1]]].content);
                    console.log("1 board[" + (mech.tileNumber[0] - 1) + "][" + (mech.tileNumber[1]) + "]");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[0] + 1 <= 14) {
                console.log("2 content pre: " + board[mech.tileNumber[0] + 1][[mech.tileNumber[1]]].content);
                if (board[mech.tileNumber[0] + 1][[mech.tileNumber[1]]].content == null) {
                    let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0] + 1, mech.tileNumber[1]], "X");
                    console.log("2");
                    console.log("2 content post: " + board[mech.tileNumber[0] + 1][[mech.tileNumber[1]]].content);
                    console.log("2 board[" + (mech.tileNumber[0] + 1) + "][" + (mech.tileNumber[1]) + "]");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[1] - 1 >= 0) {
                console.log("3 content pre: " + board[mech.tileNumber[0]][[mech.tileNumber[1] - 1]].content);
                if (board[mech.tileNumber[0]][[mech.tileNumber[1] - 1]].content == null) {
                    let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0], mech.tileNumber[1] - 1], "X");
                    console.log("3");
                    console.log("3 content post: " + board[mech.tileNumber[0]][[mech.tileNumber[1] - 1]].content);
                    console.log("3 board[" + (mech.tileNumber[0]) + "][" + (mech.tileNumber[1] - 1) + "]");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[1] + 1 <= 14) {
                console.log("4 content pre: " + board[mech.tileNumber[0]][[mech.tileNumber[1] + 1]].content);
                if (board[mech.tileNumber[0]][[mech.tileNumber[1] + 1]].content == null) {
                    let moveToken = new MovementToken(assets.mttXMarker, [mech.tileNumber[0], mech.tileNumber[1] + 1], "X");
                    console.log("4");
                    console.log("4 content post: " + board[mech.tileNumber[0]][[mech.tileNumber[1] + 1]].content);
                    console.log("4 board[" + (mech.tileNumber[0]) + "][" + (mech.tileNumber[1] + 1) + "]");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            console.log("-----------------------")
        }
    }
    else {
        mechOUI.visible = true;

        if (mech.energy > 0) {
            if (mech.tileNumber[0] - 1 >= 0) {
                if (board[mech.tileNumber[0] - 1][[mech.tileNumber[1]]].content == null){
                    let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0] - 1, mech.tileNumber[1]], "O");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[0] + 1 <= 14) {
                if (board[mech.tileNumber[0] + 1][[mech.tileNumber[1]]].content == null) {
                    let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0] + 1, mech.tileNumber[1]], "O");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[1] - 1 >= 0) {
                if (board[mech.tileNumber[0]][[mech.tileNumber[1] - 1]].content == null) {
                    let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0], mech.tileNumber[1] - 1], "O");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
            if (mech.tileNumber[1] + 1 <= 14) {
                if (board[mech.tileNumber[0]][[mech.tileNumber[1] + 1]].content == null) {
                    let moveToken = new MovementToken(assets.mttOMarker, [mech.tileNumber[0], mech.tileNumber[1] + 1], "O");
                    tokens.push(moveToken);
                    mainGame.addChild(moveToken);
                }
            }
        }
    }
}

// Deselects everything that needs to be, this functions as a "click off" of something
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
    if (buildMarkers.length > 0) {
        for (let marker in buildMarkers) {
            buildMarkers[marker].deselect();
        }
        tokens = [];
    }
    mechXUI.visible = false;
    mechOUI.visible = false;
}

// Moves a mech of a specific team to a tileNumber
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

// Makes sure the mech info/stats text stays up-to-date
function reloadMechText() {
    mechXUI.text = ("Energy: " + mechX.energy + "/" + mechX.energyCapacity + " | Energy Regeneration: " + mechX.energyRegeneration  + " | Ore: " + mechX.ore);
    mechOUI.text = ("Energy: " + mechO.energy + "/" + mechO.energyCapacity + " | Energy Regeneration: " + mechO.energyRegeneration  + " | Ore: " + mechO.ore);
}

// Makes build markers for buildable (empty) tiles
function buildOptions() {
    if (turn == "X" && mechX.energy > 0 && mechX.ore >= 5) {
        for (let y = -1; y < 2; y++) {
            for (let x = -1; x < 2; x++) {
                if (!((y + mechX.tileNumber[0] < 0 && y == -1)|| (y + mechX.tileNumber[0] > 14 && y == 1) || 
                    (x + mechX.tileNumber[1] < 0 && x == -1) || (x + mechX.tileNumber[1] > 14 && x == 1))) {
                        if (board[y + mechX.tileNumber[0]][x + mechX.tileNumber[1]].content == null) {
                            let buildMarker = new BuildMarker([y + mechX.tileNumber[0], x + mechX.tileNumber[1]], turn);
                            buildMarkers.push(buildMarker);
                            mainGame.addChild(buildMarker);
                        }
                }
            }
        }
    }
    else if (turn == "O" && mechO.energy > 0 && mechO.ore >= 5) {
        for (let y = -1; y < 2; y++) {
            for (let x = -1; x < 2; x++) {
                if (!((y + mechO.tileNumber[0] < 0 && y == -1)|| (y + mechO.tileNumber[0] > 14 && y == 1) || 
                    (x + mechO.tileNumber[1] < 0 && x == -1) || (x + mechO.tileNumber[1] > 14 && x == 1))) {
                        if (board[y + mechO.tileNumber[0]][x + mechO.tileNumber[1]].content == null) {
                            let buildMarker = new BuildMarker([y + mechO.tileNumber[0], x + mechO.tileNumber[1]], turn);
                            buildMarkers.push(buildMarker);
                            mainGame.addChild(buildMarker);
                        }
                }
            }
        }
    }
}

// Builds a factory given a tile number
function BuildFactory(tileNumber) {
    if (turn == "X") {
        let factory = new Factory(assets.factoryXImg ,[tileNumber[0], tileNumber[1]], "X");
        onBoard.push(factory);
        factories.push(factory);
        mainGame.addChild(factory);
        knocking.play();
        mechX.ore -= 5;
        deselectAll();
    }
    else {
        let factory = new Factory(assets.factoryOImg ,[tileNumber[0], tileNumber[1]], "O");
        onBoard.push(factory);
        factories.push(factory);
        mainGame.addChild(factory);
        knocking.play();
        mechO.ore -= 5;
        deselectAll();
    }
    
}

// Regenerates energy not surpassing the max of a mech, and also triggers the HSMs to use energy they've stored
function rejuvinate(mech) {
    mech.energy += mech.energyRegeneration;
    if (mech.energy > mech.energyCapacity) {
        mech.energy = mech.energyCapacity;
    }
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            hsms[y][x].useEnergy();
        }
    }
    turnUI.text = "Turn: " + turn;

    for (let factory in factories) {
        factories[factory].fill();
    }

    checkForWinner();
}

// Checks if anyone has a 3-in-a-row for the HSMs
function checkForWinner() {
    for (let x = 0; x < 3; x++) {
      if (hsms[x][0].team != "null" && hsms[x][0].team == hsms[x][1].team && hsms[x][1].team == hsms[x][2].team) {
        pronounceWinner(hsms[x][0].team);
        return;
      }
    }
    for (let y = 0; y < 3; y++) {
      if (hsms[0][y].team != "null" && hsms[0][y].team == hsms[1][y].team && hsms[1][y].team == hsms[2][y].team) {
        pronounceWinner(hsms[0][y].team);
        return;
      }
    }
    if (hsms[0][0].team != "null" && hsms[0][0].team == hsms[1][1].team && hsms[1][1].team == hsms[2][2].team) {
      pronounceWinner(hsms[0][0].team);
      return;
    }
    else if (hsms[0][2].team != "null" && hsms[0][2].team == hsms[1][1].team && hsms[1][1].team == hsms[2][0].team) {
      pronounceWinner(hsms[2][0].team);
      return;
    }
  }

// If someone won, declare it!
function pronounceWinner(winner) {
    let winDisplay;
    if (winner == "X") {
        winDisplay = new PIXI.Sprite(assets.xWins);
    } else {
        winDisplay = new PIXI.Sprite(assets.oWins);
    }
    winDisplay.width = 950;
    winDisplay.height = 950;
    winDisplay.interactive = true;
    winDisplay.buttonMode = true;
    stage.addChild(winDisplay);
}