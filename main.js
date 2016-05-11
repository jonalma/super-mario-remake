var game;
var SCREEN_W = 500;
var SCREEN_H = 340;

//BOOT STATE
//////////////////////////////////////////////////////////////////////////////
var bootState = {
    preload: function(){
      game.load.image('progressBar', 'assets/progressBar.png');  //preload the image.
    },
    
    create: function(){
      //these lines are in mainState, remove these lines from the mainState and add it here instead
      game.stage.backgroundColor = "#000000";   //black background, feel free to change it to whatever color
      game.physics.startSystem(Phaser.Physics.ARCADE);
      game.state.start('load'); //start the loadState - right now we have yet to add this state so that is next step!
    }
};

//LOAD STATE
//////////////////////////////////////////////////////////////////////////////
var loadState = {
    preload: function(){
        var loadingText = game.add.text(game.world.centerX, 150, 'Loading...', {font: '30px Roboto', fill: '#FFFFFF'});
        loadingText.anchor.setTo(.5, .5);
        
        var progressBar = game.add.sprite(game.world.centerX, 200, 'progressBar');
        progressBar.anchor.setTo(.5, .5);
        game.load.setPreloadSprite(progressBar);
        
        //move all of our loading of sprites into here
//         game.load.image('mario', 'assets/mario.png');
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('coin',  'assets/uCoin.png');
//         game.load.image('enemy', 'assets/enemy.png');
        game.load.spritesheet('mario', 'assets/marioSS.png', 16, 16);
        game.load.spritesheet('enemy', 'assets/greenShell.png', 20, 28);
        //add in a new sprite with the key of 'background', value of 'assets/background.png'
        game.load.image('background', 'assets/background.png'); 
    },

    create: function(){
        //start up the menu state that we will add in next lesson!
        game.state.start('menu');
    }
};

//MENU STATE
//////////////////////////////////////////////////////////////////////////////
var menuState = {
    //no need for a preload function because our loadState handles all the loading now! 
    create: function(){
        //use the newly added background image
        game.add.image(0, 0, 'background');

        var nameLabel = game.add.text(game.world.centerX, 80, 'THUPER DUPER UCOIN GAME', {font: '30px Arial', fill: '#FFFFFF'});
        nameLabel.anchor.setTo(.5, .5);

        var scoreLabel = game.add.text(game.world.centerX, game.world.centerY, 'Score: ' + game.global.score, {font: '25px Arial', fill: '#FFFFFF'});
        scoreLabel.anchor.setTo(.5, .5);

        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.addOnce(this.startGame, this);
    },
    
    startGame: function(){
        game.state.start('main'); //starts the game!
    }
};

// MAIN STATE
//////////////////////////////////////////////////////////////////////////////

