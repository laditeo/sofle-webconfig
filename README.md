# Sofle VIA Keymap

A QMK keymap for the [SofleKeyboard](https://github.com/josefadamcik/SofleKeyboard)
with **VIA support** — every key, plus the rotary knob (clockwise,
counter-clockwise, tap), is remappable live in [usevia.app](https://usevia.app),
no recompiling.

| Knob action | Default |
|-------------|---------|
| Clockwise rotation | Brightness Up |
| Counter-clockwise rotation | Brightness Down |
| Knob tap (press) | Mute |

The layout is a single layer (transcribed from the user's VIA setup, left half).
Settings are stored in the keyboard's **EEPROM** and persist across reboots.

## How it works

- **Firmware** — a QMK keymap (`keyboards/sofle/rev1/keymaps/webconfig/`) built
  with `VIA_ENABLE` + `ENCODER_MAP_ENABLE`, so it speaks the VIA protocol over
  Raw HID and exposes the encoder to VIA.
- **Cloud build** — this repo is a [QMK external userspace](https://docs.qmk.fm/newbs_external_userspace).
  GitHub Actions compiles the firmware, so nothing heavy is installed locally.

## Board

This keymap targets **Sofle rev1** (Pro Micro, `VID 0xFC32 / PID 0x0287`).

## Building in the cloud (no local toolchain)

1. Push this repo to GitHub.
2. Open the repo → **Actions** tab. The **Build QMK firmware** workflow runs on
   every push.
3. When it finishes, download the compiled firmware from the workflow run's
   **Artifacts** or the auto-created **Release**. The file is named like
   `sofle_rev1_webconfig.hex`.

To rebuild after changing the keymap, just commit and push again.

## Flashing (Sofle rev1 / Pro Micro)

1. Install [QMK Toolbox](https://github.com/qmk/qmk_toolbox/releases) (~15 MB).
2. Open QMK Toolbox, select the downloaded `.hex`, set MCU to **atmega32u4**.
3. Enable **Auto-Flash**, then reset the keyboard half into the bootloader
   (double-tap the reset button, or briefly bridge **RST** and **GND**).
   Wait for `Validating... Success` / `Flash complete`.
4. Disable Auto-Flash, unplug and replug the keyboard. Repeat for the other
   half if you have it.

## Remapping keys

1. Open [usevia.app](https://usevia.app) in **Chrome** or **Edge**.
2. **Authorize device** → select **Sofle v1** (VID `0xFC32`, PID `0x0287`).
3. Click any key to reassign it. The knobs appear as rotary icons (`e0` left,
   `e1` right) — click one to remap clockwise / counter-clockwise rotation.
   The knob *press* is an ordinary key (just right of `B` on the left half).
4. Changes are saved to the keyboard instantly.

## Project layout

```
Sofle/
├── .github/workflows/build_binaries.yaml   # GitHub Actions cloud build
├── qmk.json                                # userspace build target
├── keyboards/sofle/rev1/keymaps/webconfig/ # the QMK firmware
│   ├── keymap.c      # layout + encoder map
│   ├── config.h      # layer count, tap delay, USB device version
│   └── rules.mk      # VIA_ENABLE / ENCODER_MAP_ENABLE / EXTRAKEY_ENABLE
├── web/              # legacy custom WebHID configurator (pre-VIA firmware;
│                     #   kept for reference, does NOT work with this keymap)
└── README.md
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Actions build fails | Check the run log; make sure `qmk.json` lists `["sofle/rev1", "webconfig"]` |
| usevia.app doesn't see the keyboard | Unplug/replug USB; use Chrome/Edge; make sure the VIA firmware is flashed (`Validating... Success`) |
| Volume/brightness acts like mouse in some windows | Stale Windows HID cache — bump `DEVICE_VER` in `config.h`, reflash, replug |
| Knob rotation missing in VIA | Firmware must be built with `ENCODER_MAP_ENABLE = yes` (this keymap has it) |
| Flash doesn't apply | Pro Micro's bootloader window is ~8 s — use Auto-Flash and wait for `Validating... Success` |

## License

GPL-2.0-or-later (same as QMK / Sofle ecosystem).
