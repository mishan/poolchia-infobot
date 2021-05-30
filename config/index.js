const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.safeLoad(fs.readFileSync('etc/config.yml', 'utf8'));

module.exports = config;
