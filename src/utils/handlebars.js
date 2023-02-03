/* eslint @typescript-eslint/no-var-requires: "off" */
const Handlebars = require('handlebars/runtime')

Handlebars.registerHelper('eq', (a, b) => a == b)
module.exports = Handlebars
