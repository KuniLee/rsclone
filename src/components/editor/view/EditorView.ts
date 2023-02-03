import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import headerTemplate from '@/templates/header.hbs'
import { Flows, Paths, Sandbox } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'

type ItemViewEventsName = 'GOTO'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
        this.pageModel.on('CHANGE_PAGE', () => {
            if (this.pageModel.path[0] === Paths.Sandbox && this.pageModel.path[1] === Sandbox.New) {
                this.buildPage()
            }
        })
    }

    private buildPage() {
        const main = document.querySelector('main')
        if (main) {
            main.textContent = 'test'
        }
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }
}
