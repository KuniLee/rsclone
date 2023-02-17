import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'

type ArticleEventsName = 'LOAD_POST' | 'GO_TO'

export type ArticleViewInstance = InstanceType<typeof ArticleView>

export class ArticleView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance

    constructor(models: { pageModel: PageModelInstance; feedModel: FeedModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.pageModel.on('CHANGE_PAGE', () => {
            const path = this.pageModel.path
            if (path.length === 2 && path[0] === Paths.Post) {
                this.renderPage()
                this.showPreloader()
                this.emit('LOAD_POST', path[1].slice(1))
            }
        })
        this.feedModel.on('POST_LOADED', () => {
            this.render()
        })
    }

    emit<T>(event: ArticleEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ArticleEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = `<div class="flex gap-4">
<div class="w-full flex flex-col gap-4 post"></div><aside class="hidden lg:block min-w-[300px] bg-color-light">Асайд</aside>
</div>`
    }

    // private setArticles() {
    //     const articles = this.feedModel.articles
    //     this.articles = articles.map((el) => new Preview(el))
    //     this.articles.forEach((el) => el.on('GO_TO', (path) => this.emit('GO_TO', path)))
    // }

    private render() {
        const feedEl = this.mainPageContainer?.querySelector('.post') as HTMLDivElement
        feedEl.innerHTML = ''
        console.log(this.feedModel.article)
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.post') as HTMLDivElement
        feedEl.innerHTML = preloader
    }
}
