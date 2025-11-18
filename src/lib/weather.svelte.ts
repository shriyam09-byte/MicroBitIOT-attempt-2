import { simState } from "./globals.svelte";
import type { p5 } from "p5-svelte";

class cloud {
    posx: number;
    posy: number;
    posz: number;

    weatherState: string;
    targetState: string;

    size: number;
    puffCount: number;
    puffSpread: number;
    puffOffsets: number[][];

    speedX: number;
    speedY: number;
    speedZ: number;

    bolts: { segments: number[][]; life: number }[];
    raindrops: { x: number; y: number; z: number; speed: number }[];

    cloudOpacity: number;
    rainOpacity: number;
    boltOpacity: number;

    boundaryFade: number;

    currentColor: { r: number; g: number; b: number; a: number };
    targetColor: { r: number; g: number; b: number; a: number };

    constructor(p5: p5, posx: number, posy: number, posz: number, weatherState = "sunny") {
        this.posx = posx;
        this.posy = posy;
        this.posz = posz;

        // Weather state
        this.weatherState = weatherState; // "clear" / "sunny" / "rainy" / "storm"
        this.targetState = weatherState;

        // Internal constants
        this.size = 80;
        this.puffCount = 8;
        this.puffSpread = 1.5;

        // Movement (scaled by simSpeed)
        this.speedX = p5.random(-3, 3) * simState.simSpeed;
        this.speedY = p5.random(-0.5, 0.5) * simState.simSpeed;
        this.speedZ = p5.random(-3, 3) * simState.simSpeed;

        // Lightning + rain storage
        this.bolts = [];
        this.raindrops = [];

        // Pre-generate puff offsets
        this.puffOffsets = [];
        for (let i = 0; i < this.puffCount; i++) {
            this.puffOffsets.push([
                (Math.random() - 0.5) * this.puffSpread,
                (Math.random() - 0.5) * this.puffSpread * 0.6,
                (Math.random() - 0.5) * this.puffSpread,
                0.5 + Math.random() * 0.8,
            ]);
        }

        // Fade factors
        this.cloudOpacity = weatherState === "clear" ? 0 : 1;
        this.rainOpacity = 0;
        this.boltOpacity = 0;

        // Boundary fade
        this.boundaryFade = 1;

        // Colour handling
        this.currentColor = { r: 255, g: 255, b: 255, a: 100 }; // starting color
        this.targetColor = this.getTargetColor(weatherState);
    }

    getTargetColor(state: string) {
        if (state === "rainy") return { r: 80, g: 80, b: 80, a: 110 };
        if (state === "storm") return { r: 50, g: 50, b: 50, a: 115 };
        if (state === "flood") return { r: 70, g: 70, b: 90, a: 115 };
        return { r: 255, g: 255, b: 255, a: 100 }; // sunny/clear base
    }

    update(p5: p5, newState: string) {
        this.targetState = newState;
        this.targetColor = this.getTargetColor(newState);

        // fade speeds scaled by simSpeed
        let fadeStep = 0.02 * simState.simSpeed;
        let boltStep = 0.03 * simState.simSpeed;

        // Gradually adjust cloud/rain/bolt opacity
        if (this.targetState === "clear") {
            this.cloudOpacity = p5.max(0, this.cloudOpacity - fadeStep);
            this.rainOpacity = p5.max(0, this.rainOpacity - fadeStep);
            this.boltOpacity = p5.max(0, this.boltOpacity - boltStep);
        } else {
            this.cloudOpacity = p5.min(1, this.cloudOpacity + fadeStep);
            this.rainOpacity = p5.min(1, this.rainOpacity + fadeStep);
            if (this.targetState === "storm") {
                this.boltOpacity = p5.min(1, this.boltOpacity + boltStep);
            } else {
                this.boltOpacity = p5.max(0, this.boltOpacity - boltStep);
            }
        }

        // Smoothly lerp current color towards target (scaled by simSpeed)
        let lerpFactor = 0.05 * simState.simSpeed;
        this.currentColor.r = p5.lerp(this.currentColor.r, this.targetColor.r, lerpFactor);
        this.currentColor.g = p5.lerp(this.currentColor.g, this.targetColor.g, lerpFactor);
        this.currentColor.b = p5.lerp(this.currentColor.b, this.targetColor.b, lerpFactor);
        this.currentColor.a = p5.lerp(this.currentColor.a, this.targetColor.a, lerpFactor);

        // Regenerate clouds if transitioning from clear
        if (this.weatherState === "clear" && this.cloudOpacity > 0 && this.puffOffsets.length === 0) {
            for (let i = 0; i < this.puffCount; i++) {
                this.puffOffsets.push([
                    (Math.random() - 0.5) * this.puffSpread,
                    (Math.random() - 0.5) * this.puffSpread * 0.6,
                    (Math.random() - 0.5) * this.puffSpread,
                    0.5 + Math.random() * 0.8,
                ]);
            }
        }

        // Once fade completes, set actual state
        if (this.cloudOpacity === 0 && this.targetState === "clear") {
            this.weatherState = "clear";
        } else if (this.cloudOpacity === 1) {
            this.weatherState = this.targetState;
        }
    }

