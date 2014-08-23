/*
 * Spaghetti code game experimentation
 * Minimal & broken mario style game
 */
(function() {

  var CANVAS_WIDTH = 1024,
      CANVAS_HEIGHT = 480;

  var canvas, context,
      allowCoinCollection = true,
      gameOver = false,
      startTime = new Date().getTime(),
      gameDuration = null,
      keysDown = {},
      bgImage = new Image(),
      heroImage = new Image(),
      coinImage = new Image(),
      abs = Math.abs;

  var then = Date.now();

  var hero = {
    coinsCollected: 0,
    jumpInProgress: false,
    speed: 512, // pixels per second
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 75
  };

  var monster = {
    x: 0,
    y: 0
  };

  var coin = {
    x: 0,
    y: 0
  };

  var background = {
    x: 0,
    y: 0
  };

  var initializeCanvas = function() {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
  };

  var loadImage = function(image, source) {
    image.onload = function() {
      image.isReady = true;
    };
    image.src = source;
  };

  var loadImages = function() {
    loadImage(bgImage, 'images/background2.png');
    loadImage(heroImage, 'images/hero.png');
    loadImage(coinImage, 'images/coin.png');
    //loadImage(monsterImage, 'images/monster.png');
  };

  var setupKeyboardListeners = function() {

    addEventListener('keydown', function(e) {
      keysDown[e.keyCode] = true;
    }, false);

    addEventListener('keyup', function(e) {
      delete keysDown[e.keyCode];
    }, false);
  };

  var reset = function() {
    coin.x = 25 + (Math.random() * (canvas.width - 64));
    coin.y = 300;
  };

  var update = function(modifier) {

    if (gameOver === true) {
      return;
    };

    if (32 in keysDown) {

      if (!hero.jumpInProgress) {

        hero.jumpInProgress = true;

        var jumpUp = setInterval(function () {
          hero.y = hero.y - 10;
        }, 20);

        setTimeout(function () {

          clearInterval(jumpUp);
          var jumpDown = setInterval(function () {
            hero.y = hero.y + 10;
          }, 20);

          setTimeout(function () {
            clearInterval(jumpDown);

            setTimeout(function () {
              hero.jumpInProgress = false;
            }, 150);

          }, 150);

        }, 150);
      }
    }

    if (38 in keysDown) {//up
      if (hero.y > 10) {
        hero.y -= hero.speed * modifier;
      }
    }
    if (40 in keysDown) {//down
      if (hero.y < canvas.height - 40) {
        hero.y += hero.speed * modifier;
      }
    }
    if (37 in keysDown) {//left
      if (background.x < -5) {
        background.x += hero.speed * modifier;
        coin.x += hero.speed * modifier;
      } else if (hero.x > background.x) {
        hero.x -= hero.speed * modifier;
      }

    }
    if (39 in keysDown) {//right
      if (hero.x <= CANVAS_WIDTH / 2) {
        hero.x += hero.speed * modifier;
      } else if (abs(background.x - CANVAS_WIDTH) < bgImage.naturalWidth - 5) {
        background.x -= hero.speed * modifier;
        coin.x -= hero.speed * modifier;
      }
    }

    // Are they touching?
    if (hero.x <= (coin.x + 40)
      && coin.x <= (hero.x + 40)
      && hero.y <= (coin.y + 40)
      && coin.y <= (hero.y + 40)
    ) {

      if (allowCoinCollection) {
        if (hero.coinsCollected === 4) {

          endGame();

          allowCoinCollection = false;
          hero.coinsCollected++;

          setTimeout(function() {
            allowCoinCollection = true;
          }, 150);



        } else {

          allowCoinCollection = false;
          hero.coinsCollected++;

          setTimeout(function() {
            allowCoinCollection = true;
          }, 150);

          reset();
        }
      }
    }
  };

  var render = function() {
    if (bgImage.isReady) {
      context.drawImage(bgImage, background.x, background.y);
    }
    if (heroImage.isReady) {
      context.drawImage(heroImage, hero.x, hero.y);
    }
    if (coinImage.isReady) {
      context.drawImage(coinImage, coin.x, coin.y);
    }
    /*
    if (monsterImage.isReady) {
      context.drawImage(monsterImage, monster.x, monster.y);
    }*/

    //score
    context.fillStyle = "rgb(250, 250, 250)";
    context.font = "24px Helvetica";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("Coins: " + hero.coinsCollected, 32, 32);

    if (gameOver === true) {
      context.fillStyle = "rgb(250, 250, 250)";
      context.font = "24px Helvetica";
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillText("You won in " + gameDuration + ' seconds.', CANVAS_WIDTH / 2 - 150, 32);
    }
  };

  var endGame = function () {
    gameOver = true;
    gameDuration = (new Date().getTime() - startTime) / 1000;
    hero.x = -500;
    coin.x = -500;
  };

  //main game loop
  var main = function() {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    requestAnimationFrame(main);
  };

  var startGame = function() {
    initializeCanvas();
    loadImages();
    setupKeyboardListeners();
    reset();
    render();
    main();
  };

  startGame();


}());