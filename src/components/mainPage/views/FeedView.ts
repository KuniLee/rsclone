import dictionary, { getWords } from '@/utils/dictionary'
import EventEmitter from 'events'
import { Flows } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import preloaderSmall from '@/templates/preloaderSmall.html'
import { Preview } from '@/utils/previewBuilder'
import asideTemplate from '@/templates/aside.hbs'
import loadBtn from '@/templates/loadMoreBtn.hbs'

type FeedViewEventsName = 'LOAD_ARTICLES' | 'DOWNLOAD_IMAGE' | 'UPLOAD_IMAGE' | 'GO_TO' | 'LOAD_MORE'

export type FeedViewInstance = InstanceType<typeof FeedView>

export class FeedView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private articles: Preview[] = []
    private readonly moreBtn: HTMLButtonElement

    constructor(models: { pageModel: PageModelInstance; feedModel: FeedModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.moreBtn = this.renderMoreBtn()
        this.pageModel.on<Flows>('SHOW_FEED', (flow) => {
            this.renderPage()
            this.showPreloader()
            if (this.feedModel.currentFlow === flow) this.renderArticles()
            else {
                setTimeout(() => {
                    window.scrollTo(0, 0)
                })
                this.emit<Flows>('LOAD_ARTICLES', flow)
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
        const template = document.createElement('template')
        template.innerHTML = asideTemplate({
            words: getWords(dictionary.Aside, this.pageModel.lang),
        })
        return template.content
    }

    private setArticles() {
        this.articles = this.feedModel.articles.map((el) => new Preview(el))
        this.articles.forEach((el) => el.on('GO_TO', (path) => this.emit('GO_TO', path)))
    }

    renderArticles() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = ''
        if (this.articles.length === 0) feedEl.innerHTML = 'no articles'
        else feedEl.append(...this.articles.map((el) => el.render()))
        this.updateMoreBtn()
    }

    renderMoreBtn() {
        const template = document.createElement('template')
        template.innerHTML = loadBtn({ words: getWords(dictionary.buttons, this.pageModel.lang) })
        const btn = template.content.querySelector('button') as HTMLButtonElement
        btn.addEventListener('click', () => {
            const parent = btn.parentElement as HTMLElement
            btn.remove()
            parent.insertAdjacentHTML('beforeend', preloaderSmall)
            this.emit('LOAD_MORE')
        })
        return btn
    }

    updateMoreBtn() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        if (this.feedModel.noMoreArticles)
            feedEl.insertAdjacentHTML(
                'beforeend',
                `<span class="mx-auto text-sky-900">
${dictionary.PostPage.noMoreArticles[this.pageModel.lang]}<span>`
            )
        else feedEl.append(this.moreBtn)
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.feed') as HTMLDivElement
        feedEl.innerHTML = preloader
    }
}
