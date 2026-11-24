# VIA support: live remapping of every key in https://usevia.app.
# Speaks the VIA protocol over Raw HID and stores the dynamic keymap in EEPROM.
VIA_ENABLE = yes

# Lets VIA remap encoder rotation (clockwise / counter-clockwise) from the UI
# (the knob appears in the layout as an "e0" position).
ENCODER_MAP_ENABLE = yes

# Required so the keyboard can emit consumer/media keys (volume, mute, ...).
EXTRAKEY_ENABLE = yes

# On the atmega32u4 the keyboard, mouse, consumer and Raw HID reports share a
# single USB endpoint. Enabling the mouse HID collection and/or NKRO changes the
# report layout and causes consumer (volume/media) reports to be misrouted or
# ignored in some applications. A known-good Sofle VIA build disables both, so
# we match it here.
MOUSEKEY_ENABLE = no
NKRO_ENABLE = no
