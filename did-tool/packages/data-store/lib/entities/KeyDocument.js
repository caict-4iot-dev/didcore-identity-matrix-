
  class KeyDocument {
    constructor(data) {
        this.id = data['id'] || '';
        this.type = data['type'] || '';
        this.controller = data['controller'] || '';
        this.publicKeyMultibase = data['publicKeyMultibase'] || '';
        this.privateKeyMultibase = data['privateKeyMultibase'] || '';
        this.revoked = data['revoked'] || '';
      }
  }

  // export { KeyDocument };
  module.exports = { KeyDocument };
  