(function() {

  var canvas, context,
      keysDown = {},
      bgImage = new Image(),
      heroImage = new Image(),
      monsterImage = new Image(),
      bgReady = false,
      heroReady = false,
      monsterReady = false;

  var hero = {
    monstersCaught: 0,
    speed: 256, // pixels per second
    x: 0,
    y: 0
  };

  var monster = {
    x: 0,
    y: 0
  };

  var initializeCanvas = function() {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 480;
    document.body.appendChild(canvas);
  };

  var includeImages = function() {

    bgImage.onload = function () {
      bgReady = true;
    };
    bgImage.src = 'background.png';

    heroImage.onload = function () {
      heroReady = true;
    };
    heroImage.src = 'hero.png';

    monsterImage.onload = function () {
      monsterReady = true;
    };
    monsterImage.src = 'monster.png';
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
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
    monster.x = 32 + (Math.random() * (canvas.width - 64));
    monster.y = 32 + (Math.random() * (canvas.height - 64));
  };

  var update = function(modifier) {

    if (38 in keysDown) {//up
      hero.y -= hero.speed * modifier;
    }
    if (40 in keysDown) {//down
      hero.y += hero.speed * modifier;
    }
    if (37 in keysDown) {//left
      hero.x -= hero.speed * modifier;
    }
    if (39 in keysDown) {//right
      hero.x += hero.speed * modifier;
    }

    // Are they touching?
    if (
      hero.x <= (monster.x + 32)
      && monster.x <= (hero.x + 32)
      && hero.y <= (monster.y + 32)
      && monster.y <= (hero.y + 32)
    ) {
      ++hero.monstersCaught;
      reset();
    }
  };

  var render = function() {
    if (bgReady) {
      context.drawImage(bgImage, 0, 0);
    }
    if (heroReady) {
      context.drawImage(heroImage, hero.x, hero.y);
    }
    if (monsterReady) {
      context.drawImage(monsterImage, monster.x, monster.y);
    }

    //score
    context.fillStyle = "rgb(250, 250, 250)";
    context.font = "24px Helvetica";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("Monsters caught: " + hero.monstersCaught, 32, 32);
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

  var then = Date.now();

  initializeCanvas();
  includeImages();
  setupKeyboardListeners();
  reset();
  main();
}());