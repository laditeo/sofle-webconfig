// Copyright 2026
// SPDX-License-Identifier: GPL-2.0-or-later

#pragma once

// Reserve a small block of EEPROM to persist the three encoder actions
// (clockwise / counter-clockwise / knob tap). 3 x uint16_t = 6 bytes.
#define EECONFIG_USER_DATA_SIZE 6
// Bump this whenever the on-device layout of the block changes so old data
// stored in EEPROM is treated as invalid and re-initialised to defaults.
// v2: force-clear stale/garbage encoder config that survived reflashes so the
// board comes up with the volume defaults again.
#define EECONFIG_USER_DATA_VERSION 2

// Give consumer/media taps (volume, play/pause, ...) a moment to register.
#define TAP_CODE_DELAY 10

// Bump the USB device release number (bcdDevice). We flashed several different
// HID descriptors (mouse on/off, NKRO on/off) under the same VID/PID/version,
// and Windows caches the HID report descriptor keyed by VID/PID/bcdDevice. That
// stale cache made consumer (volume) reports get misinterpreted as mouse events
// in some windows. Changing the release number makes Windows treat this as a new
// device and re-read the current, correct descriptor.
#undef DEVICE_VER
#define DEVICE_VER 0x0002
