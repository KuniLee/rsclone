/* eslint @typescript-eslint/no-var-requires: "off" */
const Handlebars = require('handlebars/runtime')

Handlebars.registerHelper('eq', (a, b) => a == b)
Handlebars.registerHelper('sub', (a, b) => a - b)

module.exports = Handlebars
