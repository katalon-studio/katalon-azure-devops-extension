# Azure Devops Extension


## How to build package to update Azure Devops

**Note: UPDATE VERSION BEFORE BUILD PACKAGE, see in `vss-extension.json`**

From project root, execute: 
```bash
tfx extension create --manifest-globs vss-extension.json
```

or execute `package.bat`.


## Install babel

```bash
npm install --save-dev @babel/core @babel/cli
```

## Install npm

```bash
npm install
```

## Create GUID
For id in Extensions Azure Devops, click [here](https://www.guidgen.com/).

## Source code
From [Katalon Cli](https://github.com/kms-technology/katalon-cli)

**DON'T COPY `logger.js` FROM KATALON-CLI.**