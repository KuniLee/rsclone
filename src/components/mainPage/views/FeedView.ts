import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import { Preview } from '@/utils/previewBuilder'

type FeedViewEventsName = 'LOAD_ARTICLES' | 'DOWNLOAD_IMAGE' | 'UPLOAD_IMAGE' | 'GO_TO'

export type FeedViewInstance = InstanceType<typeof FeedView>

export class FeedView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private articles: Preview[] = []

    constructor(models: { pageModel: PageModelInstance; feedModel: FeedModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.pageModel.on('CHANGE_PAGE', () => {
            const path = this.pageModel.path
            if (Object.values(Flows).includes(path[1] as Flows) || path[0] === Paths.All) {
                this.renderPage()
                this.showPreloader()
                this.emit('LOAD_ARTICLES', path[1])
            }
        })
        this.feedModel.on('LOADED', () => {
            this.setArticles()
            this.renderArticles()
        })
    }

    emit<T>(event: FeedViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: FeedViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = `<div class="container mx-auto flex gap-4">
<div class="w-full flex flex-col gap-4 feed"></div><aside class="hidden lg:block min-w-[300px] bg-color-light">Асайд</aside>
</div>`
    }

    private setArticles() {
        const articles = this.feedModel.articles
        this.articles = articles.map((el) => new Preview(el))
        this.articles.forEach((el) => el.on('GO_TO', (path) => this.emit('GO_TO', path)))
    }

    renderArticles() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = ''
        feedEl.append(...this.articles.map((el) => el.render()))
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = preloader
    }
}
