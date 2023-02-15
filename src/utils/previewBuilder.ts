import { Article } from 'types/types'
import articleTemplate from '@/templates/atricle.hbs'
import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { URLParams } from 'types/interfaces'
import { getTimeAgo } from '@/utils/getTimeAgo'

type PreviewEventsName = 'GO_TO' | 'DOWNLOAD_IMAGE' | 'UPLOAD_IMAGE'

export class Preview extends EventEmitter {
    private el: DocumentFragment | undefined

    constructor(public article: Article) {
        super()
    }

    render() {
        const template = document.createElement('template')
        template.innerHTML = articleTemplate({
            time: getTimeAgo(this.article.createdAt.toDate(), localStorage.lang),
            article: this.article,
        })
        this.el = template.content
        this.addListeners()
        return this.el
    }

    private addListeners() {
        const usersLinks = this.el?.querySelectorAll('.article__user') as NodeList
        usersLinks.forEach((el) =>
            el.addEventListener('click', () => {
                this.emit<Pick<URLParams, 'path'>>('GO_TO', {
                    path: [Paths.UsersPage, `/${this.article.user?.displayName}`],
                })
            })
        )
        const articleLinks = this.el?.querySelectorAll('.article__link') as NodeList
        articleLinks.forEach((el) =>
            el.addEventListener('click', () => {
                this.emit<Pick<URLParams, 'path'>>('GO_TO', {
                    path: [Paths.Post, `/${this.article.id}`],
                })
            })
        )
    }

    emit<T>(event: PreviewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: PreviewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }
}