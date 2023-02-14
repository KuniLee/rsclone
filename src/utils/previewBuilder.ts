import { Article } from 'types/types'
import articleTemplate from '@/templates/atricle.hbs'

export class Preview {
    private el: DocumentFragment | undefined

    constructor(public article: Article) {}

    render() {
        const template = document.createElement('template')
        template.innerHTML = articleTemplate(this.article)
        this.el = template.content
        return this.el
    }
}
