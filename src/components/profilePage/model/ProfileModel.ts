import { UserData } from 'types/types'
import EventEmitter from 'events'
import { Article } from 'types/interfaces'
export type ProfileModelInstance = InstanceType<typeof ProfileModel>

type ProfileModelEventsName = 'USER_INFO_LOADED' | 'ARTICLES_LOADED'

export class ProfileModel extends EventEmitter {
    private _userInfo: UserData | undefined
    private _articles: Array<Article> = []

    constructor() {
        super()
    }

    set userInfo(info: UserData | undefined) {
        this._userInfo = info
        this.emit('USER_INFO_LOADED')
    }

    get userInfo() {
        return this._userInfo
    }

    set articles(articles: Array<Article>) {
        this._articles = articles
        this.emit('ARTICLES_LOADED')
    }

    get articles() {
        return this._articles
    }
}
