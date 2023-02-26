import blocksPopup from '../templates/textEditorBlocksPopup.hbs'
import { language } from '@/utils/dictionary'
import dictionary from '@/utils/dictionary'

export class EditorBlocks {
    private blocks: (() => DocumentFragment)[]
    private dictionary: Record<string, language>
    private readonly lang: 'ru' | 'en'
    constructor(lang: 'ru' | 'en') {
        this.dictionary = dictionary.EditorPage
        this.lang = lang
        this.blocks = [
            this.getHeader,
            this.getQuotes,
            this.getImage,
            this.getDelimiter,
            this.getNumberList,
            this.getUnorderedList,
        ]
    }

    getListOfElements() {
        const template = document.createElement('div')
        this.blocks.forEach((el) => {
            const content = el.call(this)
            template.append(content)
        })
        return template.children
    }

    getHeader() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'headerElementPopup',
            svg: require('../assets/icons/header-svg.svg'),
            blockName: this.dictionary.PopupNameHeading[this.lang],
            type: 'heading',
        })
        return template.content
    }

    getQuotes() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'quoterElementPopup',
            svg: require('../assets/icons/quote-svg.svg'),
            blockName: this.dictionary.PopupNameQuote[this.lang],
            type: 'quote',
        })
        return template.content
    }

    getImage() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'imageElementPopup',
            svg: require('../assets/icons/image-icon.svg'),
            blockName: this.dictionary.PopupNameImage[this.lang],
            type: 'image',
        })
        return template.content
    }

    getDelimiter() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'delimiterElementPopup',
            svg: require('../assets/icons/delimiter.svg'),
            blockName: this.dictionary.Delimiter[this.lang],
            type: 'delimiter',
        })
        return template.content
    }

    getNumberList() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'numberListElementPopup',
            svg: require('../assets/icons/numbered-list.svg'),
            blockName: this.dictionary.NumberedList[this.lang],
            type: 'numberList',
        })
        return template.content
    }

    getUnorderedList() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'unorderedListElementPopup',
            svg: require('../assets/icons/unordered-list.svg'),
            blockName: this.dictionary.NumberedList[this.lang],
            type: 'unorderedList',
        })
        return template.content
    }
}
