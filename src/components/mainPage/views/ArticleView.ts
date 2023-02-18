import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import postTemplate from '@/templates/post/post.hbs'
import dictionary, { getWords } from '@/utils/dictionary'
import aside from '@/templates/aside.hbs'

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
<div class="w-full flex flex-col gap-4 post"></div><aside class="hidden lg:block max-w-[300px] h-fit bg-color-light">${aside(
            {
                words: getWords(dictionary.Aside, this.pageModel.lang),
            }
        )}</aside>
</div>`
    }

    private render() {
        const feedEl = this.mainPageContainer?.querySelector('.post') as HTMLDivElement
        feedEl.innerHTML = postTemplate({
            article: this.feedModel.article,
            words: getWords(dictionary.PostPage, this.pageModel.lang),
        })
        feedEl.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit<string>('GO_TO', el.href)
            })
        })
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.post') as HTMLDivElement
        feedEl.innerHTML = preloader
        window.scrollTo(0, 0)
    }
}
