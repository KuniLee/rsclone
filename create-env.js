/* eslint @typescript-eslint/no-var-requires: "off" */
const fs = require('fs')
fs.writeFileSync(
    './.env',
    `BACK4APP_APP_ID=${process.env.BACK4APP_APP_ID}\nBACK4APP_JS_KEY=${process.env.BACK4APP_JS_KEY}\n`
)
