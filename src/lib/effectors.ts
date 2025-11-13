import { simState } from "./globals.svelte";
import type { p5 } from "p5-svelte";

class effectors {
    light: boolean;
    temp: boolean;
    humidity: boolean;
    soilm: boolean;

    // Properties for the 3D lamp's position and dimensions
    lampPos: any;
    lampWidth: number;
    lampHeight: number;
    lampDepth: number;

    constructor(p5: p5) {
        this.light = false;
        this.temp = false;
        this.humidity = false;
        this.soilm = false;

        // --- Initialize 3D Lamp Properties ---
        this.lampWidth = 300;
        this.lampHeight = 50;
        this.lampDepth = 300;

        // Position the lamp above the farmland
        this.lampPos = p5.createVector(0, -p5.height / 3 - 100, 0);
    }

    display(p5: p5) {
        // --- Lamp ---
        if (this.light) {
            p5.push();
            p5.translate(this.lampPos.x, this.lampPos.y, this.lampPos.z);

            // Socket
            p5.push();
            p5.fill(120, 120, 120);
            p5.cylinder(18, 32);
            p5.pop();

            // Bulb (glass)
            p5.push();
            p5.translate(0, 32, 0);
            p5.fill(255, 255, 200, 180);
            p5.sphere(32);
            p5.pop();

            // Filament glow
            p5.push();
            p5.translate(0, 32, 0);
            p5.emissiveMaterial(255, 255, 120);
            p5.sphere(12);
            p5.pop();

            // Stylized light rays
            p5.push();
            p5.translate(0, 64, 0);
            p5.stroke(255, 255, 180, 90);
            p5.strokeWeight(2.5);
            const rayCount = 32;
            const rayLength = 180;
            for (let i = 0; i < rayCount; i++) {
                const angle = (2 * Math.PI * i) / rayCount;
                const x = Math.cos(angle) * 120;
                const z = Math.sin(angle) * 120;
                p5.line(0, 0, 0, x, rayLength, z);
            }
            p5.pop();
            p5.pop();
        }

        // --- Heater ---
        if (this.temp) {
            p5.push();
            const heaterX = p5.width / 2.2;
            const heaterY = p5.height / 5 - 30;
            p5.translate(heaterX, heaterY, 0);

            // Heater body
            p5.noStroke();
            p5.ambientMaterial(180, 60, 40);
            p5.box(40, 60, 40);

            // Heater grill
            p5.push();
            p5.translate(0, 0, 21);
            p5.ambientMaterial(220, 120, 80);
            p5.box(36, 48, 2);
            p5.stroke(120, 60, 40);
            p5.strokeWeight(2);
            for (let i = -14; i <= 14; i += 7) {
                p5.line(i, -20, 2, i, 20, 2);
            }
            p5.pop();

            // Glowing heat effect
            p5.push();
            p5.translate(0, 0, 24);
            p5.noStroke();
            for (let i = 0; i < 3; i++) {
                p5.emissiveMaterial(255, 120 + i * 40, 40);
                p5.sphere(18 + i * 6);
            }
            p5.pop();

            // Heat waves
            p5.push();
            p5.translate(0, -40, 0);
            p5.stroke(255, 180, 80, 120);
            p5.strokeWeight(3);
            for (let w = -12; w <= 12; w += 12) {
                for (let t = 0; t < 20; t++) {
                    let x1 = w + Math.sin(t / 2 + p5.frameCount / 10) * 3;
                    let y1 = -t * 2;
                    let x2 = w + Math.sin((t + 1) / 2 + p5.frameCount / 10) * 3;
                    let y2 = -(t + 1) * 2;
                    p5.line(x1, y1, 0, x2, y2, 0);
                }
            }
            p5.pop();
            p5.pop();
        }

        // --- Dehumidifier ---
        if (this.humidity) {
            p5.push();
            const dehumX = -p5.width / 2.2;
            const dehumY = p5.height / 5 - 30;
            p5.translate(dehumX, dehumY, 0);

            // Main body
            p5.noStroke();
            p5.ambientMaterial(180, 200, 220);
            p5.box(44, 70, 44);

            // Air intake grill
            p5.push();
            p5.translate(0, -20, 22);
            p5.ambientMaterial(140, 180, 200);
            p5.box(38, 18, 4);
            p5.stroke(100, 140, 180);
            p5.strokeWeight(2);
            for (let i = -14; i <= 14; i += 7) {
                p5.line(i, -8, 2, i, 8, 2);
            }
            p5.pop();

            // Water tank
            p5.push();
            p5.translate(0, 28, 0);
            p5.fill(120, 180, 255, 80);
            p5.box(36, 16, 36);
            p5.pop();

            // Air flow effect
            p5.push();
            p5.translate(0, -40, 0);
            p5.stroke(120, 180, 255, 120);
            p5.strokeWeight(3);
            for (let w = -12; w <= 12; w += 12) {
                for (let t = 0; t < 16; t++) {
                    let x1 = w + Math.sin(t / 2 + p5.frameCount / 12) * 3;
                    let y1 = -t * 2;
                    let x2 = w + Math.sin((t + 1) / 2 + p5.frameCount / 12) * 3;
                    let y2 = -(t + 1) * 2;
                    p5.line(x1, y1, 0, x2, y2, 0);
                }
            }
            p5.pop();

            p5.pop();
        }

        // --- Watering Can (realistic, professional) ---
        // --- Watering Can (fixed orientation & realistic) ---
        if (this.soilm) {
            p5.push();

            // Position on farmland
            const canX = 0;
            const canY = 50; // sitting above soil
            const canZ = 0;
            p5.translate(canX, canY, canZ);

            // Rotate so it stands upright (not sideways)
            p5.rotateX(p5.radians(0));
            p5.rotateZ(p5.radians(0));

            // Materials
            p5.ambientMaterial(180, 180, 150);
            p5.specularMaterial(220);
            p5.shininess(20);

            // --- Body ---
            p5.push();
            p5.translate(0, -10, 0);
            p5.cylinder(40, 80, 24, 1); // vertical cylinder
            p5.pop();

            // --- Handle ---
            p5.push();
            p5.noFill();
            p5.stroke(170, 170, 140);
            p5.strokeWeight(10);
            // Arc handle on top of body
            p5.rotateX(0);
            p5.translate(0, -50, 0);
            p5.arc(0, 0, 90, 90, p5.PI, 0);
            p5.noStroke();
            p5.pop();

            // --- Spout ---
            p5.push();
            p5.translate(50, -20, 0); // attach to body side
            p5.rotateZ(p5.radians(30)); // tilt spout downward
            p5.cylinder(8, 60, 12, 1);

            p5.pop();

            // stream parameters
            const streamCount = 12; // number of visible streams
            const streamLength = 36; // length in segments
            const jitter = 0.9; // small horizontal jitter
            p5.strokeWeight(2);
            p5.stroke(80, 170, 255, 200);
            p5.push();
            p5.translate(65, -50, 0);
            for (let s = 0; s < streamCount; s++) {
                // map stream offset across nozzle width
                const sx = p5.map(s, 0, streamCount - 1, -14, 14);
                // slight time-varying phase so streams move gently
                const phase = (p5.frameCount / 8 + s * 7) * 0.04;
                for (let seg = 0; seg < streamLength; seg++) {
                    const t0 = seg;
                    const t1 = seg + 1;
                    // x jitter uses sin + small random-like variation based on sin/cos
                    const x1 = sx + Math.sin(phase + seg * 0.18) * jitter;
                    const y1 = seg * 4 + Math.sin(phase * 0.6 + seg * 0.12) * 0.6;
                    const z1 = Math.cos(phase + seg * 0.07) * 0.6;

                    const x2 = sx + Math.sin(phase + (seg + 1) * 0.18) * jitter;
                    const y2 = (seg + 1) * 4 + Math.sin(phase * 0.6 + (seg + 1) * 0.12) * 0.6;
                    const z2 = Math.cos(phase + (seg + 1) * 0.07) * 0.6;

                    // fade alpha as it falls
                    const alpha = p5.map(seg, 0, streamLength - 1, 220, 30);
                    p5.stroke(70, 160, 240, alpha);
                    p5.line(x1, y1, z1, x2, y2, z2);
                }

                // Droplets at the end of the stream
                const dropPhase = (p5.frameCount / 6 + s * 13) * 0.06;
                const dropY = streamLength * 4 + Math.sin(dropPhase) * 3;
                const dropX = sx + Math.sin(dropPhase * 1.5) * 1.6;
                const dropZ = Math.cos(dropPhase * 1.2) * 1.2;
                p5.noStroke();
                p5.fill(90, 180, 255, 200);
                const dropSize = 3 + Math.abs(Math.sin(p5.frameCount * 0.06 + s)) * 2;
                p5.push();
                p5.translate(dropX, dropY, dropZ);
                p5.sphere(dropSize);
                p5.pop();
            }
            p5.pop();
            p5.pop();
        }
    }

    update(p5: p5) {
        this.light = !!simState.effectors[0];
        this.temp = !!simState.effectors[1];
        this.humidity = !!simState.effectors[3];
        this.soilm = !!simState.effectors[2];
    }
}

export { effectors };