    move(p5: p5) {
        if (this.weatherState === "clear" && this.cloudOpacity <= 0) return; // No clouds

        // Random drift
        let randFactor = (this.weatherState === "storm" ? 0.05 : 0.01) * simState.simSpeed;
        this.speedX += p5.random(-randFactor, randFactor);
        this.speedY += p5.random(-randFactor * 0.5, randFactor * 0.5);
        this.speedZ += p5.random(-randFactor, randFactor);

        // Clamp speeds
        if (this.weatherState === "storm") {
            this.speedX = p5.constrain(this.speedX, -1.2 * simState.simSpeed, 1.2 * simState.simSpeed);
            this.speedY = p5.constrain(this.speedY, -0.6 * simState.simSpeed, 0.6 * simState.simSpeed);
            this.speedZ = p5.constrain(this.speedZ, -1.2 * simState.simSpeed, 1.2 * simState.simSpeed);
        } else {
            this.speedX = p5.constrain(this.speedX, -0.5 * simState.simSpeed, 0.5 * simState.simSpeed);
            this.speedY = p5.constrain(this.speedY, -0.2 * simState.simSpeed, 0.2 * simState.simSpeed);
            this.speedZ = p5.constrain(this.speedZ, -0.5 * simState.simSpeed, 0.5 * simState.simSpeed);
        }

        // Apply movement
        this.posx += this.speedX;
        this.posy += this.speedY;
        this.posz += this.speedZ;

        // Bounds
        let boundX = p5.width / 2 - simState.boxl;
        let boundY = p5.width / 10 - simState.boxl;
        let boundZ = p5.width / 2 - simState.boxl;

        // Wraparound + fade
        let fadeMargin = 100;
        this.boundaryFade = 1;

        if (this.posx > boundX) this.posx = -boundX;
        if (this.posx < -boundX) this.posx = boundX;
        if (this.posz > boundZ) this.posz = -boundZ;
        if (this.posz < -boundZ) this.posz = boundZ;

        let fadeX = p5.map(p5.abs(this.posx), boundX - fadeMargin, boundX, 1, 0, true);
        let fadeZ = p5.map(p5.abs(this.posz), boundZ - fadeMargin, boundZ, 1, 0, true);
        this.boundaryFade = p5.min(fadeX, fadeZ);

        // Altitude control
        let minAltitude = -p5.height / 4;
        if (this.posy > minAltitude) this.posy = minAltitude;
        if (this.posy < boundY) this.posy = minAltitude;

        // Storm lightning chance
        if (this.weatherState === "storm" && p5.random() < 0.002 * simState.simSpeed) {
            this.spawnBolt(p5);
        }

        // Update bolts
        for (let bolt of this.bolts) {
            bolt.life -= simState.simSpeed;
        }
        this.bolts = this.bolts.filter((b) => b.life > 0);

        // Rain generation
        if (this.weatherState === "rainy" || this.weatherState === "storm" || this.weatherState === "flood") {
            let dropCount = (this.weatherState === "storm" ? 8 : 4) * simState.simSpeed;
            if (this.weatherState != "flood") dropCount = 1;
            for (let i = 0; i < dropCount; i++) {
                this.spawnRaindrop(p5);
            }
        }

        // Update raindrops
        for (let drop of this.raindrops) {
            drop.y += drop.speed * simState.simSpeed * 10;
        }
        this.raindrops = this.raindrops.filter((d) => d.y < p5.height / 5);

        this.raindrops = this.raindrops.slice(0, 10);
    }

