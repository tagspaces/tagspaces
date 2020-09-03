/*const {
  NODE_JEST = 'test_minio',
} = process.env;

const ENV = {
  NODE_JEST,
};

module.exports.ENV = ENV;*/

const NodeEnvironment = require('jest-environment-node');

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    // require('ts-node/register');
    this.global.process.env.NODE_JEST = 'test_minio';
    //this.global.setTimeout(3000)
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
