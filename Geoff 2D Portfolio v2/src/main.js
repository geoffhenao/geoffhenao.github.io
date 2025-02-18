import { dialogueData, scaleFactor } from "./constants";
import {k} from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("map", "./mapA.png");

k.loadSprite("geoffX", "./geoffX.png", {
    sliceX: 28, // every frame is 16x16
    sliceY: 1, // every frame is 16x16
    anims: {
        "walk-down": { from: 22, to: 27, loop: true, speed: 8}, // this dictates which IDs from the spritesheet to use for animating walking down
        "walk-side": { from: 4, to: 9, loop: true, speed: 8}, // anim walking to the side
        "walk-up": {from: 10, to: 15, loop: true, speed: 8}, // anim walking up
        "idle-down": 3, // using Tiled, you can ID the ID of each sprite on a spritesheet
        "idle-side": 0, // idle looking to the side
        "idle-up": 1, // idle looking up
    },
});

k.setBackground(k.Color.fromHex("#194169"));

k.scene("main", async () => {
    const mapData = await (await fetch ("./mapA.json")).json(); 
    const layers = mapData.layers;

    const map = k.add ([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

    const player = k.make([
        k.sprite("geoffX", { anim: "idle-down" }),
        k.area({
          shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
          speed: 250,
          direction: "down",
          isInDialogue: false,
        },
        "player",
      ]);



    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x + 10, boundary.y +23), // larger the number, lower Y goes
                    boundary.name,
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(
                            dialogueData[boundary.name],
                            () => (player.isInDialogue = false) 
                        );
                    });
                }
            }

            continue;
        }

        if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
              if (entity.name === "player") {
                player.pos = k.vec2(
                  (map.pos.x + entity.x) * scaleFactor,
                  (map.pos.y + entity.y) * scaleFactor + 50
                );
                k.add(player);
                continue;
              }
            }
          }
        }
setCamScale(k)

k.onResize(() => {
    setCamScale(k);
})

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;
    
        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);
    
        const mouseAngle = player.pos.angle(worldMousePos);
    
        const lowerBound = 50;
        const upperBound = 125;
    
        if (
          mouseAngle > lowerBound &&
          mouseAngle < upperBound &&
          player.curAnim() !== "walk-up"
        ) {
          player.play("walk-up");
          player.direction = "up";
          return;
        }
    
        if (
          mouseAngle < -lowerBound &&
          mouseAngle > -upperBound &&
          player.curAnim() !== "walk-down"
        ) {
          player.play("walk-down");
          player.direction = "down";
          return;
        }
    
        if (Math.abs(mouseAngle) > upperBound) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          return;
        }
    
        if (Math.abs(mouseAngle) < lowerBound) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          return;
        }
      });
    
      function stopAnims() {
        if (player.direction === "down") {
          player.play("idle-down");
          return;
        }
        if (player.direction === "up") {
          player.play("idle-up");
          return;
        }
    
        player.play("idle-side");
      }
    
      k.onMouseRelease(stopAnims);
    
      k.onKeyRelease(() => {
        stopAnims();
      });
      k.onKeyDown((key) => {
        const keyMap = [
          k.isKeyDown("right"),
          k.isKeyDown("left"),
          k.isKeyDown("up"),
          k.isKeyDown("down"),
        ];
    
        let nbOfKeyPressed = 0;
        for (const key of keyMap) {
          if (key) {
            nbOfKeyPressed++;
          }
        }
    
        if (nbOfKeyPressed > 1) return;
    
        if (player.isInDialogue) return;
        if (keyMap[0]) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          player.move(player.speed, 0);
          return;
        }
    
        if (keyMap[1]) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          player.move(-player.speed, 0);
          return;
        }
    
        if (keyMap[2]) {
          if (player.curAnim() !== "walk-up") player.play("walk-up");
          player.direction = "up";
          player.move(0, -player.speed);
          return;
        }
    
        if (keyMap[3]) {
          if (player.curAnim() !== "walk-down") player.play("walk-down");
          player.direction = "down";
          player.move(0, player.speed);
        }
      });
    });
    
    k.go("main"); 