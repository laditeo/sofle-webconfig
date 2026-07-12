// QMK keycode helpers for the Sofle encoder configurator.
// Modifier masks match QMK's MOD_* constants (left-side mods).

export const MOD = {
    LCTL: 0x0100,
    LSFT: 0x0200,
    LALT: 0x0400,
    LGUI: 0x0800,
};

export const MOD_LABELS = [
    { mask: MOD.LCTL, label: 'Ctrl' },
    { mask: MOD.LSFT, label: 'Shift' },
    { mask: MOD.LALT, label: 'Alt' },
    { mask: MOD.LGUI, label: 'Win' },
];

/** Grouped base keycodes (without modifiers). */
export const KEY_GROUPS = [
    {
        label: '— None —',
        keys: [{ code: 0x0000, label: '(disabled)' }],
    },
    {
        label: 'Letters',
        keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => ({
            code: 0x0004 + (ch.charCodeAt(0) - 65),
            label: ch,
        })),
    },
    {
        label: 'Numbers (top row)',
        keys: [
            { code: 0x001e, label: '1' },
            { code: 0x001f, label: '2' },
            { code: 0x0020, label: '3' },
            { code: 0x0021, label: '4' },
            { code: 0x0022, label: '5' },
            { code: 0x0023, label: '6' },
            { code: 0x0024, label: '7' },
            { code: 0x0025, label: '8' },
            { code: 0x0026, label: '9' },
            { code: 0x0027, label: '0' },
        ],
    },
    {
        label: 'Navigation',
        keys: [
            { code: 0x0052, label: 'Up' },
            { code: 0x0051, label: 'Down' },
            { code: 0x0050, label: 'Left' },
            { code: 0x004f, label: 'Right' },
            { code: 0x004a, label: 'Home' },
            { code: 0x004d, label: 'End' },
            { code: 0x004b, label: 'Page Up' },
            { code: 0x004e, label: 'Page Down' },
            { code: 0x0049, label: 'Insert' },
            { code: 0x004c, label: 'Delete' },
            { code: 0x002a, label: 'Backspace' },
            { code: 0x0028, label: 'Enter' },
            { code: 0x0029, label: 'Escape' },
            { code: 0x002b, label: 'Tab' },
            { code: 0x002c, label: 'Space' },
        ],
    },
    {
        label: 'Function keys',
        keys: Array.from({ length: 12 }, (_, i) => ({
            code: 0x003a + i,
            label: `F${i + 1}`,
        })),
    },
    {
        label: 'Media & volume',
        keys: [
            { code: 0x00aa, label: 'Volume Down' },
            { code: 0x00a9, label: 'Volume Up' },
            { code: 0x00a8, label: 'Mute' },
            { code: 0x00ac, label: 'Previous Track' },
            { code: 0x00ab, label: 'Next Track' },
            { code: 0x00ae, label: 'Play / Pause' },
            { code: 0x00ad, label: 'Stop' },
            { code: 0x00bc, label: 'Rewind' },
            { code: 0x00bb, label: 'Fast Forward' },
            { code: 0x00bd, label: 'Brightness Up' },
            { code: 0x00be, label: 'Brightness Down' },
        ],
    },
    {
        label: 'Symbols',
        keys: [
            { code: 0x002d, label: 'Minus (-)' },
            { code: 0x002e, label: 'Equals (=)' },
            { code: 0x002f, label: 'Left Bracket ([)' },
            { code: 0x0030, label: 'Right Bracket (])' },
            { code: 0x0031, label: 'Backslash (\\)' },
            { code: 0x0033, label: 'Semicolon (;)' },
            { code: 0x0034, label: 'Quote (\')' },
            { code: 0x0035, label: 'Grave (`)' },
            { code: 0x0036, label: 'Comma (,)' },
            { code: 0x0037, label: 'Period (.)' },
            { code: 0x0038, label: 'Slash (/)' },
        ],
    },
    {
        label: 'Mouse',
        keys: [
            { code: 0x00d1, label: 'Mouse Left' },
            { code: 0x00d2, label: 'Mouse Right' },
            { code: 0x00d3, label: 'Mouse Middle' },
            { code: 0x00d4, label: 'Mouse 4' },
            { code: 0x00d5, label: 'Mouse 5' },
            { code: 0x00d9, label: 'Mouse Wheel Up' },
            { code: 0x00da, label: 'Mouse Wheel Down' },
        ],
    },
];

const BASE_LOOKUP = new Map();
for (const group of KEY_GROUPS) {
    for (const key of group.keys) {
        BASE_LOOKUP.set(key.code, key.label);
    }
}

/** Split a QMK keycode into modifier mask and base keycode. */
export function decodeKeycode(keycode) {
    const mods = keycode & 0xff00;
    const base = keycode & 0x00ff;
    return { mods, base };
}

/** Combine modifier mask and base keycode into a QMK keycode. */
export function encodeKeycode(mods, base) {
    return (mods & 0xff00) | (base & 0x00ff);
}

/** Human-readable label, e.g. "Ctrl+Shift+A" or "Volume Up". */
export function formatKeycode(keycode) {
    if (keycode === 0) {
        return '(disabled)';
    }

    const { mods, base } = decodeKeycode(keycode);
    const parts = [];

    for (const { mask, label } of MOD_LABELS) {
        if (mods & mask) {
            parts.push(label);
        }
    }

    const baseLabel = BASE_LOOKUP.get(base) ?? `0x${base.toString(16).toUpperCase()}`;
    parts.push(baseLabel);
    return parts.join('+');
}

/** Find the best matching base key entry for a keycode. */
export function findBaseKey(base) {
    for (const group of KEY_GROUPS) {
        const match = group.keys.find((k) => k.code === base);
        if (match) {
            return match;
        }
    }
    return KEY_GROUPS[0].keys[0];
}
