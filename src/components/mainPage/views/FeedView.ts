import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
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
            const path = this.pageModel.path
            if (Object.values(Flows).includes(path[1] as Flows) || path[0] === Paths.All || path[0] === Paths.Feed) {
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
        this.mainPageContainer.innerText = 'Загружается лента...'
    }

    private renderArticles() {
        this.mainPageContainer.innerHTML = ''
        this.mainPageContainer.innerText = `Страница ${this.pageModel.path.join('')}:
        статьи: ${JSON.stringify(this.feedModel.articles)}`
    }
}
