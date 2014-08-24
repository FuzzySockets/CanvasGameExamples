(function() {

  var CANVAS_WIDTH = 1024,
      CANVAS_HEIGHT = 480,
      ENEMY_COUNT = 9;

  var canvas, context, bgImage, shipImage, heroShip,
      enemyVessels = [],
      keysDown = {},
      then = Date.now();

  //
  // Ship
  //
  var Ship = function (image, speed, strength) {
    if (image instanceof GameImage === false) {
      throw TypeError('image must be an instance of GameImage')
    }
    this.image = image;
    this.strength = strength || 10;
    this.speed = speed || 512;
  };

  Ship.prototype.moveLeft = function (modifiedSpeed) {
    this.image.x -= modifiedSpeed;
  };

  Ship.prototype.moveRight = function (modifiedSpeed) {
    this.image.x += modifiedSpeed;
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
        heroShip.moveLeft(modifiedSpeed);
      }
      if (39 in keysDown) {
        heroShip.moveRight(modifiedSpeed);
      }
    },
    delegateSingleKeyPress: function (keyCode) {
      if (keyCode === 32) {
        if (enemyVessels.length > 0) {
          console.log('instantiate a new missle');
        }
      }
    }
  };

  //
  // Automatic movement handling
  //
  var automaticMovement = {
    moveInProgress: false,
    direction: 'right',
    move: function (modifier) {

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
        delete keysDown[e.keyCode];
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