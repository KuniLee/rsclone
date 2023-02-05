import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'

type FeedViewEventsName = 'LOAD_ARTICLES'

export type FeedViewInstance = InstanceType<typeof FeedView>

export class FeedView extends EventEmitter {
    private mainPageContainer: HTMLElement
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance

    constructor(models: { pageModel: PageModelInstance; feedModel: FeedModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.pageModel.on('CHANGE_PAGE', () => {
            if (this.pageModel.path[0] === Paths.All) {
                this.showPreloader()
                this.emit('LOAD_ARTICLES')
            }
        })
        this.feedModel.on('LOADED', () => {
            this.renderArticles()
        })
    }

    emit<T>(event: FeedViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: FeedViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private showPreloader() {
        this.mainPageContainer.innerText = 'Загружается общая лента...'
    }

    private renderArticles() {
        this.mainPageContainer.innerText = JSON.stringify(this.feedModel.articles)
    }
}
