/* eslint @typescript-eslint/no-var-requires: "off" */
const Handlebars = require('handlebars/runtime')

Handlebars.registerHelper('eq', (a: string, b: string) => a == b)
module.exports = Handlebars
