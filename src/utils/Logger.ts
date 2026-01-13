/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with level control.
 * Debug logs are automatically disabled in production.
 */

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

class Logger {
    private static instance: Logger;
    private level: LogLevelType = LogLevel.INFO;
    private isDevelopment: boolean = true;

    private constructor() {
        // Always enable debug in renderer (we'll control via level)
        this.isDevelopment = true;
        this.level = LogLevel.DEBUG;
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setLevel(level: LogLevelType): void {
        this.level = level;
    }

    debug(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    error(message: string, error?: Error | any): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, error);
        }
    }
}

// Export singleton instance
export const logger = Logger.getInstance();
