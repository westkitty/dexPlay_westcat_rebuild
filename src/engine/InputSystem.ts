/**
 * Input System
 * 
 * Abstracts keyboard and gamepad input.
 * Provides both current state and edge detection (just pressed/released).
 */

export class InputSystem {
    // Current frame state
    private keys: Set<string> = new Set();
    private keysJustPressed: Set<string> = new Set();
    private keysJustReleased: Set<string> = new Set();

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
            console.log(`🎮 Gamepad connected: ${e.gamepad.id}`);
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = -1;
            console.log('🎮 Gamepad disconnected');
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
        // Gamepad API requires active polling
        if (this.gamepadIndex >= 0) {
            const gamepads = navigator.getGamepads();
            // Gamepad exists - buttons are read directly in getGamepadButton
        }
    }

    private getGamepadAxis(axis: number): number {
        if (this.gamepadIndex < 0) return 0;
        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        if (gp && gp.axes[axis] !== undefined) {
            return gp.axes[axis];
        }
        return 0;
    }

    private getGamepadButton(button: number): boolean {
        if (this.gamepadIndex < 0) return false;
        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        if (gp && gp.buttons[button]) {
            return gp.buttons[button].pressed;
        }
        return false;
    }
}
