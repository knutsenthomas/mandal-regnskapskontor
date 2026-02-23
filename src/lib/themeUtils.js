/**
 * Converts any color string (Hex, HSL, RGB) to clean HSL components (e.g., "202 50.8% 23.1%")
 * @param {string} colorStr - The color string
 * @returns {string|null} - The HSL components string or null
 */
export const sanitizeToHSL = (colorStr) => {
    if (!colorStr || typeof colorStr !== 'string') return null;

    // 1. If it's already a clean space-separated HSL components list, just return it
    if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(colorStr.trim())) {
        return colorStr.trim();
    }

    // 2. Handle Hex
    if (colorStr.startsWith('#') || /^[0-9a-fA-F]{3,6}$/.test(colorStr)) {
        let r = 0, g = 0, b = 0;
        const cleanHex = colorStr.startsWith('#') ? colorStr.slice(1) : colorStr;

        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.slice(0, 2), 16);
            g = parseInt(cleanHex.slice(2, 4), 16);
            b = parseInt(cleanHex.slice(4, 6), 16);
        } else {
            return null;
        }

        r /= 255; g /= 255; b /= 255;
        const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
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

        return `${h} ${s}% ${l}%`;
    }

    // 3. Handle hsl(...) or rgb(...) by stripping wrapper and commas
    let clean = colorStr.replace(/hsl\(|hsla\(|rgb\(|rgba\(|\)/g, '');
    clean = clean.replace(/,/g, ' ').trim();

    // Ensure it's now space-separated. If it has 3 or 4 parts, return the first 3.
    const parts = clean.split(/\s+/);
    if (parts.length >= 3) {
        // Simple validation: first should be number, next two should have % or be numbers
        return `${parts[0]} ${parts[1].includes('%') ? parts[1] : parts[1] + '%'} ${parts[2].includes('%') ? parts[2] : parts[2] + '%'}`;
    }

    return null;
};

export const hexToHSL = sanitizeToHSL;

/**
 * Converts an HSL string components back to Hex
 * @param {string} hslStr - The HSL string components (e.g., "200 50% 50%")
 * @returns {string} - The hex color string
 */
export const hslToHex = (hslStr) => {
    if (!hslStr) return '#000000';
    if (typeof hslStr === 'string' && hslStr.startsWith('#')) return hslStr;

    try {
        const clean = hslStr.replace(/hsl\(|\)|%/g, '').replace(/,/g, ' ').trim();
        const parts = clean.split(/\s+/);
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
 * @param {string} value - Color value (Hex, HSL, or RGB)
 */
export const applyThemeColor = (key, value) => {
    const cssVarMap = {
        'theme_primary': '--primary',
        'theme_secondary': '--secondary',
        'theme_background': '--background',
        'theme_card': '--card',
        'theme_foreground': '--foreground',
        'theme_muted': '--muted',
        'theme_accent': '--accent'
    };

    const cssVar = cssVarMap[key];
    if (!cssVar || !value) return;

    const hslComponents = sanitizeToHSL(value);

    if (hslComponents) {
        document.documentElement.style.setProperty(cssVar, hslComponents);

        // Keep --card in sync with --background if not explicitly set
        if (key === 'theme_background') {
            document.documentElement.style.setProperty('--card', hslComponents);
        }

        // Standard logic for primary foreground
        if (key === 'theme_primary') {
            const parts = hslComponents.replace(/%/g, '').split(' ');
            const lightness = parseFloat(parts[2]);
            const foregroundVal = lightness < 60 ? '210 40% 98%' : '222.2 47.4% 11.2%';
            document.documentElement.style.setProperty('--primary-foreground', foregroundVal);
        }
    } else {
        console.warn(`Could not sanitize theme color for ${key}:`, value);
    }
};