var mainState = {
    
    //This function is called after the preload function
    //Here we set up the game, display sprites, etc.
    create: function() {
        //this.helloText = game.add.text(250, 170, 'Hello World!', {font: '20px Roboto',fill: '#FF0000'});
        
        //anchor.setto takes 0(left) to 1(right). (0,0) is the top-left most point of the image
        //this.helloText.anchor.setTo(0.5, 0.5);
        
        //Display the score
        this.scoreText = game.add.text(30, 30, 'Score: 0', {font: '18px Roboto', fill: '#FFFFFF' }); 
        
        //display MARIO SPRITE
        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'mario');
        this.sprite.anchor.setTo(0.5, 0.5); 
        // enable physics to MARIO
        game.physics.arcade.enable(this.sprite);
        this.sprite.body.gravity.y = 500;
        // add animations (key, framindices, fps, looping)
        this.sprite.animations.add('right', [4,5,6,7], 8, true);  
        this.sprite.animations.add('left', [3,2,1,0], 8, true);
        
        //To listen to all keyboard keys
        this.cursor = game.input.keyboard.createCursorKeys();
        
        //Create world with walls
        this.createWorld();
        
       //add coin to game
       this.coin = game.add.sprite(60, 140, 'coin');  
       this.coin.anchor.setTo(.5, .5);  //set anchor to be centered
       game.physics.arcade.enable(this.coin);  //enable arcade physics

       game.global.score = 0;   //Initialize a new state variable called score to 0
        
       // ADD enemies to the game
       this.enemies = game.add.group(); //Adds a group and we name it enemies!
       this.enemies.enableBody = true;   //Enables physics to the entire group.
       this.enemies.createMultiple(10, 'enemy') // Creates 10 of whatever key is passed as the second parameter
        
       //parameters : (timeInMS (1000 = 1sec), functionToCall, context (this) );
       game.time.events.loop(2000, this.spawnEnemy, this); //will call spawnEnemy every two seconds in this state.
    },
    
    //This function is called 60 times per second
    //It contains the game's logic
    update: function() {
        //all physics inside update should be placed at the start
        
        //add collision between mario and the walls
        game.physics.arcade.collide(this.sprite, this.walls); 
        // collision between mario and coins
        game.physics.arcade.overlap(this.sprite, this.coin, this.takeCoin, null, this);

        //add collision between mario and the enemy
        game.physics.arcade.collide(this.enemies, this.walls); 
        // collision between enemies and mario
        game.physics.arcade.overlap(this.enemies, this.sprite, this.restart, null, this);
        
        //this.sprite.angle++;
        this.movePlayer();
        
        //restart if mario dies
        if(!this.sprite.inWorld){
           this.restart();
        }
   
    },
    
    movePlayer: function(){
        if(this.cursor.left.isDown){ //if the left arrow key is down
           this.sprite.body.velocity.x = -200; //move the sprite to the left
           this.sprite.animations.play('left'); //plays the animation with the key 'left'
        }
        else if(this.cursor.right.isDown){  //if the right arrow key is down
           this.sprite.body.velocity.x = 200;  //move the sprite to the right
           this.sprite.animations.play('right'); //plays the animation with the key 'right'
        }
        else{ //stop the player
           this.sprite.body.velocity.x = 0; //stop the sprite
           this.sprite.frame = 4; //choose an idle frame looking left or right (3 or 4th frame)
        }

        //If the up arrow key is pressed and the player is touching the ground
        if(this.cursor.up.isDown && this.sprite.body.touching.down){
           this.sprite.body.velocity.y = -320;  //move the sprite upward
        }
    },
    
    createWorld: function(){
       this.walls = game.add.group();
       this.walls.enableBody = true;
       // Create the 10 walls 
       game.add.sprite(0, 0, 'wallV', 0, this.walls);         // Left 
       game.add.sprite(480, 0, 'wallV', 0, this.walls);        // Right
       game.add.sprite(0, 0, 'wallH', 0, this.walls);         // Top left 
       game.add.sprite(300, 0, 'wallH', 0, this.walls);        // Top right 
       game.add.sprite(0, 320, 'wallH', 0, this.walls);        // Bottom left 
       game.add.sprite(300, 320, 'wallH', 0, this.walls);    // Bottom right
       game.add.sprite(-100, 160, 'wallH', 0, this.walls);   // Middle left 
       game.add.sprite(400, 160, 'wallH', 0, this.walls);    // Middle right

       var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls); 
       middleTop.scale.setTo(1.5, 1); 
       var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls); 
       middleBottom.scale.setTo(1.5, 1);

       // Set all the walls to be immovable 
       this.walls.setAll('body.immovable', true);
    },
    
    restart: function(){
       //game.state.start('main');
       game.state.start('menu');
    },
    
    takeCoin: function(){
       //this.coin.kill();
       this.moveCoin();
       
       //this.score += 5;
       game.global.score += 5;
       this.scoreText.text = 'Score: ' + game.global.score; 
    },
    
    moveCoin: function()
    {
       // all possible positions
       var coinPosition = [ {x: 140, y: 60},   {x: 360, y: 60},
                            {x: 60,   y: 140}, {x: 440, y: 140},
                            {x: 130, y: 300}, {x: 370, y: 300}
                           ];
        
       for(var i = 0; i < coinPosition.length; i++){
           //check to see which one is currently the coin's position, we can just look at the X for simplicity.
           if(coinPosition[i].x == this.coin.x){
                //if they are the same then we must remove this position object to prevent it from moving to the same spot
                coinPosition.splice(i, 1); //removes 1 element starting at index i.
           }
       }

       //store a random position from the remaining positions.
       var newPosition = coinPosition[game.rnd.integerInRange(0, coinPosition.length - 1)];

       //reset the coin using this newPosition
       this.coin.reset(newPosition.x, newPosition.y); //reset takes 2 parameters (x, y) to set the sprite to that location.

    },
    
    spawnEnemy: function(){
       var enemy = this.enemies.getFirstDead();
       if(!enemy){
          return;
       }
       enemy.animations.add('spin', [0,1,2], 8, true);
        
       enemy.anchor.setTo(.5, 1);   //bottom middle point (not center)
       enemy.reset(game.world.centerX, 0); //spawn this enemy at the top center of the screen.
       enemy.body.gravity.y = 500;    //add gravity to this enemyu
       enemy.body.velocity.x = 100 * Phaser.Math.randomSign(); // 1 or -1
       enemy.body.bounce.x = 1;   //1 bounce = no velocity loss upon bouncing (perfect bounce)
       enemy.checkWorldBounds = true; //enables the enemy to check the world bounds every frame for the next line to work
       enemy.outOfBoundsKill = true;  //Kills the enemy if it is ever !inWorld (not in world)
       
        //play animations after creation
       enemy.animations.play('spin'); // Plays the animation, it never stops!
    }
    
};


game = new Phaser.Game(500, 340, Phaser.AUTO, 'game');
game.state.add('main', mainState);
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);

//create a global object
game.global = {
    score: 0     //adds a variable score to the global object to use for our score across states, to add more global variables just add a comma after setting its initial value.
}

game.state.start('boot');










