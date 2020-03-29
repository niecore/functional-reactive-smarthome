const Kefir = require('kefir');
const jestPlugin = require('jest-kefir').default;

const {extensions, ...helpers} = jestPlugin(Kefir);
expect.extend(extensions);
global.KTU = helpers;
