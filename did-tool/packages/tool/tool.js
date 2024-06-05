import PluginInterface from './plugin-interface.js';

class Tool {
  constructor() {
    this.plugins = [];
  }

  registerPlugin(plugin) {
    if (!(plugin instanceof PluginInterface)) {
      throw new Error("Invalid plugin. Must be an instance of PluginInterface");
    }

    this.plugins.push(plugin);
  }

  executePluginMethods(plugin, methodName, ...params) {
    if (this.plugins.includes(plugin)) {
      const result =  plugin.executeMethod(methodName, ...params);
      return result
    } else {
      console.error(`plugin not registerd`);
    }
  }
}

export default Tool;