# Raw HID interface used by the web configurator to read/write the encoder
# actions over USB (WebHID).
RAW_ENABLE = yes

# Required so the encoder can emit consumer/media keys (volume, mute, play...).
EXTRAKEY_ENABLE = yes

# NOTE: MOUSEKEY is intentionally disabled. On the atmega32u4 the keyboard,
# mouse, consumer and Raw HID reports share a single USB endpoint, and enabling
# the mouse HID collection was causing consumer (volume/media) reports to be
# misrouted as mouse events in some applications.
MOUSEKEY_ENABLE = no
