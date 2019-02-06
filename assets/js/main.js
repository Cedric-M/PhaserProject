//Default Phaser configuration
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

//Variables
var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var score = 0;

function preload() { //Phaser STEP 1 - preload
    //map
    this.load.tilemapTiledJSON('map', 'assets/img/map.json');
    //blocks
    this.load.spritesheet('tiles', 'assets/img/tiles.png', {frameWidth: 70, frameHeight: 70});
    //collectables blocks
    this.load.image('coin', 'assets/img/coinGold.png');
    //player animations
    this.load.atlas('player', 'assets/img/player.png', 'assets/img/player.json');
}

function create() { //Phaser STEP 2 - create
    //map
    map = this.make.tilemap({key: 'map'});
    var groundTiles = map.addTilesetImage('tiles');
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);


    var coinTiles = map.addTilesetImage('coin');
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    // limits of the world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // player   
    player = this.physics.add.sprite(200, 200, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map    
    player.body.setSize(player.width, player.height-8);
    this.physics.add.collider(groundLayer, player);

    coinLayer.setTileIndexCallback(17, collectCoin, this);
    this.physics.add.overlap(player, coinLayer);

    //player walk function
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    //player wait function
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });

    //movement using the keyboard
    cursors = this.input.keyboard.createCursorKeys();

    //camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);

    //background  
    this.cameras.main.setBackgroundColor('#ccccff');

    //score
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    text.setScrollFactor(0);
}

//player grab a box function
function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y);
    score++;
    text.setText(score);
    return false;
}

function update(time, delta) { //Phaser STEP 3 - update
    if (cursors.left.isDown) //left
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); 
        player.flipX = true;
    }
    else if (cursors.right.isDown)//right
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    } 

    if (cursors.up.isDown && player.body.onFloor()) //jump
    {
        player.body.setVelocityY(-500);        
    }
}
