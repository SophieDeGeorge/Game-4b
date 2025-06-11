class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {

        this.load.setPath("./assets/");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //LOAD PNGs

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("pixel_tilemap_tiles", "pixel-tilemap_packed.png");             // Packed tilemap
        this.load.image("background_tiles", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj");    // Tilemap in JSON  might need to be tmj?
        this.load.multiatlas("kenny-particles", "kenny-particles.json");  
            //default spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18

        });
            //pixel spritesheet
        this.load.spritesheet("pixel_tilemap_sheet", "pixel-tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16

        });
            //background spritesheet
        this.load.spritesheet("background_tilemap_sheet", "tilemap-backgrounds_packed.png", {
            frameWidth: 16,
            frameHeight: 16

        });

                                                //LOAD PNGs END   
////////////////////////////////////////////////////////////////////////////////////////////////////////////////     



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //LOAD SOUND EFFECTS
        // loading sound effects
            // jump
        this.load.audio("jumpSFX", "jump.wav");
            // collect
        this.load.audio("collectSFX", "collect.wav");

                                                //LOAD SOUND EFFECTS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    create() {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //ANIMATIONS

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

                                                //ANIMATIONS END
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}