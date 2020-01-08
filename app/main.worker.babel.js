const register = require('@babel/register').default;

register({
  extensions: ['.ts', '.tsx', '.js', '.json']
});

require('./splash-worker.ts');
