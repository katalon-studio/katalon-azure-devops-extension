cd katalonTask 
npm prune --omit=dev # Equivalent to deprecated 'npm prune --production'

rm -rf build

npx babel src --out-dir build
cd ..
tfx extension create --manifest-globs vss-extension-dev.json

# Expected output:
# == Completed operation: create extension ===
#  - VSIX: /Users/nga.pham/Documents/workspace/katalon-azure-devops-extension/katalon-llc.katalon-dev-1.3.0.vsix
#  - Extension ID: katalon-dev
#  - Extension Version: 1.3.0
#  - Publisher: katalon-llc

# Remove arm64 in xml file.
# Need to update `EXTENSION_FILENAME` accordingly 
export EXTENSION_FILENAME=katalon-llc.katalon-dev-1.3.0.vsix
unzip -p $EXTENSION_FILENAME '\[Content_Types\].xml' | grep -v 'arm64' > '[Content_Types].xml'
zip $EXTENSION_FILENAME '[Content_Types].xml'

# Expected output:
# updating: [Content_Types].xml (deflated 92%)

