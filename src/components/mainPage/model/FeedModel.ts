import { CommentInfo } from '@/types/types'
import EventEmitter from 'events'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { Flows } from 'types/enums'
import { Article } from 'types/interfaces'

type FeedModelEventsName = 'LOADED' | 'POST_LOADED' | 'COMMENTS_LOADED' | 'UPDATE_COMMENTS'
export type FeedModelInstance = InstanceType<typeof FeedModel>

export class FeedModel extends EventEmitter {
    public articles: Array<Article> = []
    public article: Article | undefined
    private _latestArticle: QueryDocumentSnapshot | null = null
    private _flow: Flows | undefined
    private _comments: Array<CommentInfo> = []
    public noMoreArticles = false

    constructor() {
        super()
    }

    set setFlow(flow: Flows) {
        if (this._flow !== flow) {
            this.noMoreArticles = false
            this.articles = []
            this._flow = flow
        }
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
        this.articles.push(...articles)
        if (articles.length < 5) this.noMoreArticles = true
        this.emit('LOADED')
    }

    setArticle(article: Article) {
        this.article = article
        this.emit('POST_LOADED')
    }

    setComments(comments: Array<CommentInfo>) {
        this._comments = comments
        this.emit('COMMENTS_LOADED')
    }

    getComments() {
        return this._comments
    }
}
