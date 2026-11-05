#!/usr/bin/env sh
# Builds and verifies the public release from vss-extension.json.
exec bash "$(dirname "$0")/package-extension.sh" vss-extension.json
