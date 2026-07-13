# Raw HID interface used by the web configurator to read/write the encoder
# actions over USB (WebHID).
RAW_ENABLE = yes

# Required so the encoder can emit consumer/media keys (volume, mute, play...).
EXTRAKEY_ENABLE = yes

# On the atmega32u4 the keyboard, mouse, consumer and Raw HID reports share a
# single USB endpoint. Enabling the mouse HID collection and/or NKRO changes the
# report layout and causes consumer (volume/media) reports to be misrouted or
# ignored in some applications. A known-good Sofle VIA build disables both, so
# we match it here.
MOUSEKEY_ENABLE = no
NKRO_ENABLE = no
