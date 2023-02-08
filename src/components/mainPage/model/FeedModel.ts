import EventEmitter from 'events'
import { Article } from 'types/types'

type FeedModelEventsName = 'LOADED' | 'IMAGE_LOADED'
export type FeedModelInstance = InstanceType<typeof FeedModel>

export class FeedModel extends EventEmitter {
    public articles: Array<Article> = []
    image = ''

    constructor() {
        super()
    }

    on<T>(event: FeedModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: FeedModelEventsName) {
        return super.emit(event)
    }

    setArticles(articles: Array<Article>) {
        this.articles = articles
        this.emit('LOADED')
    }

    setImage(url: string) {
        this.image = url
        this.emit('IMAGE_LOADED')
    }
}
