import EventEmitter from 'events'
import type { PageModel } from '../models/PageModel'
import { Paths } from 'types/enums'

type FeedViewEventsName = 'GOTO'

export type FeedViewInstance = InstanceType<typeof FeedView>

export class FeedView extends EventEmitter {
    private model: PageModel
    private mainPageContainer: HTMLElement

    constructor(model: PageModel) {
        super()
        this.model = model
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.model.on('CHANGE_PAGE', () => {
            if (this.model.path[0] === Paths.Feed) this.show()
        })
    }

    emit<T>(event: FeedViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: FeedViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private show() {
        this.mainPageContainer.innerText = 'Общая лента'
    }
}
