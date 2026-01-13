/**
 * SNES Color Validator
 * 
 * Per agent_rules_snes_color_palette.md:
 * - SNES uses 15-bit color (5 bits per channel)
 * - Each RGB channel must be a multiple of 8 (0-248)
 * - 255 is NOT a valid SNES color value
 */

/**
 * Check if a color value (0-255) is SNES-valid
 */
export function isValidSNESChannel(value: number): boolean {
    return value >= 0 && value <= 248 && value % 8 === 0;
}

/**
 * Snap a channel value to the nearest valid SNES value
 */
export function snapToSNESChannel(value: number): number {
    // Clamp to 0-255 first
    const clamped = Math.max(0, Math.min(255, value));
    // Round to nearest multiple of 8, cap at 248
    const snapped = Math.round(clamped / 8) * 8;
    return Math.min(248, snapped);
}

/**
 * Parse a hex color string (#RRGGBB or #RGB) to RGB values
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number } {
    const clean = hex.replace('#', '');

    if (clean.length === 3) {
        return {
            r: parseInt(clean[0] + clean[0], 16),
            g: parseInt(clean[1] + clean[1], 16),
            b: parseInt(clean[2] + clean[2], 16),
        };
    }

    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16),
    };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Validate and optionally fix a hex color to SNES palette
 * Returns the validated color and logs any corrections
 */
export function validateSNESColor(
    hex: string,
    autoFix: boolean = true
): { valid: boolean; color: string; corrected: boolean } {
    const { r, g, b } = parseHexColor(hex);

    const rValid = isValidSNESChannel(r);
    const gValid = isValidSNESChannel(g);
    const bValid = isValidSNESChannel(b);

    if (rValid && gValid && bValid) {
        return { valid: true, color: hex, corrected: false };
    }

    if (autoFix) {
        const fixedR = snapToSNESChannel(r);
        const fixedG = snapToSNESChannel(g);
        const fixedB = snapToSNESChannel(b);
        const fixedHex = rgbToHex(fixedR, fixedG, fixedB);

        console.warn(
            `[SNESColorValidator] Corrected invalid color ${hex} → ${fixedHex}`
        );

        return { valid: false, color: fixedHex, corrected: true };
    }

    return { valid: false, color: hex, corrected: false };
}

/**
 * Convert a color number (0xRRGGBB) to SNES-valid color number
 */
export function toSNESColorNumber(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const snesR = snapToSNESChannel(r);
    const snesG = snapToSNESChannel(g);
    const snesB = snapToSNESChannel(b);

    return (snesR << 16) | (snesG << 8) | snesB;
}

// Common SNES-valid colors
export const SNES_COLORS = {
    BLACK: 0x000000,
    WHITE: 0xf8f8f8,
    RED: 0xf80000,
    GREEN: 0x00f800,
    BLUE: 0x0000f8,
    YELLOW: 0xf8f800,
    CYAN: 0x00f8f8,
    MAGENTA: 0xf800f8,
    ORANGE: 0xf88800,
    PURPLE: 0x8800f8,
    BROWN: 0x885000,
    GRAY: 0x888888,
    LIGHT_GRAY: 0xc8c8c8,
    DARK_GRAY: 0x484848,
} as const;
