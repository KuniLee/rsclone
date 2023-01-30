declare module '*.html' {
    const content: string
    export default content
}
declare module '*.hbs' {
    const content: (Object) => string
    export default content
}
