class Tile extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0, tileNumber) {
        super(texture);
        this.x = x;
        this.y = y;
        this.width = 156;
        this.height = 156;
        this.interactive = true;
        this.buttonMode = true;
        this.tileNumber = tileNumber;
        this.on("pointerup", (e) => (takeSpace(this.tileNumber, this))); //startGame is a funcion reference
        this.on("pointerover", (e) => (e.target.alpha = 0.4)); // conccise arrow function with no brackets
        this.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); //ditto
    }
}