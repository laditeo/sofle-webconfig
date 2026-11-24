// Copyright 2026
// SPDX-License-Identifier: GPL-2.0-or-later

#pragma once

// Only one layer is used; keeping the dynamic keymap to a single layer saves
// EEPROM on the atmega32u4 (1 kB total).
#define DYNAMIC_KEYMAP_LAYER_COUNT 1

// Give consumer/media taps (volume, play/pause, ...) a moment to register.
#define TAP_CODE_DELAY 10

// Bump the USB device release number (bcdDevice). We flashed several different
// HID descriptors (mouse on/off, NKRO on/off, custom Raw HID vs VIA) under the
// same VID/PID/version, and Windows caches the HID report descriptor keyed by
// VID/PID/bcdDevice. Changing the release number makes Windows treat this as a
// new device and re-read the current, correct descriptor.
#undef DEVICE_VER
#define DEVICE_VER 0x0003
