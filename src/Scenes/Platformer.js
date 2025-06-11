class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }



    preload() {

        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    init() {
        // variables and settings
        this.ACCELERATION = 2000;
        this.DRAG = 5000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        //this.physics.world.gravity.y = 0;

        this.physics.world.TILE_BIAS = 48;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 100;

        this.dash_angleX = 0;
        this.dash_angleY = 0;
        //this.DASHX = 600;
        //this.DASHY = 600;

        this.MAX_DASHES = 1;
        this.dashes = this.MAX_DASHES;

        // Time is how many ticks the game still reads the players input AFTER they release the key
        // Timer is just techincal, do not change value from 0 outside of update()
        this.yDashTime = 0.05 * 1000;
        this.yDashTimer = 0;
        this.xDashTime = 0.05 * 1000;
        this.xDashTimer = 0;
        this.DASH_NUM = 800;
        this.CLINGDELAY = 100;
        this.clingTimer = 0;
        this.MAX_CLINGS = 1;
        this.clings = 1;
        this.clinging = false;


        //this.MAX_SPEED = 1000;
        this.MAX_VELOCITYX = 300;

        this.MAX_DASH_VELOCITY = 2000;

        //dashing variable
        this.isDashing = false;

        this.resetting = false;

        this.BOUNDSX = 60 * 16 + 120;
        this.BOUNDSY = 250 * 16 + 320;

        
        
    }

    create() {

        

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //MAP LOADING

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 30 tiles wide and 120 tiles tall.
        this.map = this.add.tilemap("platformer-level-2", 18, 18, 30, 120);
        //this.map = this.add.tilemap("platformer-level-2", 18, 18, 30, 120);
        this.physics.world.setBounds(0, 0, this.BOUNDSX, this,this.BOUNDSY, true, true, true, true);
        

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.default_tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.pixel_tileset = this.map.addTilesetImage("pixel-tilemap_packed", "pixel_tilemap_tiles");
        this.background_tileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles")
        

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.default_tileset, 0, 0);
        this.groundLayer.setScale(2);
        this.backgroundLayer = this.map.createLayer("Background", this.pixel_tileset, 0, 0);
        this.backgroundLayer.setScale(2);
        this.backgroundLayer.setDepth(-1);

            // Find bees in the "Objects" layer in Phaser
            // Look for them by finding objects with the name "bee"
            // Assign the bee texture from the pixel_tilemap_tiles sprite sheet
            // Phaser docs:
            // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.bees = this.map.createFromObjects("Objects", {
            name: "bee",
            key: "pixel_tilemap_sheet",       // change this name?
            frame: 52,
        });
                                            //MAP LOADING END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //BEE LOADING
         this.anims.create({
            key: 'beeAnim', // Animation key
            frames: this.anims.generateFrameNumbers('pixel_tilemap_sheet', 
                {start: 51, end: 52}
            ),
            frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        // Play the same animation for every memeber of the Object coins array
        this.anims.play('beeAnim', this.bees);


        this.physics.world.enable(this.bees, Phaser.Physics.Arcade.STATIC_BODY);

        
        // Create a Phaser group out of the array this.bees
        // This will be used for collision detection below.

        for (let bee in this.bees) {
            this.bees[bee].setScale(2);
            this.bees[bee].x *= 2;
            this.bees[bee].y *= 2;

            this.bees[bee].body.x = this.bees[bee].body.x * 2 + 10;
            this.bees[bee].body.y = this.bees[bee].body.y * 2 + 10;
        }
        
        this.beeGroup = this.add.group(this.bees);

                                            //BEE LOADING END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //PARTICLE CREATION

    // bee particle creation
        this.beeParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_03.png', 'magic_05.png'],
            // TODO: Try: add random: true
            scale: {start: 0.1, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            gravityY: 0,
            alpha: {start: 1, end: 0.1}, 
            stopAfter: 3
        }).stop();

    // walk particle creation
        this.walkParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 3,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        }).stop();

                                            //PARTICLE CREATION END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //CREATE PLAYER BODY

        // set up player avatar                    game.config.width/4, game.config.height/2
        //my.sprite.player = this.physics.add.sprite(300, 50, "platformer_characters", "tile_0000.png").setScale(2);
        my.sprite.player = this.physics.add.sprite(260, 3750, "platformer_characters", "tile_0000.png").setScale(2);
        my.sprite.player.body.setMaxVelocityX(this.MAX_VELOCITYX);
        my.sprite.player.body.allowGravity = true;

                                            //CREATE PLAYER BODY END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //COLLISION HANDLING

                // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        my.sprite.player.setCollideWorldBounds(true);

                // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        my.sprite.player.body.setSize(my.sprite.player.body.width - 10, my.sprite.player.body.height - 10);
        my.sprite.player.body.setOffset(5,10);

    
                // Handle collision detection with bees
        this.physics.add.overlap(my.sprite.player, this.beeGroup, (obj1, obj2) => {
                //this.beeParticles.startFollow(obj2, obj2.displayWidth, obj2.displayHeight, false);
            this.beeParticles.startFollow(obj2);
            obj2.destroy(); // remove bee on overlap
                // play collection sound
            this.collectSFX.play();
                // start bee particles
            this.beeParticles.start();

        });

                                            //COLLISION HANDLING END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //KEY OBJECTS

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        
        // debug key listener (assigned to i key)
        this.input.keyboard.on('keydown-I', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
        
        // disable debug
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        this.physics.world.debugGraphic.clear()


        // Set up key objects
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

                                            //KEY OBJECTS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //CAMERA

        // Camera
        this.cameras.main.setBounds(0, 0, this.BOUNDSX, this.BOUNDSY);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //SOUND EFFECTS

        this.jumpSFX = this.sound.add("jumpSFX");
        this.jumpSFX.loop = false;
        this.jumpSFX.volume = 0.25;

        this.collectSFX = this.sound.add("collectSFX");
        this.collectSFX.loop = false;
        this.collectSFX.volume = 0.15;

                                            //SOUND EFFECTS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //ANIMATED TILES 
        this.animatedTiles.init(this.map);

                                            //ANIMATED TILES END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////       
    }


    touchingSides() {
        console.log("touchingSides");
        if (my.sprite.player.body.blocked.left || my.sprite.player.body.blocked.right) {
            return true;
        } else {
            let tile = (this.map.getTileAtWorldXY(my.sprite.player.body.x - 12, my.sprite.player.body.y)) || (this.map.getTileAtWorldXY(my.sprite.player.body.x + 30, my.sprite.player.body.y));
            //this.add.sprite(my.sprite.player.body.x + 35, my.sprite.player.body.y, "player");
                return tile && tile.properties.collides;
        }
    }

    update(time, delta) {

        
        //console.log("gravity at start: " + my.sprite.player.body.allowGravity);
        //console.log("is clinging at start: " + this.clinging);
        //console.log("clings: " + this.clings);
        //console.log("Body Blocked" + (my.sprite.player.body.blocked.left || my.sprite.player.body.blocked.right));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //TIMERS
        
        // Timers go down per tick
        // TODO check the change for delta time, should be working
        this.yDashTimer -= delta;
        this.xDashTimer -= delta;

        // iterate cling delay only if it is above 0
        if (this.clingTimer > 0) {
            this.clingTimer -= delta;
        }

        if (this.resetting == true) {
            this.endTimer -= delta;
        }

                                                //TIMERS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            //RESET DASH/CLING COUNTERS

        // when the player touches the ground, set dashes back to MAX_DASHES
        if((my.sprite.player.body.blocked.down) || (this.clinging == true)) {
            if (this.dashes != this.MAX_DASHES) {
                this.dashes = this.MAX_DASHES;
            }
        }

        if (my.sprite.player.body.blocked.down) {
            if (this.clings != this.MAX_CLINGS) {
                this.clings = this.MAX_CLINGS;
            }
        }

                                            //RESET DASH/CLING COUNTERS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //MOVEMENT
        if (this.aKey.isDown) {
                    //console.log(my.sprite.player.y);
            if (this.clinging == false) {
                    // have the player accelerate to the left
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                this.dash_angleX = -this.DASH_NUM
                this.xDashTimer = this.xDashTime;
            }

            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

                // walk particles
            this.walkParticles.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            this.walkParticles.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

                // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                this.walkParticles.start();
            }
                
        } else if (this.dKey.isDown) {
            if (this.clinging == false) {
                    // have the player accelerate to the right
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                this.dash_angleX = this.DASH_NUM;
                this.xDashTimer = this.xDashTime;
            }

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

                    // walk particles
            this.walkParticles.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            this.walkParticles.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

                    // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                this.walkParticles.start();
            }

        } else {
                // set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
                //idle animation
            my.sprite.player.anims.play('idle');
        }

        if (this.wKey.isDown) {
            this.dash_angleY = -this.DASH_NUM;
            this.yDashTimer = this.yDashTime;
        
        } else if (this.sKey.isDown) {
            this.dash_angleY = this.DASH_NUM;
            this.yDashTimer = this.yDashTime;

        }

                                                //MOVEMENT END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //DASH        

        if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
                //console.log(this.MAX_VELOCITYX);
                //console.log("Dash angleX Before: " + this.dash_angleX);
                //console.log("Dash angleY Before: " + this.dash_angleY);
                //console.log("Dashes Before: " + this.dashes);
            if (this.dashes > 0) {
                    //console.log("Dashes After: " + this.dashes);
                if (this.yDashTimer <= 0) {
                    this.dash_angleY = 0;
                }
                if (this.xDashTimer <= 0) {
                    this.dash_angleX = 0;
                }
                    
                        // diagonal dashes
                if ((this.dash_angleX != 0) && (this.dash_angleY != 0)) {
                    this.isDashing = true;
                    my.sprite.player.body.setMaxVelocityX(this.MAX_DASH_VELOCITY);
                    this.MAX_VELOCITYX = this.MAX_DASH_VELOCITY;
                    my.sprite.player.body.setVelocity(this.dash_angleX/2.5, this.dash_angleY/1.4);
                    this.dashes -= 1;
                    this.jumpSFX.play();
                        //console.log(this.MAX_VELOCITYX);
                    
                }

                    // vertical and horizontal dashes
                else if ((this.dash_angleX != 0) || (this.dash_angleY != 0)) {
                    this.isDashing = true;
                    my.sprite.player.body.setMaxVelocityX(this.MAX_DASH_VELOCITY);
                    this.MAX_VELOCITYX = this.MAX_DASH_VELOCITY;
                    my.sprite.player.body.setVelocity(this.dash_angleX, this.dash_angleY * 0.9);
                    this.dashes -= 1;
                    this.jumpSFX.play();
                    this.isDashing = true;
                        //console.log("this" + this.MAX_VELOCITYX);
                }

                        //console.log("Dash angleX After: " + this.dash_angleX);
                        //console.log("Dash angleY After: " + this.dash_angleY);
                
            } 
        }

        if (this.isDashing == true) {
            if (this.MAX_VELOCITYX > 300) {
                this.MAX_VELOCITYX -= delta * 5;
                if (this.MAX_VELOCITYX <= 300) {
                    this.MAX_VELOCITYX = 300;
                    this.isDashing = false;
                }
            }
            if (this.MAX_VELOCITYX < 300) {
                this.MAX_VELOCITYX = 300;
            }
            my.sprite.player.body.setMaxVelocityX(this.MAX_VELOCITYX);
        } 

                                                //DASH END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //JUMP

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
            
            
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                // set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

                                                //JUMP END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //WALL CLING

        // wall cling
        if ((this.enterKey.isDown) && (this.clings > 0)) {
            console.log("clings: " + this.clings)
            //if (my.sprite.player.body.blocked.left || my.sprite.player.body.blocked.right) {
            if (this.touchingSides() == true) {
                this.clinging = true;
                this.clings -= 1;
                console.log("we are here");
            } else {
                this.clinging = false;
            }
        }

        if (Phaser.Input.Keyboard.JustUp(this.enterKey)) {
            this.clinging = false;
        }

        if (this.clinging == true) {
            my.sprite.player.body.allowGravity = false;
            my.sprite.player.body.setAcceleration(0, 0);
            my.sprite.player.body.setVelocity(0, 0);
        }

        if (this.clinging == false) {
            my.sprite.player.body.allowGravity = true;
        }
        
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //GAME RESETS

        // reset scene on "r"
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        //console.log(my.sprite.player.y);
        if (my.sprite.player.y <= 40) {
            // end game
            //console.log(my.sprite.player.y);
            this.endTimer = 4 * 1000;
            this.text = this.add.text(250, 60, 'Congratulations! You win!');
            this.resetting = true;
            

        }
        if (this.resetting && this.endTimer <= 0) {
            this.scene.restart();
        }

        //console.log("is clinging at end: " + this.clinging);
        //console.log("gravity at end: " + my.sprite.player.body.allowGravity);

                                                //GAME RESETS ENDS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
    }
}