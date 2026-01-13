/**
 * Input System
 * 
 * Abstracts keyboard and gamepad input.
 * Provides both current state and edge detection (just pressed/released).
 */

import { logger } from '../utils/Logger';

export class InputSystem {
    // Current frame state
    private keys: Set<string> = new Set();
    private keysJustPressed: Set<string> = new Set();
    private keysJustReleased: Set<string> = new Set();

    // Gamepad state
    private gamepadButtons: boolean[] = new Array(16).fill(false);
    private prevGamepadButtons: boolean[] = new Array(16).fill(false);
    private gamepadAxes: number[] = new Array(4).fill(0);

    // Previous frame state (for edge detection)
    private prevKeys: Set<string> = new Set();

    // Buffers and Timers
    private jumpBufferTimer: number = 0;
    private readonly JUMP_BUFFER_LIMIT: number = 100; // ms

    // Gamepad state
    private gamepadIndex: number = -1;

    // Mapping
    private mapping: Record<string, string[]> = {
        left: ['ArrowLeft', 'KeyA'],
        right: ['ArrowRight', 'KeyD'],
        up: ['ArrowUp', 'KeyW'],
        down: ['ArrowDown', 'KeyS'],
        jump: ['Space', 'KeyW', 'ArrowUp', 'KeyK'],
        attack: ['KeyX', 'KeyJ'],
        pause: ['Escape', 'KeyP'],
        confirm: ['Enter', 'Space']
    };

    constructor() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Gamepad connection
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepadIndex = e.gamepad.index;
            logger.debug(`Gamepad connected: ${e.gamepad.id}`);
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = -1;
            logger.debug('Gamepad disconnected');
        });
    }

    /**
     * Update input state - call once per frame
     */
    update(dt: number = 16.6): void {
        // Update timers
        if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;

        // Calculate edge states
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();

        // Just pressed = in keys but not in prevKeys
        for (const key of this.keys) {
            if (!this.prevKeys.has(key)) {
                this.keysJustPressed.add(key);
            }
        }

        // Just released = in prevKeys but not in keys
        for (const key of this.prevKeys) {
            if (!this.keys.has(key)) {
                this.keysJustReleased.add(key);
            }
        }

        // Save current state as previous
        this.prevKeys = new Set(this.keys);

        // Poll gamepad
        this.pollGamepad();
    }

    /**
     * Check if key is currently held
     */
    isDown(key: string): boolean {
        return this.keys.has(key);
    }

    /**
     * Check if key was just pressed this frame
     */
    isJustPressed(key: string): boolean {
        return this.keysJustPressed.has(key);
    }

    /**
     * Check if key was just released this frame
     */
    isJustReleased(key: string): boolean {
        return this.keysJustReleased.has(key);
    }

    // === Semantic input helpers ===

    get left(): boolean {
        return this.mapping.left.some(k => this.isDown(k)) || this.getGamepadAxis(0) < -0.3;
    }

    get right(): boolean {
        return this.mapping.right.some(k => this.isDown(k)) || this.getGamepadAxis(0) > 0.3;
    }

    get up(): boolean {
        return this.mapping.up.some(k => this.isDown(k)) || this.getGamepadAxis(1) < -0.3;
    }

    get down(): boolean {
        return this.mapping.down.some(k => this.isDown(k)) || this.getGamepadAxis(1) > 0.3;
    }

    get jump(): boolean {
        return this.mapping.jump.some(k => this.isDown(k)) || this.getGamepadButton(0);
    }

    get jumpJustPressed(): boolean {
        return this.mapping.jump.some(k => this.isJustPressed(k));
    }

    get pause(): boolean {
        return this.mapping.pause.some(k => this.isJustPressed(k));
    }

    get confirm(): boolean {
        return this.mapping.confirm.some(k => this.isJustPressed(k));
    }

    get attackJustPressed(): boolean {
        return this.mapping.attack.some(k => this.isJustPressed(k));
    }

    setMapping(action: string, keys: string[]): void {
        if (this.mapping[action]) {
            this.mapping[action] = keys;
            // Save to local storage for persistence
            localStorage.setItem('input_mapping', JSON.stringify(this.mapping));
        }
    }

    /**
     * Jump Buffer Logic
     */
    get jumpBuffered(): boolean {
        if (this.jumpJustPressed) {
            this.jumpBufferTimer = this.JUMP_BUFFER_LIMIT;
        }
        return this.jumpBufferTimer > 0;
    }

    consumeJumpBuffer(): void {
        this.jumpBufferTimer = 0;
    }

    // === Gamepad helpers ===

    private pollGamepad(): void {
        if (this.gamepadIndex < 0) return;

        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];

        if (gp) {
            // Save prev state for justPressed logic
            this.prevGamepadButtons = [...this.gamepadButtons];

            // Update buttons
            for (let i = 0; i < gp.buttons.length; i++) {
                if (i < 16) this.gamepadButtons[i] = gp.buttons[i].pressed;
            }

            // Update axes
            for (let i = 0; i < gp.axes.length; i++) {
                if (i < 4) this.gamepadAxes[i] = gp.axes[i];
            }
        }
    }

    private getGamepadAxis(axis: number): number {
        return this.gamepadAxes[axis] || 0;
    }

    private getGamepadButton(button: number): boolean {
        return this.gamepadButtons[button] || false;
    }

    private isGamepadJustPressed(button: number): boolean {
        return this.gamepadButtons[button] && !this.prevGamepadButtons[button];
    }
}
