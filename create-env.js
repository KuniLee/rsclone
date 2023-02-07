/* eslint @typescript-eslint/no-var-requires: "off" */
const fs = require('fs')
fs.writeFileSync(
    './.env',
    `FIREBASE_API_KEY=${process.env.FIREBASE_API_KEY}\n
    FIREBASE_AUTH_DOMAIN=${process.env.FIREBASE_AUTH_DOMAIN}\n
    FIREBASE_DATABASE_URL=${process.env.FIREBASE_DATABASE_URL}\n
    FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID}\n
    FIREBASE_STORAGE_BUCKET=${process.env.FIREBASE_STORAGE_BUCKET}\n
    FIREBASE_MESSAGING_SENDER_ID=${process.env.FIREBASE_MESSAGING_SENDER_ID}\n
    FIREBASE_API_ID=${process.env.FIREBASE_API_ID}\n
    KAPTCHA_KEY=${process.env.KAPTCHA_KEY}\n
    `
)
