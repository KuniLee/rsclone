import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import { Paths } from 'types/enums'

type FlowViewEventsName = 'GOTO'

export type FlowViewInstance = InstanceType<typeof FlowView>

export class FlowView extends EventEmitter {
    private model: PageModel
    private mainPageContainer: HTMLElement

    constructor(model: PageModel) {
        super()
        this.model = model
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.model.on('CHANGE_PAGE', () => {
            if (this.model.path[0] === Paths.Flows || this.model.path[0] === Paths.All) this.showFlow()
        })
    }

    emit<T>(event: FlowViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: FlowViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private showFlow() {
        this.mainPageContainer.innerText = 'Поток' + this.model.path[1]
    }

    private showAllFlows() {
        this.mainPageContainer.innerText = 'Все Потоки'
    }
}
