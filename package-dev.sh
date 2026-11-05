#!/usr/bin/env sh
# Builds and verifies the private test extension from vss-extension-dev.json.
# The dev task gets its own id and name (task-overrides.dev.json) so it installs next to the production one.
exec bash "$(dirname "$0")/package-extension.sh" vss-extension-dev.json task-overrides.dev.json
