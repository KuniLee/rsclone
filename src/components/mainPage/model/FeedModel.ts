import EventEmitter from 'events'
import { Article } from 'types/types'

import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { Flows } from 'types/enums'

type FeedModelEventsName = 'LOADED' | 'IMAGE_LOADED'
export type FeedModelInstance = InstanceType<typeof FeedModel>

export class FeedModel extends EventEmitter {
    public articles: Array<Article> = []
    private _latestArticle: QueryDocumentSnapshot | null = null
    private _flow: Flows | undefined

    constructor() {
        super()
    }

    set setFlow(flow: Flows) {
        this._flow = flow
    }

    get currentFlow() {
        return this._flow
    }

    get latestArticle() {
        return this._latestArticle
    }
    set latestArticle(value) {
        this._latestArticle = value
    }

    on<T>(event: FeedModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: FeedModelEventsName) {
        return super.emit(event)
    }

    addArticles(articles: Array<Article>) {
        this.articles = articles
        this.emit('LOADED')
    }
}
