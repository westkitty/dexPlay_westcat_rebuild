/**
 * Totem Registry
 * 
 * Collectible bestiary for the "City of Totems".
 */

import { logger } from '../utils/Logger';

export interface TotemInfo {
    id: string;
    name: string;
    description: string;
    fact: string;
    found: boolean;
}

export class TotemRegistry {
    private static totems: Map<string, TotemInfo> = new Map([
        ['owl', {
            id: 'owl',
            name: 'The Cedar Owl',
            description: 'A guardian of the valley forests.',
            fact: 'Duncan has over 40 totems scattered throughout the city.',
            found: false
        }],
        ['salmon', {
            id: 'salmon',
            name: 'Spirit of the Cowichan River',
            description: 'Symbolizes life and renewal.',
            fact: 'The Cowichan River is a heritage river famous for its trout.',
            found: false
        }],
        ['hockey', {
            id: 'hockey',
            name: 'World\'s Largest Hockey Stick',
            description: 'A monument to Canada\'s favorite sport.',
            fact: 'It was originally built for Expo 86 in Vancouver.',
            found: true
        }]
    ]);

    static findTotem(id: string): void {
        const totem = this.totems.get(id);
        if (totem) {
            totem.found = true;
            logger.info(`Totem Found: ${totem.name}`);
        }
    }

    static getCollectedCount(): number {
        return Array.from(this.totems.values()).filter(t => t.found).length;
    }

    static getAllTotems(): TotemInfo[] {
        return Array.from(this.totems.values());
    }

    static saveTo(saveData: any): void {
        saveData.totems = Array.from(this.totems.entries()).map(([k, v]) => [k, v.found]);
    }

    static loadFrom(saveData: any): void {
        if (saveData.totems) {
            saveData.totems.forEach(([k, found]: [string, boolean]) => {
                const totem = this.totems.get(k);
                if (totem) totem.found = found;
            });
        }
    }
}
