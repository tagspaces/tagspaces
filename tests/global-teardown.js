import { removeExtConfig } from './e2e/hook';

module.exports = async function() {
  await removeExtConfig();
};
