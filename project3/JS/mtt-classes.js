// Is the core of the game and what the entire map is made up of
class Tile extends PIXI.Sprite {
    constructor(texture, tileNumber) {
        super(texture);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 175;
        this.x = (this.tileNumber[0] * this.width) + (this.width / 2);
        this.y = (this.tileNumber[1] * this.height) + (this.height / 2);
        this.speed = 50;
        this.interactive = true;
        this.buttonMode = true;
        this.content = null;
        this.on("click", (e) => (deselectAll())); // clicked
        this.on("tap", (e) => (deselectAll())); // clicked mobile
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }
}

// Is the players primary object and what they directly control
class Mech extends PIXI.Sprite {
    constructor(texture, tileNumber, team) {
        super(texture);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 150;
        this.height = 150;
        this.x = (this.tileNumber[0] * 175) + (this.width / 2);
        this.y = (this.tileNumber[1] * 175) + (this.height / 2);
        this.speed = 50;
        this.team = team;
        this.energyCapacity = 4;
        this.energy = 4;
        this.energyRegeneration = 3;
        this.ore = 0;
        this.interactive = true;
        this.buttonMode = true;
        this.type = "Mech";
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
        board[this.tileNumber[0]][this.tileNumber[1]].content = this;
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    select() {
        if (turn == this.team) {
            deselectAll();
            displayMechData(this)
        }
    }

    deselect() {
        
    }

    moveMech(tileNumber){
        mechMove.play();
        board[this.tileNumber[0]][this.tileNumber[1]].content = null;
        this.tileNumber = tileNumber;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        tilePosition.content = this;
        this.energy--;
    }
}

// Spawns in to give the mech movement options
class MovementToken extends PIXI.Sprite {
    constructor(texture, tileNumber, team) {
        super(texture);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 100;
        this.height = 100;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        this.speed = 50;
        this.team = team;
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    select() {
        moveMech(this.team, this.tileNumber);
        if (this.team == "X" && mechX.energy > 0) {
            displayMechData(mechX);
        }
        else if (this.team == "O" && mechO.energy > 0) {
            displayMechData(mechO);
        }
    }

    deselect() {
        stage.removeChild(this)
    }
}

// Allows the player to end their turn
class EndTurn extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        this.width = 250;
        this.height = 69;
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
    }
    
    select() {
        if (turn == "X") {
            turn = "O";
            rejuvinate(mechO);
            deselectAll();
        }
        else {
            turn = "X";
            rejuvinate(mechX);
            deselectAll();
        }
    }
}

// The way to win, the HSM takes energy and uses it to display an energy-types color
class HSM extends PIXI.Sprite {
    constructor(tileNumber) {
        super(assets.hsmNull);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 200;
        this.height = 200;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        this.speed = 50;
        this.team = "null";
        this.type = "HSM";
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
        board[this.tileNumber[0]][this.tileNumber[1]].content = this;
        this.hsmBack = new HSMBack;

    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    select() {
        let check = this.proximityCheck();
        if (check) {
            this.hsmBack.visible = true;
            for (let hsmPower of this.hsmBack.powers) {
                hsmPower.visible = true;
            }
            this.visible = false;
        }
    }

    addFuel(team) {
        for (let i = 0; i < 8; i++) {
            if (this.hsmBack.powers[i].power == "null") {
                if (team == "X") {
                    this.hsmBack.powers[i].power = "X";
                    this.hsmBack.powers[i].texture = assets.hsmPowerX;
                }
                else {
                    this.hsmBack.powers[i].power = "O";
                    this.hsmBack.powers[i].texture = assets.hsmPowerO;
                }
                return true;
            }
        }
        return false;
    }

    proximityCheck() {
        if (turn == "X") {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (board[y + this.tileNumber[1]][x + this.tileNumber[0]].content == mechX) {
                        return true;
                    }
                }
            }
        }
        else {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (board[y + this.tileNumber[1]][x + this.tileNumber[0]].content == mechO) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    deselect() {
        this.visible = true;
        for (let hsmPower of this.hsmBack.powers) {
            hsmPower.visible = false;
        }
        this.hsmBack.visible = false;
    }

    useEnergy() {
        this.switchTeam(this.hsmBack.powers[0].power);
        for (let i = 0; i < this.hsmBack.powers.length; i++) {
            if (i == 7) {
                this.hsmBack.powers[i].switchPower("null");
                return;
            }
            this.hsmBack.powers[i].switchPower(this.hsmBack.powers[i + 1].power);
        }
    }

    switchTeam(team) {
        if (team == "X") {
            this.team = "X";
            this.texture = assets.hsmX;
        }
        else if (team == "O") {
            this.team = "O";
            this.texture = assets.hsmO;
        }
        else {
            this.team = "null";
            this.texture = assets.hsmNull;
        }
    }
}

// The background image for the HSMPower sprites so they don't crowd the main screen
class HSMBack extends PIXI.Sprite {
    constructor() {
        super(assets.hsmBack);
        this.anchor.set(0.5, 0.5);
        this.width = 600;
        this.height = 600;
        this.x = 500;
        this.y = 500;
        this.interactive = true;
        this.buttonMode = true;
        this.visible = false;
        this.powers = [];
        stage.addChild(this);

        for (let i = 0; i < 8; i++) {
            let hsmPower = new HSMPower(this, i);
            hsmPower.y = (250 + (i * 70));
            this.powers.push(hsmPower);
        }        
    }
}

// The power cells for the HSM that supply it with energy in their respective orders
class HSMPower extends PIXI.Sprite {
    constructor(hsmBack, number) {
        super(assets.hsmPowerNull);
        this.anchor.set(0.5, 0.5);
        this.width = 200;
        this.height = 65;
        this.x = 500;
        this.interactive = true;
        this.buttonMode = true;
        this.visible = false;
        this.number = number;
        this.power = "null";
        this.hsmBack = hsmBack;
        stage.addChild(this);     
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
    }

