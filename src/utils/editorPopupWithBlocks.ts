import { PageModel } from '@/components/mainPage/model/PageModel'
import blocksPopup from '../templates/textEditorBlocksPopup.hbs'
import headerPopup from '../templates/textEditorHeaderTemplate.hbs'
import popupSettings from '../templates/popupSettings.hbs'
import dictionary from '@/utils/dictionary'
import EventEmitter from 'events'

type editorPopupEvents = 'ITEM_INSERT'

export class EditorBlocks extends EventEmitter {
    private blocks: (() => DocumentFragment)[]
    constructor() {
        super()
        this.blocks = [this.getHeader]
        this.getHeader()
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

    emit<T>(event: editorPopupEvents, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: editorPopupEvents, callback: (arg: T) => void) {
        return super.on(event, callback)
    }
}
