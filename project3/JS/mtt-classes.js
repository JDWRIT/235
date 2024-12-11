class Tile extends PIXI.Sprite {
    constructor(texture, tileNumber) {
        super(texture);
        this.tileNumber = tileNumber;
        this.anchor.set(0.5, 0.5);
        this.width = 175;
        this.height = 175;
        this.x = (this.tileNumber[0] * this.width) + (this.width / 2);
        this.y = (this.tileNumber[1] * this.height) + (this.height / 2);
        this.speed = 500;
    }

    move(dt = 1 / 60, direction = [0, 0]) {
        this.x += direction[0] * this.speed * dt;
        this.y += direction[1] * this.speed * dt;
      }
}