// Copyright 2026
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Sofle keymap with a web-configurable rotary encoder.
// Single-layer layout transcribed from the user's VIA setup (left half).
//
// Built automatically by GitHub Actions (qmk_userspace). See README.

#include QMK_KEYBOARD_H
#include "raw_hid.h"

enum layers {
    _BASE,
};

enum custom_keycodes {
    // Encoder push button. Fires the tap action configured from the web app.
    KC_ENC_BTN = QK_USER,
};

// ---------------------------------------------------------------------------
// Encoder configuration (persisted in EEPROM, editable via WebHID)
// ---------------------------------------------------------------------------

typedef struct {
    uint16_t cw;  // clockwise rotation
    uint16_t ccw; // counter-clockwise rotation
    uint16_t tap; // knob press / click
} encoder_config_t;

static encoder_config_t encoder_config;

// Raw HID protocol (32-byte reports, usage page 0xFF60 / usage 0x61)
#define HID_CMD_GET_CONFIG 0x01
#define HID_CMD_SET_CONFIG 0x02
#define HID_CMD_RESET      0x03
#define HID_RSP_OK         0x80
#define HID_RSP_ERR        0x81

static void encoder_config_set_defaults(void) {
    encoder_config.cw  = KC_VOLD;
    encoder_config.ccw = KC_VOLU;
    encoder_config.tap = KC_MUTE;
}

static void encoder_config_load(void) {
    if (!eeconfig_is_user_datablock_valid()) {
        eeconfig_init_user_datablock();
        encoder_config_set_defaults();
        eeconfig_update_user_datablock(&encoder_config, 0, sizeof(encoder_config_t));
        return;
    }

    eeconfig_read_user_datablock(&encoder_config, 0, sizeof(encoder_config_t));
}

static void encoder_config_save(void) {
    eeconfig_update_user_datablock(&encoder_config, 0, sizeof(encoder_config_t));
}

static void encoder_config_send(uint8_t *response) {
    response[0] = HID_RSP_OK;
    response[1] = HID_CMD_GET_CONFIG;
    response[2] = encoder_config.cw & 0xFF;
    response[3] = (encoder_config.cw >> 8) & 0xFF;
    response[4] = encoder_config.ccw & 0xFF;
    response[5] = (encoder_config.ccw >> 8) & 0xFF;
    response[6] = encoder_config.tap & 0xFF;
    response[7] = (encoder_config.tap >> 8) & 0xFF;
}

static void encoder_config_apply_from_packet(const uint8_t *data) {
    encoder_config.cw  = (uint16_t)data[2] | ((uint16_t)data[3] << 8);
    encoder_config.ccw = (uint16_t)data[4] | ((uint16_t)data[5] << 8);
    encoder_config.tap = (uint16_t)data[6] | ((uint16_t)data[7] << 8);
    encoder_config_save();
}

// ---------------------------------------------------------------------------
// Keymap
// ---------------------------------------------------------------------------
//
// Left half matches the user's layout. The knob push (matrix [4,5], the key
// that sits just right of B) is KC_ENC_BTN so it can be remapped from the web
// app. The right half keeps a standard QWERTY layout so the board still works
// fully if the right side is ever used.

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [_BASE] = LAYOUT(
        KC_GRV,   KC_1,   KC_2,    KC_3,    KC_4,    KC_5,                        KC_6,    KC_7,    KC_8,    KC_9,    KC_0,  KC_GRV,
        KC_TAB,   KC_Q,   KC_W,    KC_E,    KC_R,    KC_T,                        KC_Y,    KC_U,    KC_I,    KC_O,    KC_P,  KC_BSPC,
        KC_TAB,   KC_A,   KC_S,    KC_D,    KC_F,    KC_G,                        KC_H,    KC_J,    KC_K,    KC_L, KC_SCLN,  KC_QUOT,
        KC_LSFT,  KC_Z,   KC_X,    KC_C,    KC_V,    KC_B, KC_ENC_BTN,   XXXXXXX, KC_N,    KC_M, KC_COMM,  KC_DOT, KC_SLSH,  KC_RSFT,
                    KC_LGUI, KC_LALT, KC_LCTL, KC_SPC, KC_SPC,     KC_ENT, KC_SPC, KC_RCTL, KC_RALT, KC_RGUI
    ),
};

// ---------------------------------------------------------------------------
// Encoder rotation
// ---------------------------------------------------------------------------

bool encoder_update_user(uint8_t index, bool clockwise) {
    if (index != 0) {
        return true;
    }

    uint16_t keycode = clockwise ? encoder_config.cw : encoder_config.ccw;
    if (keycode != KC_NO) {
        tap_code16(keycode);
    }
    return false;
}

// ---------------------------------------------------------------------------
// Knob push
// ---------------------------------------------------------------------------

bool process_record_user(uint16_t keycode, keyrecord_t *record) {
    if (keycode == KC_ENC_BTN) {
        if (record->event.pressed && encoder_config.tap != KC_NO) {
            tap_code16(encoder_config.tap);
        }
        return false;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Raw HID (WebHID configurator)
// ---------------------------------------------------------------------------

void raw_hid_receive(uint8_t *data, uint8_t length) {
    uint8_t response[RAW_EPSIZE];
    memset(response, 0, sizeof(response));

    if (length < 1) {
        response[0] = HID_RSP_ERR;
        raw_hid_send(response, sizeof(response));
        return;
    }

    switch (data[0]) {
        case HID_CMD_GET_CONFIG:
            encoder_config_send(response);
            break;

        case HID_CMD_SET_CONFIG:
            if (length < 8) {
                response[0] = HID_RSP_ERR;
            } else {
                encoder_config_apply_from_packet(data);
                response[0] = HID_RSP_OK;
                response[1] = HID_CMD_SET_CONFIG;
            }
            break;

        case HID_CMD_RESET:
            encoder_config_set_defaults();
            encoder_config_save();
            response[0] = HID_RSP_OK;
            response[1] = HID_CMD_RESET;
            break;

        default:
            response[0] = HID_RSP_ERR;
            break;
    }

    raw_hid_send(response, sizeof(response));
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

void keyboard_post_init_user(void) {
    encoder_config_load();
}
