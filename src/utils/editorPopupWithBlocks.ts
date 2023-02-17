import blocksPopup from '../templates/textEditorBlocksPopup.hbs'

type editorPopupEvents = 'ITEM_INSERT'

export class EditorBlocks {
    private blocks: (() => DocumentFragment)[]
    constructor() {
        this.blocks = [this.getHeader, this.getQuotes, this.getImage]
    }

    getListOfElements() {
        const template = document.createElement('div')
        this.blocks.forEach((el) => {
            const content = el()
            template.append(content)
        })
        console.log(template.children)
        return template.children
    }

    getHeader() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'headerElementPopup',
            svg: require('../assets/icons/header-svg.svg'),
            blockName: 'Заголовок',
            type: 'heading',
        })
        return template.content
    }

    getQuotes() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'quoterElementPopup',
            svg: require('../assets/icons/quote-svg.svg'),
            blockName: 'Цитата',
            type: 'quote',
        })
        return template.content
    }

    getImage() {
        const template = document.createElement('template')
        template.innerHTML = blocksPopup({
            class: 'imageElementPopup',
            svg: require('../assets/icons/image-icon.svg'),
            blockName: 'Изображение',
            type: 'image',
        })
        return template.content
    }
}