    spawnBolt(p5: p5) {
        let startX = this.posx;
        let startY = this.posy + this.size * 0.6;
        let startZ = this.posz;

        let segments = [];
        let x = startX;
        let y = startY;
        let z = startZ;

        while (y < p5.height / 5) {
            x += p5.random(-15, 15);
            y += p5.random(20, 50);
            z += p5.random(-15, 15);
            if (y > p5.height / 5) y = p5.height / 5;
            segments.push([x, y, z]);
        }

        this.bolts.push({
            segments: segments,
            life: Number(p5.random(5, 15) * simState.simSpeed),
        });

        let strikeX = segments[segments.length - 1][0];
        let strikeZ = segments[segments.length - 1][2];

        let d = Infinity;
        let id = 0;
        for (let i = 0; i < simState.garden.length; i++) {
            let distXZ = p5.sqrt((strikeX - simState.garden[i].posx) ** 2 + (strikeZ - simState.garden[i].posz) ** 2);
            if (distXZ < d) {
                d = distXZ;
                id = i;
            }
        }

        // console.log($state.snapshot(state.garden), id);
        simState.garden[id].struckByLightning(p5, d);
    }

    spawnRaindrop(p5: p5) {
        let x = this.posx + p5.random(-this.size, this.size);
        let y = this.posy + this.size / 2;
        let z = this.posz + p5.random(-this.size, this.size);
        let speed = p5.random(8, 15);
        this.raindrops.push({ x, y, z, speed });
    }

    display(p5: p5) {
        if (this.cloudOpacity <= 0) return; // invisible

        p5.noStroke();

        // Cloud colour (smoothly interpolated + opacity + boundary fade)
        let col = p5.color(
            this.currentColor.r,
            this.currentColor.g,
            this.currentColor.b,
            this.currentColor.a * this.cloudOpacity * this.boundaryFade,
        );

        p5.fill(col);

        // Draw puff spheres
        for (let i = 0; i < this.puffOffsets.length; i++) {
            const [ox, oy, oz, scale] = this.puffOffsets[i];
            p5.push();
            p5.translate(this.posx + ox * this.size, this.posy + oy * this.size, this.posz + oz * this.size);
            p5.sphere(this.size * 0.5 * scale);
            p5.pop();
        }

        // Draw lightning bolts
        if (this.weatherState === "storm") {
            p5.strokeWeight(3);
            for (let bolt of this.bolts) {
                p5.stroke(255, 255, 180, p5.map(bolt.life, 0, 15, 0, 255) * this.boltOpacity * this.boundaryFade);
                p5.noFill();
                p5.beginShape();
                p5.vertex(this.posx, this.posy + this.size * 0.6, this.posz);
                for (let seg of bolt.segments) {
                    p5.vertex(seg[0], seg[1], seg[2]);
                }
                p5.endShape();
            }
            p5.noStroke();
        }

        // Draw rain particles
        if (this.weatherState === "rainy" || this.weatherState === "storm" || this.weatherState === "flood") {
            p5.stroke(100, 150, 255, 200 * this.rainOpacity * this.boundaryFade);
            p5.strokeWeight(2);
            for (let drop of this.raindrops) {
                p5.line(drop.x, drop.y, drop.z, drop.x, drop.y + 10 * simState.simSpeed, drop.z);
            }
            p5.noStroke();
        }
    }
}

export { cloud };
