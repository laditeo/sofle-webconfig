# Sofle Encoder Web Configurator

Configure what the **rotary knob** on a [SofleKeyboard](https://github.com/josefadamcik/SofleKeyboard)
does — clockwise, counter-clockwise, and knob tap — from a web page, without
recompiling every time.

| Action | Default |
|--------|---------|
| Clockwise rotation | Volume Down |
| Counter-clockwise rotation | Volume Up |
| Knob tap (press) | Mute |

Settings are stored in the keyboard's **EEPROM** and persist across reboots.

## How it works

- **Firmware** — a QMK keymap (`keyboards/sofle/rev1/keymaps/webconfig/`) that
  stores three keycodes in EEPROM and exposes them over **Raw HID** (WebHID).
- **Web app** (`web/`) — a local page that talks to the keyboard over USB.
- **Cloud build** — this repo is a [QMK external userspace](https://docs.qmk.fm/newbs_external_userspace).
  GitHub Actions compiles the firmware for you, so nothing heavy is installed locally.

```
Browser (Chrome/Edge)  --WebHID-->  Sofle (Raw HID)  -->  EEPROM
                                              |
                                    encoder rotation / tap
```

## Board

This keymap targets **Sofle rev1** (Pro Micro, `VID 0xFC32 / PID 0x0287`).

## Building in the cloud (no local toolchain)

1. Create a new repository on GitHub (e.g. `sofle-webconfig`).
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Sofle encoder web configurator"
   git branch -M main
   git remote add origin https://github.com/<you>/sofle-webconfig.git
   git push -u origin main
   ```
3. Open the repo on GitHub → **Actions** tab. The **Build QMK firmware** workflow
   runs automatically on every push.
4. When it finishes, download the compiled firmware:
   - from the workflow run's **Artifacts**, or
   - from the auto-created **Release** on the repo's main page.
   The file is named like `sofle_rev1_webconfig.hex`.

To rebuild after changing the keymap, just commit and push again.

## Flashing (Sofle rev1 / Pro Micro)

1. Install [QMK Toolbox](https://github.com/qmk/qmk_toolbox/releases) (~15 MB).
2. Open QMK Toolbox, select the downloaded `.hex`, set MCU to **atmega32u4**.
3. Click **Flash**, then reset the keyboard half (double-tap the reset button,
   or briefly bridge **RST** and **GND**). It will flash automatically.
4. Repeat for the **other half** (reset the other side while Flash is armed).

> First-time flash of a VIA board: flashing this firmware **replaces VIA**.
> Your layout is baked into `keymap.c`, so it is preserved — but you will no
> longer edit keys through via.app (only the knob, via this web app).

## Using the web configurator

1. Plug the keyboard in via USB.
2. Open `web/index.html` in **Chrome** or **Edge** (WebHID required; Firefox and
   Safari are not supported).
3. Click **Connect keyboard** and select your Sofle.
4. Set shortcuts for clockwise, counter-clockwise, and tap.
5. Click **Save to keyboard**.

> If opening the file directly (`file://`) blocks the module scripts, serve it:
> ```bash
> cd web && python -m http.server 8080
> ```
> then visit http://localhost:8080

### Choosing shortcuts

Each action supports:

- **Modifier chips** — Ctrl, Shift, Alt, Win
- **Key dropdown** — letters, navigation, F-keys, media/volume, symbols, mouse
- **(disabled)** — turns that action off

| Use case | Clockwise | Counter-clockwise | Tap |
|----------|-----------|-------------------|-----|
| Volume (default) | Volume Down | Volume Up | Mute |
| Scroll | Mouse Wheel Down | Mouse Wheel Up | — |
| Zoom | Ctrl + = | Ctrl + - | — |
| Tabs | Ctrl + Tab | Ctrl + Shift + Tab | — |

## Project layout

```
Sofle/
├── .github/workflows/build_binaries.yaml   # GitHub Actions cloud build
├── qmk.json                                # userspace build target
├── keyboards/sofle/rev1/keymaps/webconfig/ # the QMK firmware
│   ├── keymap.c      # layout + encoder logic + Raw HID protocol
│   ├── config.h      # EEPROM size, tap delay
│   └── rules.mk      # RAW_ENABLE = yes
├── web/              # WebHID configurator (open index.html)
│   ├── index.html
│   ├── app.js
│   ├── keycodes.js
│   └── style.css
└── README.md
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Actions build fails | Check the run log; make sure `qmk.json` lists `["sofle/rev1", "webconfig"]` |
| "WebHID is not available" | Use Chrome or Edge on desktop |
| "No Sofle Raw HID interface found" | Flash the `webconfig` firmware first |
| Web page can't connect | Unplug/replug USB; try another port |
| Settings lost after reflash | Some flash steps clear EEPROM — just re-save from the web app |

## License

GPL-2.0-or-later (same as QMK / Sofle ecosystem).
