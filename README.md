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

Generate id for Extensions Azure Devops, click [here](https://www.guidgen.com/).

## Source code

From [Katalon Cli](https://github.com/kms-technology/katalon-cli)

**DON'T COPY `logger.js` FROM KATALON-CLI.**

## Upgrade NodeJS version

- Check the available Node versions from here: https://github.com/microsoft/azure-pipelines-task-lib/blob/master/tasks.schema.json
- Grab the wanted version and update it to `katalonTask/task.json`

## Testing

You can test the extension first before publishing it like this:

- Prepare a private package
  - Change the `"public"` field to `false` in the `"vss-extension.json"` file
  - (Optional) Update extension name, publisher name to avoid confusion with the official package
  - Repackage the project
- Go to Microsoft Market Place
- Click "Publish Entensions"
- Follow the instructions to upload "\*.vsix" file and publish the test package
- Share the extension with your personal organization
  - Go to extension management page
  - Click "More actions" button near the extension name
  - Select "Share/Unshare"
  - Add your personal organization
- Install the test extension to your organization
- Create a pipeline & self-hosted agent to start testing (https://www.youtube.com/watch?v=_sBDUsYvq1k&ab_channel=ErrorFarm)
