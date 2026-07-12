import { MOD, MOD_LABELS, KEY_GROUPS, decodeKeycode, encodeKeycode, formatKeycode } from './keycodes.js';

// Raw HID protocol — must match firmware/webconfig/keymap.c
const HID_CMD_GET_CONFIG = 0x01;
const HID_CMD_SET_CONFIG = 0x02;
const HID_CMD_RESET      = 0x03;
const HID_RSP_OK         = 0x80;
const HID_RSP_ERR        = 0x81;

const RAW_USAGE_PAGE = 0xff60;
const RAW_USAGE_ID   = 0x61;
const REPORT_SIZE    = 32;

// Sofle USB identifiers (rev1 + keyhive variants)
const SOFLE_VID = 0xfc32;
const SOFLE_PIDS = [0x0287, 0x1287];

let device = null;

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function setStatus(text, kind = 'info') {
    const el = $('status');
    el.textContent = text;
    el.dataset.kind = kind;
}

function buildActionEditor(prefix, title, hint) {
    const card = document.createElement('section');
    card.className = 'action-card';
    card.dataset.prefix = prefix;

    card.innerHTML = `
        <div class="action-header">
            <h2>${title}</h2>
            <p class="action-hint">${hint}</p>
        </div>
        <div class="mod-row" id="${prefix}-mods"></div>
        <label class="field">
            <span>Key</span>
            <select id="${prefix}-key"></select>
        </label>
        <div class="preview" id="${prefix}-preview">—</div>
    `;

    const modRow = card.querySelector(`#${prefix}-mods`);
    for (const { mask, label } of MOD_LABELS) {
        const id = `${prefix}-mod-${label.toLowerCase()}`;
        modRow.insertAdjacentHTML(
            'beforeend',
            `<label class="mod-chip"><input type="checkbox" id="${id}" data-mask="0x${mask.toString(16)}"><span>${label}</span></label>`
        );
    }

    const select = card.querySelector(`#${prefix}-key`);
    for (const group of KEY_GROUPS) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.label;
        for (const key of group.keys) {
            const option = document.createElement('option');
            option.value = key.code;
            option.textContent = key.label;
            optgroup.appendChild(option);
        }
        select.appendChild(optgroup);
    }

    return card;
}

function readAction(prefix) {
    let mods = 0;
    for (const { mask, label } of MOD_LABELS) {
        const cb = $(`${prefix}-mod-${label.toLowerCase()}`);
        if (cb?.checked) {
            mods |= mask;
        }
    }
    const base = parseInt($(`${prefix}-key`).value, 10);
    return encodeKeycode(mods, base);
}

function writeAction(prefix, keycode) {
    const { mods, base } = decodeKeycode(keycode);

    for (const { mask, label } of MOD_LABELS) {
        const cb = $(`${prefix}-mod-${label.toLowerCase()}`);
        if (cb) {
            cb.checked = !!(mods & mask);
        }
    }

    $(`${prefix}-key`).value = String(base);
    $(`${prefix}-preview`).textContent = formatKeycode(keycode);
}

function updatePreview(prefix) {
    $(`${prefix}-preview`).textContent = formatKeycode(readAction(prefix));
}

// ---------------------------------------------------------------------------
// WebHID
// ---------------------------------------------------------------------------

function isSofleRawHidDevice(d) {
    if (d.vendorId !== SOFLE_VID || !SOFLE_PIDS.includes(d.productId)) {
        return false;
    }
    return d.collections.some(
        (c) => c.usagePage === RAW_USAGE_PAGE && c.usage === RAW_USAGE_ID
    );
}

async function sendCommand(command, payload = []) {
    if (!device?.opened) {
        throw new Error('Keyboard not connected');
    }

    const data = new Uint8Array(REPORT_SIZE);
    data[0] = command;
    for (let i = 0; i < payload.length && i + 1 < REPORT_SIZE; i++) {
        data[i + 1] = payload[i];
    }

    await device.sendReport(0, data);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            device.removeEventListener('inputreport', onReport);
            reject(new Error('Timed out waiting for keyboard response'));
        }, 3000);

        function onReport(event) {
            const buf = new Uint8Array(event.data.buffer);
            clearTimeout(timeout);
            device.removeEventListener('inputreport', onReport);

            if (buf[0] === HID_RSP_ERR) {
                reject(new Error('Keyboard returned an error'));
                return;
            }
            if (buf[0] !== HID_RSP_OK) {
                reject(new Error(`Unexpected response 0x${buf[0].toString(16)}`));
                return;
            }
            resolve(buf);
        }

        device.addEventListener('inputreport', onReport);
    });
}

