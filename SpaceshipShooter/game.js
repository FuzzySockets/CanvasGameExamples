(function() {

  //TODO: Refactor into seperate js files

  var CANVAS_WIDTH = 1024,
      CANVAS_HEIGHT = 480,
      ENEMY_COUNT = 9,
      GAME_IMAGE_TYPE_ERROR = 'image must be an instance of GameImage';

  var canvas, context, bgImage, shipImage, heroShip,
      missles = [],
      enemyVessels = [],
      keysDown = {},
      then = Date.now();

  //
  // Ship
  //
  var Ship = function (image, speed, strength) {
    if (image instanceof GameImage === false) {
      throw TypeError(GAME_IMAGE_TYPE_ERROR);
    }
    this.image = image;
    this.strength = strength || 10;
    this.speed = speed || 200;
    this.velocity = 0;
    this.intervals = []
  };

  Ship.prototype.moveLeft = function (modifiedSpeed, useAccelleration) {

    var me = this;

    if (me.image.x <= 0) {
      return;
    }

    if (useAccelleration) {

      this.intervals.push(setInterval(function () {
        if (me.velocity < 7) {
          me.velocity += .05;
        }
      }, 40));
    } else {
      me.velocity = 1;
    }

    this.image.x -= modifiedSpeed * this.velocity;
  };

  Ship.prototype.moveRight = function (modifiedSpeed, useAccelleration) {

    var me = this;

    if (me.image.x >= CANVAS_WIDTH - 65) {
      return;
    }

    if (useAccelleration) {
      this.intervals.push(setInterval(function () {
        if (me.velocity < 7) {
          me.velocity += .05;
        }
      }, 40));
    } else {
      me.velocity = 1;
    }

    this.image.x += modifiedSpeed * this.velocity;
  };

  //Missle
  //TODO: Refactor with Ship
  var Missle = function (image, speed, strength) {
    if (image instanceof GameImage === false) {
      throw TypeError(GAME_IMAGE_TYPE_ERROR);
    }
    this.image = image;
    this.strength = strength || 10;
    this.speed = speed || 512;
  };

  Missle.prototype.moveUp = function (modifiedSpeed) {
    this.image.y -= modifiedSpeed;
  };

  Missle.prototype.detectStrike = function (enemyVessels) {

    var me = this;

    enemyVessels.forEach(function (vessel) {
      if (!me.image || !vessel) {
        return false;
      }
      if (me.image.x <= (vessel.image.x + 65) &&
          me.image.y <= (vessel.image.y + 65) &&
          vessel.image.x <= (me.image.x + 20) &&
          vessel.image.y <= (me.image.y + 65)
      ) {
        me.image.y -= 2000;
        vessel.image.x -= 2000;
        enemyVessels.splice(enemyVessels.indexOf(vessel), 1);
        missles.splice(missles.indexOf(me), 1);
        delete vessel.image;
        delete me.image;
        return true;
      }
    });
  };

  //
  // GameImage
  //
  var GameImage = function (path, x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.ready = false;
    this.path = path;
    this.image = new Image();
    this.load();
  };

  GameImage.prototype.load = function () {
    var me = this;
    this.image.onload = function () {
      me.ready = true;
    };
    this.image.src = this.path;
  };

  GameImage.prototype.isReady = function () {
    return this.ready;
  };

  GameImage.prototype.draw = function () {
    context.drawImage(this.image, this.x, this.y);
  };

  //
  // Canvas
  //
  var canvasManager = {

    images: [],

    registerImage: function (gameImage) {
      var images = this.images;
      if (images.indexOf(gameImage) !== 1) {
        images.push(gameImage);
      }
      return gameImage;
    },

    initializeCanvas: function () {
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      document.body.appendChild(canvas);
    },

    render: function () {
      this.images.forEach(function (image) {
        if (image.isReady()) {
          image.draw();
        }
      });
    }
  };

  //
  // Key press delegator
  //
  var keyPressDelegator = {
    delegateKeyHolding: function (modifier) {
      var modifiedSpeed = heroShip.speed * modifier;
      if (37 in keysDown) {
        heroShip.moveLeft(modifiedSpeed, true);
      }
      if (39 in keysDown) {
        heroShip.moveRight(modifiedSpeed, true);
      }
    },
    delegateSingleKeyPress: function (keyCode) {
      if (keyCode === 32) {
        if (enemyVessels.length > 0) {
          var missleImage = canvasManager.registerImage(new GameImage('images/rocket.png', heroShip.image.x, heroShip.image.y - 65)),
              missle = new Missle(missleImage, 1024);
          missles.push(missle);
        }
      }
    }
  };

  //
  // Automatic movement handling
  // TODO: Refactor
  var automaticMovement = {
    direction: 'right',
    move: function (modifier) {

      //Refactor into missle class
      if (enemyVessels.length > 0) {

        var firstEnemyX = enemyVessels[0].image.x,
        lastEnemyX = enemyVessels[enemyVessels.length - 1].image.x,
        me = this;

        if (me.direction === 'right') {
          enemyVessels.forEach(function (vessel) {
            vessel.moveRight(vessel.speed * modifier);
          });
          if ((lastEnemyX + 65) > CANVAS_WIDTH) {
            me.direction = 'left';
          }
        }

        if (me.direction === 'left') {
          enemyVessels.forEach(function (vessel) {
            vessel.moveLeft(vessel.speed * modifier);
          });
          if (firstEnemyX < 0) {
            me.direction = 'right';
          }
        };
      }

      missles.forEach(function (missle) {
        missle.moveUp(missle.speed * modifier);
      });
    }
  };

  //
  // Game and main loop
  //
  var game = {

    mainLoop: function mainLoop() {
      var now = Date.now();
      var delta = now - then;
      keyPressDelegator.delegateKeyHolding(delta / 1000);
      automaticMovement.move(delta / 1500);

      missles.forEach(function (missle) {
        missle.detectStrike.call(missle, enemyVessels);
      });

      canvasManager.render();
      then = now;
      requestAnimationFrame(mainLoop);
    },

    loadGameObjects: function () {
      bgImage = canvasManager.registerImage(new GameImage('images/background.png'));
      shipImage = canvasManager.registerImage(new GameImage('images/ship.png', CANVAS_WIDTH / 2 - 32, CANVAS_HEIGHT - 75));
      heroShip = new Ship(shipImage);
      for (var i = 0; i < ENEMY_COUNT; i++) {
        var enemyVesselImage = canvasManager.registerImage(new GameImage('images/enemy.png', i * 75 + 150)),
            enemyVesselShip = new Ship(enemyVesselImage);
            enemyVessels[i] = enemyVesselShip;
      }
    },

    setupKeyboardListeners: function () {

      addEventListener('keydown', function(e) {
        var keyCode = e.keyCode;
        keysDown[keyCode] = true;
        keyPressDelegator.delegateSingleKeyPress(keyCode);
      }, false);

      addEventListener('keyup', function(e) {
        if (e.keyCode === 37 || e.keyCode === 39) {
          delete keysDown[e.keyCode];
          heroShip.velocity = 0;
          heroShip.intervals.forEach(function (interval) {
            clearInterval(interval);
          });
        }
      }, false);
    },

    start: function () {
      this.loadGameObjects();
      canvasManager.initializeCanvas();
      canvasManager.render();
      this.setupKeyboardListeners();
      this.mainLoop();
    }
  };

  game.start();

}());