    select() {
        if (turn == "X" && mechX.energy > 0 && this.power == "null") {
            for (let i = 0; i < this.number; i++) {
                if (this.hsmBack.powers[i].power == "null") {
                    return;
                }
            }
            powerUp.play();
            mechX.energy -= 1;
            this.power = "X";
            this.texture = assets.hsmPowerX;
        }
        else if (turn == "O" && mechO.energy > 0 && this.power == "null"){
            for (let i = 0; i < this.number; i++) {
                if (this.hsmBack.powers[i].power == "null") {
                    return;
                }
            }
            powerUp.play();
            mechO.energy -= 1;
            this.power = "O";
            this.texture = assets.hsmPowerO;
        }
    }

    switchPower(power) {
        this.power = power;
        if (power == "X") {
            this.texture = assets.hsmPowerX;
        }
        else if (power == "O") {
            this.texture = assets.hsmPowerO;
        }
        else {
            this.texture = assets.hsmPowerNull;
        }
    }
}

// This is how you build and fuel factories, mining ore is the best strategy towards winning the long game
class Ore extends PIXI.Sprite {
    constructor(tileNumber) {
        super(assets.oreImage);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 175;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        this.speed = 50;
        this.ore = 3;
        this.type = "Ore";
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
        board[this.tileNumber[0]][this.tileNumber[1]].content = this;
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    select() {
        let check = this.proximityCheck();
        if (check) {
            if (turn == "X" && mechX.energy > 0) {
                mechX.ore += 1;
                mechX.energy -= 1;
                oreGrind.play();
                this.ore -= 1;
                reloadMechText();
                if (this.ore <= 0) {
                    this.visible = false;
                    board[this.tileNumber[0]][this.tileNumber[1]].content = null;
                    displayMechData(mechX);
                }
                if (mechX.energy <= 0) {
                    for (let token in tokens) {
                        tokens[token].deselect();
                    }
                    tokens = [];
                }
            }
            else if (turn == "O" && mechO.energy > 0) {
                mechX.ore += 1;
                mechX.energy -= 1;
                oreGrind.play();
                this.ore -= 1;
                reloadMechText();
                if (this.ore <= 0) {
                    this.visible = false;
                    board[this.tileNumber[0]][this.tileNumber[1]].content = null;
                    displayMechData(mechO);
                }
                if (mechO.energy <= 0) {
                    for (let token in tokens) {
                        tokens[token].deselect();
                    }
                    tokens = [];
                }
            }
        }
    }

    proximityCheck() {
        if (turn == "X") {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (!((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                        (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1))) {
                            if (board[x + this.tileNumber[0]][y + this.tileNumber[1]].content == mechX) {
                                return true;
                            }
                    }
                }
            }
        }
        else {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (!((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                        (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1))) {
                        if (board[y + this.tileNumber[1]][x + this.tileNumber[0]].content == mechO) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    deselect() {
        
    }
}

// Signals the game that the player wants to build
class BuildButton extends PIXI.Sprite {
    constructor() {
        super(assets.buildButton);
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 78.4;
        this.x = sceneWidth - 100;
        this.y = 100;
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
    }

    select() {
        buildOptions();
    }
}

// The wonderful markers representing where you can build
class BuildMarker extends PIXI.Sprite {
    constructor(tileNumber, team) {
        super(assets.buildMarkerImg);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 100;
        this.height = 100;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        this.speed = 50;
        this.team = team;
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    select() {
        BuildFactory(this.tileNumber);
    }

    deselect() {
        stage.removeChild(this)
    }
}

// The factory supplies power to the HSM given fuel, and it has a great conversion rate of ore to fuel of 1 for 2!
class Factory extends PIXI.Sprite {
    constructor(texture, tileNumber, team) {
        super(texture);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 175;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        this.speed = 50;
        this.hsm = null;
        this.fuel = 0;
        this.team = team;
        this.type = "Factory";
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
        board[this.tileNumber[0]][this.tileNumber[1]].content = this;
        this.factoryBack = new FactoryBack(this);
        this.fillButton = new FactoryFill(this);
        this.findHSM();
        this.infoText= new PIXI.Text("Fuel: 0", {
            fill: 0xffffff,
            fontSize: 35,
            fontFamily: "Arial",
            stroke: 0xff0000,
            strokeThickness: 6,
        });
        this.infoText.x = 500;
        this.infoText.y = 550;
        this.infoText.visible = false;
        stage.addChild(this.infoText);
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
    }

    findHSM() {
        for (let y = -1; y < 2; y++) {
            for (let x = -1; x < 2; x++) {
                if (!((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                    (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1))) {
                        if (board[x + this.tileNumber[0]][y + this.tileNumber[1]].content != null) {
                            if (board[x + this.tileNumber[0]][y + this.tileNumber[1]].content.type == "HSM") {
                                this.hsm = board[x + this.tileNumber[0]][y + this.tileNumber[1]].content;
                            }
                        }
                }
            }
        }
    }

    fill() {
        if (this.fuel > 0 && this.hsm != null) {
            let c = this.hsm.addFuel(this.team);
            if (c) {
                this.fuel -= 1;
            }
        }
    }

    select() {
        let check = this.proximityCheck();
        if (check) {
            this.visible = false;
            this.factoryBack.visible = true;
            this.fillButton.visible = true;
            this.infoText.visible = true;
            this.infoText.text = "Fuel: " + this.fuel;
        }
    }

    proximityCheck() {
        if (turn == "X") {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (!((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                        (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1))) {
                            if (board[x + this.tileNumber[0]][y + this.tileNumber[1]].content == mechX) {
                                return true;
                            }
                    }
                }
            }
        }
        else {
            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (!((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                        (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1))) {
                        if (board[y + this.tileNumber[1]][x + this.tileNumber[0]].content == mechO) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    deselect() {
        this.visible = true;
        this.factoryBack.visible = false;
        this.fillButton.visible = false;
        this.infoText.visible = false;
    }
}

// The background image for the Factory Fill button and fuel status UI
class FactoryBack extends PIXI.Sprite {
    constructor(factory) {
        super(assets.factoryBackImg);
        this.anchor.set(0.5, 0.5);
        this.width = 600;
        this.height = 600;
        this.x = 500;
        this.y = 500;
        this.myFactory = factory;
        this.interactive = true;
        this.buttonMode = true;
        this.visible = false;
        stage.addChild(this);
    }
}

// If you have ore to spare, fuel up the factory with this button
class FactoryFill extends PIXI.Sprite {
    constructor(factory) {
        super(assets.fillImg);
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 78.4;
        this.x = 600;
        this.y = 400;
        this.interactive = true;
        this.buttonMode = true;
        this.on("click", this.select); // clicked
        this.on("tap", this.select); // clicked mobile
        this.visible = false;
        this.factory = factory;
        stage.addChild(this);
    }

    select() {
        if (turn == "X" && mechX.ore > 0) {
            this.factory.fuel += 2;
            oreGrind.play();
            mechX.ore -= 1;
            this.factory.infoText.text = "Fuel: " +  this.factory.fuel;
        }
        else if (turn == "O" && mechO.ore > 0) {
            this.factory.fuel += 2;
            oreGrind.play();
            mechX.ore -= 1;
            this.factory.infoText.text = "Fuel: " +  this.factory.fuel;
        }
    }
}