"use strict";

const ks = require('./agent/katalon-studio');

function testGetKsLocation(label, version) {
  console.log(`\n--- Testing version: ${label} ---`);
  return ks.getKsLocation(version, '')
    .then(({ ksLocationParentDir }) => {
      console.log(`[PASS] Resolved location: ${ksLocationParentDir}`);
    })
    .catch((err) => {
      console.error(`[FAIL] Error: ${err}`);
    });
}

testGetKsLocation('latest', 'latest')
// testGetKsLocation('10.4.3', '10.4.3')
