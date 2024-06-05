class PluginInterface {
  constructor() {
    if (this.constructor === PluginInterface) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

   executeMethod(methodName, ...params) {
    if (typeof this[methodName] === 'function') {
      return this[methodName](...params);
    } else if (typeof this.constructor[methodName] === 'function') {
        return this.constructor[methodName](...params);
    } else {
        console.error(`Method ${methodName} not implemented by the plugin`);
    }
  }
}

export default PluginInterface;