async function connect() {
    if (!('hid' in navigator)) {
        setStatus('WebHID is not available. Use Chrome or Edge on desktop.', 'error');
        return;
    }

    try {
        const filters = SOFLE_PIDS.map((pid) => ({
            vendorId: SOFLE_VID,
            productId: pid,
        }));

        const picked = await navigator.hid.requestDevice({ filters });
        const match = picked.find(isSofleRawHidDevice);

        if (!match) {
            setStatus('No Sofle Raw HID interface found. Flash the webconfig firmware first.', 'error');
            return;
        }

        if (device?.opened) {
            await device.close();
        }

        device = match;
        await device.open();
        device.addEventListener('disconnect', onDisconnect);

        $('connect-btn').hidden = true;
        $('disconnect-btn').hidden = false;
        $('actions').hidden = false;
        $('toolbar').hidden = false;

        setStatus(`Connected to ${device.productName || 'Sofle'}`, 'ok');
        await loadConfig();
    } catch (err) {
        if (err.name !== 'NotFoundError') {
            setStatus(`Connection failed: ${err.message}`, 'error');
        }
    }
}

async function disconnect() {
    if (device?.opened) {
        device.removeEventListener('disconnect', onDisconnect);
        await device.close();
    }
    device = null;
    $('connect-btn').hidden = false;
    $('disconnect-btn').hidden = true;
    $('actions').hidden = true;
    $('toolbar').hidden = true;
    setStatus('Disconnected', 'info');
}

function onDisconnect() {
    device = null;
    $('connect-btn').hidden = false;
    $('disconnect-btn').hidden = true;
    $('actions').hidden = true;
    $('toolbar').hidden = true;
    setStatus('Keyboard disconnected', 'warn');
}

async function loadConfig() {
    const response = await sendCommand(HID_CMD_GET_CONFIG);
    const cw  = response[2] | (response[3] << 8);
    const ccw = response[4] | (response[5] << 8);
    const tap = response[6] | (response[7] << 8);

    writeAction('cw', cw);
    writeAction('ccw', ccw);
    writeAction('tap', tap);
    setStatus('Loaded current encoder settings from keyboard', 'ok');
}

async function saveConfig() {
    const cw  = readAction('cw');
    const ccw = readAction('ccw');
    const tap = readAction('tap');

    const payload = [
        cw & 0xff, (cw >> 8) & 0xff,
        ccw & 0xff, (ccw >> 8) & 0xff,
        tap & 0xff, (tap >> 8) & 0xff,
    ];

    await sendCommand(HID_CMD_SET_CONFIG, payload);
    setStatus('Saved to keyboard EEPROM — settings persist across reboots', 'ok');
}

async function resetDefaults() {
    if (!confirm('Reset encoder actions to Volume Down / Volume Up / Mute?')) {
        return;
    }
    await sendCommand(HID_CMD_RESET);
    await loadConfig();
    setStatus('Reset to factory encoder defaults', 'ok');
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function init() {
    const grid = $('action-grid');
    grid.appendChild(buildActionEditor('cw',  'Clockwise',        'Turn the knob to the right'));
    grid.appendChild(buildActionEditor('ccw', 'Counter-clockwise','Turn the knob to the left'));
    grid.appendChild(buildActionEditor('tap', 'Knob tap',         'Press the encoder button'));

    for (const prefix of ['cw', 'ccw', 'tap']) {
        const card = grid.querySelector(`[data-prefix="${prefix}"]`);
        card.querySelectorAll('input, select').forEach((el) => {
            el.addEventListener('change', () => updatePreview(prefix));
        });
    }

    $('connect-btn').addEventListener('click', connect);
    $('disconnect-btn').addEventListener('click', disconnect);
    $('save-btn').addEventListener('click', () => saveConfig().catch((e) => setStatus(e.message, 'error')));
    $('reload-btn').addEventListener('click', () => loadConfig().catch((e) => setStatus(e.message, 'error')));
    $('reset-btn').addEventListener('click', () => resetDefaults().catch((e) => setStatus(e.message, 'error')));
}

document.addEventListener('DOMContentLoaded', init);
