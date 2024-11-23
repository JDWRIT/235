class Ship extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics {
    constructor(radius, color = 0xff0000, x = 0, y = 0) {
      super();
      this.beginFill(color);
      this.drawCircle(0, 0, radius);
      this.endFill();
      this.x = x;
      this.y = y;
      this.radius = radius;
      // variables
      this.fwd = getRandomUnitVector();
      this.speed = 50;
      this.isAlive = true;
    }
    
    _chase(dt) {
        let t = this.target;
        let amt = 3.0 * dt;
        let newX = cosineInterpolate(this.x, t.x, amt);
        let newY = cosineInterpolate(this.y, t.y, amt);
        this.x = newX;
        this.y = newY;
    }

    // abstract method - declared, but no implementation
    activate() {}
  
    // public methods to be called from main.js
    move(dt = 1 / 60) {
      this.x += this.fwd.x * this.speed * dt;
      this.y += this.fwd.y * this.speed * dt;
    }
  
    reflectX(sceneWidth) {
      this.fwd.x *= -1;
    }
  
    reflectY(sceneHeight) {
      this.fwd.y *= -1;
    }
  
    // protected methods
    _wrapX(sceneWidth) {
      if (this.fwd.x < 0 && this.x < 0 - this.radius) {
        this.x = sceneWidth + this.radius;
      }
      if (this.fwd.x > 0 && this.x > sceneWidth + this.radius) {
        this.x = 0 - this.radius;
      }
    }
  
    _wrapY(sceneHeight) {
      if (this.fwd.y < 0 && this.y < 0 - this.radius) {
        this.y = sceneHeight + this.radius;
      }
      if (this.fwd.y > 0 && this.y > sceneHeight + this.radius) {
        this.y = 0 - this.radius;
      }
    }
}

class WrappingCircle extends Circle {
    reflectX(sceneWdith) {
        this._wrapX(sceneWidth);
    }

    reflectY(sceneHeight) {
        this._wrapY(sceneHeight);
    }
}

class SeekingCircle extends Circle {
    activate(target) {
      this.target = target;
    }
  
    move(dt) {
      super._chase(dt);
    }
  }

class Bullet extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0) {
        super();
        this.rect(-2, -3, 4, 6);
        this.fill(color);
        this.x = x;
        this.y = y;
        // variables
        this.fwd = { x: 0, y: -1 };
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}