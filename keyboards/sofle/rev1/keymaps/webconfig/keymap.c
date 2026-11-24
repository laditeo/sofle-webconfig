// Copyright 2026
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Sofle keymap with VIA support (live remapping in https://usevia.app).
// Single-layer layout transcribed from the user's VIA setup (left half).
// Encoder rotation is remappable in VIA thanks to the encoder map below.
//
// Built automatically by GitHub Actions (qmk_userspace). See README.

#include QMK_KEYBOARD_H

enum layers {
    _BASE,
};

// ---------------------------------------------------------------------------
// Keymap
// ---------------------------------------------------------------------------
//
// Left half matches the user's layout. The knob push (matrix [4,5], the key
// that sits just right of B) defaults to Mute and is remappable live in VIA.
// The right half keeps a standard QWERTY layout so the board still works
// fully if the right side is ever used.

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [_BASE] = LAYOUT(
        KC_GRV,   KC_1,   KC_2,    KC_3,    KC_4,    KC_5,                        KC_6,    KC_7,    KC_8,    KC_9,    KC_0,  KC_GRV,
        KC_TAB,   KC_Q,   KC_W,    KC_E,    KC_R,    KC_T,                        KC_Y,    KC_U,    KC_I,    KC_O,    KC_P,  KC_BSPC,
        KC_TAB,   KC_A,   KC_S,    KC_D,    KC_F,    KC_G,                        KC_H,    KC_J,    KC_K,    KC_L, KC_SCLN,  KC_QUOT,
        KC_LSFT,  KC_Z,   KC_X,    KC_C,    KC_V,    KC_B, KC_MUTE,      XXXXXXX, KC_N,    KC_M, KC_COMM,  KC_DOT, KC_SLSH,  KC_RSFT,
                    KC_LGUI, KC_LALT, KC_LCTL, KC_SPC, KC_SPC,     KC_ENT, KC_SPC, KC_RCTL, KC_RALT, KC_RGUI
    ),
};

// ---------------------------------------------------------------------------
// Encoder map (remappable live in VIA by clicking the knob icon)
// ---------------------------------------------------------------------------
//
// Left encoder (index 0) defaults to brightness, the right one to volume.

#if defined(ENCODER_MAP_ENABLE)
const uint16_t PROGMEM encoder_map[][NUM_ENCODERS][2] = {
    [_BASE] = { ENCODER_CCW_CW(KC_BRID, KC_BRIU), ENCODER_CCW_CW(KC_VOLD, KC_VOLU) },
};
#endif
