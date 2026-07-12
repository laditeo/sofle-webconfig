# Raw HID interface used by the web configurator to read/write the encoder
# actions over USB (WebHID).
RAW_ENABLE = yes

# Required so the encoder can emit consumer/media keys (volume, mute, play...)
# and mouse actions selected in the web app.
EXTRAKEY_ENABLE = yes
MOUSEKEY_ENABLE = yes
