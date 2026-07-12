// Copyright 2026
// SPDX-License-Identifier: GPL-2.0-or-later

#pragma once

// Reserve a small block of EEPROM to persist the three encoder actions
// (clockwise / counter-clockwise / knob tap). 3 x uint16_t = 6 bytes.
#define EECONFIG_USER_DATA_SIZE 6
// Bump this whenever the on-device layout of the block changes so old data
// stored in EEPROM is treated as invalid and re-initialised to defaults.
#define EECONFIG_USER_DATA_VERSION 1

// Give consumer/media taps (volume, play/pause, ...) a moment to register.
#define TAP_CODE_DELAY 10
