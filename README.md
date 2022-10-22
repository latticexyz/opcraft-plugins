# OPCraft plugins

## Getting started
- Clone this repo
- Run `yarn && yarn start` at the root
- Open OPCraft (`opcraft.mud.dev`) and press `;` to open the plugin menu
- Paste `http://localhost:8000` in the input field, press `Add plugin registry`
- Tick the checkmark to load plugins from the registry

## Develop a plugin
- Add a new folder in `plugins` with your plugin code
- Restart the development server (see above) to index your new plugin
- Develop and test your plugin locally
- Open a PR to this repo to make the plugin available in the default plugin registry (`opcraft-plugins.mud.dev`)
