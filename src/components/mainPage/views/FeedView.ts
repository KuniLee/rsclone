import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'

type FeedViewEventsName = 'LOAD_ARTICLES' | 'DOWNLOAD_IMAGE' | 'UPLOAD_IMAGE'

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
        this.feedModel.on('IMAGE_LOADED', () => {
            this.updateImage()
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

    private renderLoaderImage() {
        this.mainPageContainer.innerHTML = ''
        const template = document.createElement('div') as HTMLDivElement
        template.innerHTML = `
<input type="file" class="hidden" accept="image/*,.png,.jpg,.gif,.web," id="file">
<button class="bg-red-400 p-2 rounded">Загрузить фото</button>
<img class="max-h-20 border border-2 rounded-xl border-emerald-800" alt="avatar" src="${require('@/assets/icons/ico-user.svg')}">`
        const file = template.querySelector('#file') as HTMLInputElement
        file.addEventListener('change', () => {
            if (file.files?.length === 1) {
                if (file.files[0].size < 1024 * 1024) this.emit<File>('UPLOAD_IMAGE', file.files[0])
            }
        })
        template.querySelector('button')?.addEventListener('click', () => {
            file.click()
        })
        this.mainPageContainer.append(template)
    }

    private renderArticles() {
        this.mainPageContainer.innerHTML = ''
        this.mainPageContainer.innerText = `Страница ${this.pageModel.path.join('')}:
        статьи: ${JSON.stringify(this.feedModel.articles)}`
    }

    private updateImage() {
        this.mainPageContainer.querySelector('img')?.setAttribute('src', this.feedModel.image)
    }
}
