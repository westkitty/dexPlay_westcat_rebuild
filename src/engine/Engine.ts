/**
 * Core Game Engine
 * 
 * Fixed-timestep update loop with variable render interpolation.
 * This is GAME DEV code, not web code.
 */

import { Camera } from './Camera';
import { InputSystem } from './InputSystem';
import { ParticleSystem } from './ParticleSystem';
import { Renderer } from './Renderer';
import { WeatherManager } from './WeatherManager';
import { logger } from '../utils/Logger';

// Target 60 FPS logic tick
const FIXED_TIMESTEP = 1000 / 60;
const MAX_FRAME_SKIP = 5;

export interface Scene {
    enter(): void;
    exit(): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D, alpha: number): void;
}

/**
 * SPC700-style Sound Device
 * Simulates 8-channel hardware limit with volume envelopes.
 */
class SoundDevice {
    private channels: (HTMLAudioElement | null)[] = new Array(8).fill(null);
    private nextChannel: number = 0;

    playSound(url: string, volume: number = 0.5, pitch: number = 1.0): void {
        // Kill existing channel to obey 8-voice limit
        if (this.channels[this.nextChannel]) {
            this.channels[this.nextChannel]!.pause();
        }

        const audio = new Audio(url);
        audio.volume = volume;
        audio.playbackRate = pitch;
        audio.play().catch(() => { });

        this.channels[this.nextChannel] = audio;
        this.nextChannel = (this.nextChannel + 1) % 8;
    }

    stopAll(): void {
        this.channels.forEach(ch => {
            if (ch) ch.pause();
        });
    }
}

export class Engine {
    // Core systems
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public camera: Camera;
    public input: InputSystem;
    public particles: ParticleSystem;
    public renderer: Renderer;
    public weather: WeatherManager;
    public sound: SoundDevice;

    // Audio stems
    private bgmMain: HTMLAudioElement | null = null;
    private bgmDrums: HTMLAudioElement | null = null;
    private drumIntensity: number = 0;

    // Game loop state
    private lastTime: number = 0;
    private accumulator: number = 0;
    private running: boolean = false;

    // Scene management
    private currentScene: Scene | null = null;
    private scenes: Map<string, Scene> = new Map();

    // Transition State
    private transitionActive: boolean = false;
    private transitionTimer: number = 0;
    private readonly TRANSITION_DURATION: number = 500; // ms
    private nextSceneKey: string | null = null;
    private mosaicFactor: number = 1;

    // Game dimensions (internal resolution - High Res SNES Style)
    public readonly WIDTH = 800;
    public readonly HEIGHT = 600;

    constructor(canvasId: string) {
        // Get canvas
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas #${canvasId} not found`);
        }

        // Set internal resolution
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        // Get context with pixel-perfect settings
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        // Initialize core systems
        this.camera = new Camera(this.WIDTH, this.HEIGHT);
        this.input = new InputSystem();
        this.particles = new ParticleSystem(500); // Pool of 500 particles
        this.renderer = new Renderer(this.ctx, this.camera);
        this.weather = new WeatherManager(this.WIDTH, this.HEIGHT);
        this.sound = new SoundDevice();

