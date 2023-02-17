import dictionary, { getWords } from '@/utils/dictionary'
import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import { Preview } from '@/utils/previewBuilder'
import asideTemplate from '@/templates/aside.hbs'

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
        const mainPageWrapperEl = document.createElement('div')
        mainPageWrapperEl.className = 'flex gap-4'
        const feedEl = document.createElement('div')
        feedEl.className = 'w-full flex flex-col gap-4 feed'
        const asideEl = this.createAside()
        mainPageWrapperEl.append(feedEl, asideEl)
        this.mainPageContainer.replaceChildren(mainPageWrapperEl)
    }

    private createAside() {
        const asideEl = document.createElement('aside')
        asideEl.className = 'hidden lg:block basis-80 bg-color-light shrink-0 h-fit'
        asideEl.innerHTML = asideTemplate({
            words: getWords(dictionary.Aside, this.pageModel.lang),
        })
        return asideEl
    }

    private setArticles() {
        const articles = this.feedModel.articles
        this.articles = articles.map((el) => new Preview(el))
        this.articles.forEach((el) => el.on('GO_TO', (path) => this.emit('GO_TO', path)))
    }

    renderArticles() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = ''
        if (this.articles.length === 0) feedEl.innerHTML = 'no articles'
        else feedEl.append(...this.articles.map((el) => el.render()))
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = preloader
    }
}
