import Handlebars from 'handlebars/runtime'

Handlebars.registerHelper('eq', (a, b) => a == b)
Handlebars.registerHelper('sub', (a, b) => a - b)

export default Handlebars