        logger.info('Engine initialized');
    }

    /**
     * Register a scene
     */
    addScene(name: string, scene: Scene): void {
        this.scenes.set(name, scene);
    }

    /**
     * Switch to a scene with a classic SNES mosaic transition
     */
    switchScene(name: string, withTransition: boolean = true): void {
        if (withTransition && !this.transitionActive) {
            this.transitionActive = true;
            this.transitionTimer = 0;
            this.nextSceneKey = name;
            console.log(`⏱️ Transitioning to scene: ${name}`);
        } else if (!withTransition) {
            this.performSwitch(name);
        }
    }

    private performSwitch(name: string): void {
        if (this.currentScene) {
            this.currentScene.exit();
        }

        const scene = this.scenes.get(name);
        if (!scene) {
            throw new Error(`Scene "${name}" not found`);
        }

        this.currentScene = scene;
        this.currentScene.enter();
        console.log(`📍 Switched to scene: ${name}`);

        // Reset weather on scene change if needed
    }

    /**
     * Set up dynamic music hardware (SPC700 simulation feel)
     */
    initAudio(mainUrl: string, drumUrl: string): void {
        this.bgmMain = new Audio(mainUrl);
        this.bgmMain.loop = true;

        this.bgmDrums = new Audio(drumUrl);
        this.bgmDrums.loop = true;
        this.bgmDrums.volume = 0;

        this.bgmMain.play();
        this.bgmDrums.play();
    }

    setDrumIntensity(intensity: number): void {
        this.drumIntensity = intensity;
        if (this.bgmDrums) {
            this.bgmDrums.volume = intensity;
        }
    }

    /**
     * Start the game loop
     */
    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        console.log('🚀 Game loop started');
    }

    /**
     * Stop the game loop
     */
    stop(): void {
        this.running = false;
    }

    /**
     * The main game loop - fixed timestep update, variable render
     */
    private async gameLoop(currentTime: number): Promise<void> {
        if (!this.running) return;

        const frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Accumulate time for fixed updates
        this.accumulator += frameTime;

        // Prevent spiral of death
        let updates = 0;
        while (this.accumulator >= FIXED_TIMESTEP && updates < MAX_FRAME_SKIP) {
            await this.update(FIXED_TIMESTEP);
            this.accumulator -= FIXED_TIMESTEP;
            updates++;
        }

        // Calculate interpolation alpha for smooth rendering
        const alpha = this.accumulator / FIXED_TIMESTEP;

        // Render with interpolation
        this.draw(alpha);

        // Continue loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Fixed timestep update (logic)
     */
    private async update(dt: number): Promise<void> {
        // Update input
        this.input.update(dt);

        // Update transition
        if (this.transitionActive) {
            this.transitionTimer += dt;
            const half = this.TRANSITION_DURATION / 2;

            // At peak of transition, switch scenes
            if (this.transitionTimer >= half && this.nextSceneKey) {
                this.performSwitch(this.nextSceneKey);
                this.nextSceneKey = null;
            }

            if (this.transitionTimer >= this.TRANSITION_DURATION) {
                this.transitionActive = false;
                this.mosaicFactor = 1;
            } else {
                // Peak mosaic factor (pixelation) in the middle
                const progress = 1 - Math.abs(this.transitionTimer - half) / half;
                this.mosaicFactor = 1 + progress * 16;
            }
        }

        // Update camera
        this.camera.update(dt);

        // Update particles
        this.particles.update(dt);

        // Update weather
        this.weather.update(dt, this.WIDTH, this.HEIGHT);

        // Update current scene
        if (this.currentScene) {
            await this.currentScene.update(dt);
        }
    }

    /**
     * Variable timestep render (graphics)
     */
    private draw(alpha: number): void {
        // Clear with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // Save context state
        this.ctx.save();

        // Apply camera transform (with shake)
        this.camera.applyTransform(this.ctx);

        // Draw current scene (world space)
        if (this.currentScene) {
            if (this.transitionActive && this.mosaicFactor > 1) {
                this.renderer.drawMosaic(this.ctx, (ctx) => {
                    this.currentScene!.draw(ctx, alpha);
                }, Math.floor(this.mosaicFactor));
            } else {
                this.currentScene.draw(this.ctx, alpha);
            }
        }

        // Draw particles (world space)
        this.particles.draw(this.ctx);

        // Draw weather (screen space or world space? for rain usually screen space)
        this.weather.draw(this.renderer, this.ctx, this.WIDTH, this.HEIGHT);

        // Restore context
        this.ctx.restore();

        // Apply post-processing (screen space)
        this.renderer.applyPostProcessing(this.ctx);

        // Draw UI
        this.drawUI();
    }

    /**
     * Draw screen-space UI (ignores camera)
     */
    private drawUI(): void {
        // FPS counter (debug)
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Particles: ${this.particles.activeCount}`, 10, this.HEIGHT - 10);
    }
}
