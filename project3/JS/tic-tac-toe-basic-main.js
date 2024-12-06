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

let board = [["e","e","e"],
             ["e","e","e"],
             ["e","e","e"]];

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
    boardImage: "images/TicTacToeBoardBasic.png",
    boardTileImage: "images/TicTacToeBoardBasicTile.png",
    oImage: "images/TTTOBasic.png",
    xImage: "images/TTTXBasic.png",
    oWins: "images/TicTacToeBoardBasicOWins.png",
    xWins: "images/TicTacToeBoardBasicXWins.png"
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}

async function setup() {
  await app.init({ width: 600, height: 600 });

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
      let boardTile = new Tile(assets.boardTileImage, 30 + (x*192), 30 + (y*192), { x: x, y: y});
      stage.addChild(boardTile);
    }
  }
}

function takeSpace(tileNumbers, tile) {
    if (board[tileNumbers.x][tileNumbers.y] == "e") {
      board[tileNumbers.x][tileNumbers.y] = turn;
      if (turn == "x") {
        makeXO("x", tile);
        turn = "o";
      } else {
        makeXO("o", tile);
        turn = "x";
      }
    }
}

function makeXO(XorO, tile) {
  let XO;
  if (XorO == "x") {
    XO = new PIXI.Sprite(assets.xImage);
  } else {
    XO = new PIXI.Sprite(assets.oImage);
  }
  XO.width = 156;
  XO.height = 156;
  XO.x = tile.x;
  XO.y = tile.y;
  stage.addChild(XO);
  checkForWinner();
}

function checkForWinner() {
  for (let x = 0; x < 3; x++) {
    if (board[x][0] != "e" && board[x][0] == board[x][1] && board[x][1] == board[x][2]) {
      pronounceWinner(board[x][0]);
      return;
    }
  }
  for (let y = 0; y < 3; y++) {
    if (board[0][y] != "e" && board[0][y] == board[1][y] && board[1][y] == board[2][y]) {
      pronounceWinner(board[0][y]);
      return;
    }
  }
  if (board[0][0] != "e" && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
    pronounceWinner(board[0][0]);
    return;
  }
  else if (board[0][2] != "e" && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
    pronounceWinner(board[2][0]);
    return;
  }

  let emptySlots = 0;
  board.forEach((item) => {
    item.forEach((innerItem) => {
      if (innerItem == "e") {
        emptySlots++;
      }
    })
  });
  if (emptySlots == 0) {
    location.reload();
  }
}

function pronounceWinner(winner) {
  let winDisplay;
  if (winner == "x") {
    winDisplay = new PIXI.Sprite(assets.xWins);
  } else {
    winDisplay = new PIXI.Sprite(assets.oWins);
  }
  winDisplay.width = 600;
  winDisplay.height = 600;
  stage.addChild(winDisplay);
}