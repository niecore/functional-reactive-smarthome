var options = {
    apiVersion: 'v1', // default
    endpoint: process.env.VAULT_URL,
    token: process.env.VAULT_TOKEN
};

// get new instance of the client
const vault = require("node-vault")(options);

async function getEasyControlCredentials () {
    try {
        const resp = await vault.read('frs/rrc2').then(v => v.data.rrc2);
        return resp
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    getEasyControlCredentials
};
