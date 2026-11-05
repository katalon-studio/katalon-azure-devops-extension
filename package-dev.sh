#!/usr/bin/env sh
# Builds and verifies the private test extension from vss-extension-dev.json.
exec bash "$(dirname "$0")/package-extension.sh" vss-extension-dev.json
