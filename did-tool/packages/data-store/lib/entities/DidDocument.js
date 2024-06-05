
class DidDocument {
    constructor(data) {
        this['@context'] = data['@context'] || [];
        this.id = data['id'] || '';
        this.verificationMethod = data['verificationMethod'] || [];
        this.authentication = data['authentication'] || [];
        this.extension = data['extension'] || {};
        this.service = data['service'] || [];
        this.created = data['created'] || '';
        this.updated = data['updated'] || '';
        this.proof = data['proof'] || {};
      }

    toEntity() {
        return {
          id: this.id,
          context: JSON.stringify(this['@context']),
          verificationMethod: JSON.stringify(this.verificationMethod),
          authentication: JSON.stringify(this.authentication),
          extension: JSON.stringify(this.extension),
          service: JSON.stringify(this.service),
          created: this.created,
          updated: this.updated,
          proof: JSON.stringify(this.proof) ,
        };
    }

    static fromEntity(entity) {
        const didDocument = new DidDocument({
            '@context': JSON.parse(entity.context),
            id: entity.id,
            verificationMethod: JSON.parse(entity.verificationMethod),
            authentication: JSON.parse(entity.authentication),
            extension: JSON.parse(entity.extension),
            service: JSON.parse(entity.service),
            created: entity.created,
            updated: entity.updated,
            proof: JSON.parse(entity.proof) ,
        });
        return didDocument;
    }
  }

  // export { DidDocument };
    export default DidDocument;
  