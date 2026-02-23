/**
 * Utility functions for theme and color conversions
 */

/**
 * Converts a Hex color to HSL string format used by Tailwind (e.g., "200 50% 50%")
 * @param {string} hex - The hex color string (e.g., "#ffffff" or "#fff")
 * @returns {string|null} - The HSL string or null if invalid
 */
export const hexToHSL = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    let r = 0, g = 0, b = 0;

    // Normalize hex
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.slice(0, 2), 16);
        g = parseInt(cleanHex.slice(2, 4), 16);
        b = parseInt(cleanHex.slice(4, 6), 16);
    } else {
        // If it's already an HSL string with commas, convert to space-separated
        if (hex.includes(',')) {
            return hex.replace(/,/g, ' ').replace(/hsl\(|\)/g, '').trim();
        }
        return null;
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    // Return space-separated HSL for Tailwind/Shadcn compatibility
    return `${h} ${s}% ${l}%`;
};

/**
 * Converts an HSL string back to Hex
 * @param {string} hslStr - The HSL string (e.g., "200 50% 50%")
 * @returns {string} - The hex color string
 */
export const hslToHex = (hslStr) => {
    if (!hslStr) return '#000000';
    if (typeof hslStr === 'string' && hslStr.startsWith('#')) return hslStr;

    try {
        const parts = hslStr.replace(/%/g, '').split(' ');
        if (parts.length < 3) return '#000000';

        const h = parseFloat(parts[0]);
        const s = parseFloat(parts[1]) / 100;
        const l = parseFloat(parts[2]) / 100;

        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    } catch (e) {
        console.error('HSL conversion error:', e);
        return '#000000';
    }
};

/**
 * Safely applies a theme color to CSS variables
 * @param {string} key - Theme key (e.g., "theme_primary")
 * @param {string} value - Color value (Hex or HSL)
 */
export const applyThemeColor = (key, value) => {
    const cssVarMap = {
        'theme_primary': '--primary',
        'theme_secondary': '--secondary',
        'theme_background': '--background',
        'theme_foreground': '--foreground',
        'theme_muted': '--muted',
        'theme_accent': '--accent'
    };

    const cssVar = cssVarMap[key];
    if (!cssVar || !value) return;

    let hsl = value;
    // If it's a hex, convert to space-separated HSL
    if (typeof value === 'string' && (value.startsWith('#') || value.length === 3 || value.length === 6)) {
        hsl = hexToHSL(value);
    }

    if (hsl && typeof hsl === 'string' && hsl.includes(' ')) {
        document.documentElement.style.setProperty(cssVar, hsl);

        // Special handling for foregrounds to ensure readability
        // If we set a primary color, we should also ensure primary-foreground exists
        if (key === 'theme_primary') {
            // Calculate if the color is dark or light
            const parts = hsl.replace(/%/g, '').split(' ');
            const lightness = parseFloat(parts[2]);

            // Set primary-foreground based on lightness
            // If lightness < 60%, use white-ish, otherwise use dark
            const foregroundVar = '--primary-foreground';
            const foregroundVal = lightness < 60 ? '210 40% 98%' : '222.2 47.4% 11.2%';
            document.documentElement.style.setProperty(foregroundVar, foregroundVal);
        }
    } else {
        console.warn(`Invalid theme color for ${key}:`, value);
    }
};
