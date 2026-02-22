import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'app-settings.json');

export interface AppSettings {
    emailEnabled: boolean;
}

const defaultSettings: AppSettings = {
    emailEnabled: false,
};

export function getSettings(): AppSettings {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
            return { ...defaultSettings, ...JSON.parse(raw) };
        }
    } catch (error) {
        console.error('[Settings] Failed to read settings:', error);
    }
    return { ...defaultSettings };
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = getSettings();
    const merged = { ...current, ...updates };
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (error) {
        console.error('[Settings] Failed to write settings:', error);
        throw error;
    }
    return merged;
}

export function isEmailEnabled(): boolean {
    return getSettings().emailEnabled;
}
