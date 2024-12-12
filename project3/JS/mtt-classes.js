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
        deselectAll();
        displayMechData(this)
    }

    deselect() {
        stopDisplayingMechData(this);
    }
}