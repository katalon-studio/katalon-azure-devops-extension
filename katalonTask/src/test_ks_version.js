"use strict";

const ks = require('./agent/katalon-studio');

function testResolveVersion(version) {
  console.log(`\n--- Testing version: ${version} ---`);
  return ks.resolveVersion(version)
    .then(({ version: resolved, url }) => {
      console.log(`Resolved version : ${resolved}`);
      console.log(`Download URL     : ${url}`);
    })
    .catch((err) => {
      console.error(`[FAIL] Error: ${err}`);
    });
}


function testGetKsLocation(version) {
  console.log(`\n--- Testing version: ${version} ---`);
  return ks.getKsLocation(version, '')
    .then(({ ksLocationParentDir }) => {
      console.log(`[PASS] Resolved location: ${ksLocationParentDir}`);

    })
    .catch((err) => {
      console.error(`[FAIL] Error: ${err}`);
    });
}

testResolveVersion('latest')
    .then(() => testResolveVersion('10-latest'))
    .then(() => testResolveVersion('11-latest'))
    .then(() => testResolveVersion('10.4.3'))
    .then(() => testGetKsLocation('11-latest'))
