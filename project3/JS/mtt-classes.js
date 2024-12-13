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
        this.energy = 3;
        this.energyRegeneration = 3;
        this.ore = 0;
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
        if (turn == this.team) {
            deselectAll();
            displayMechData(this)
        }
    }

    deselect() {
        stopDisplayingMechData(this);
    }

    moveMech(tileNumber){
        board[this.tileNumber[0]][this.tileNumber[1]].content = null;
        this.tileNumber = tileNumber;
        let tilePosition = board[this.tileNumber[0]][this.tileNumber[1]];
        this.x = tilePosition.x;
        this.y = tilePosition.y;
        tilePosition.content = this;
        console.log("tile num " + tilePosition.tileNumber);
        console.log("tile pos y " + tilePosition.y);
        this.energy--;
    }
}

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

class EndTurn extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        this.width = 150;
        this.height = 41.4;
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
                this.ore -= 1;
                reloadMechText();
                if (this.ore <= 0) {
                    this.visible = false;
                    board[this.tileNumber[0]][this.tileNumber[1]].content = null;
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
                this.ore -= 1;
                reloadMechText();
                if (this.ore <= 0) {
                    this.visible = false;
                    board[this.tileNumber[0]][this.tileNumber[1]].content = null;
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
                    if ((y + this.tileNumber[1] < 0 && y == -1)|| (y + this.tileNumber[1] > 14 && y == 1) || 
                        (x + this.tileNumber[0] < 0 && x == -1) || (x + this.tileNumber[0] > 14 && x == 1)) {
                        console.log(":(");
                    }
                    else {
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
                    if (board[y + this.tileNumber[1]][x + this.tileNumber[0]].content == mechO) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    deselect() {
        
    }
}

class Factory extends PIXI.Sprite {
    constructor(texture, tileNumber) {
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
            
        }
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
        
    }
}