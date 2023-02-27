import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { rootModel, URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'

type PageModelEventsName = 'CHANGE_PAGE' | '404' | 'USER_SIGNED_UP' | 'USER_SIGNED_IN' | 'EMAIL_EXIST' | 'WRONG_DATA'
export type AuthModelInstance = InstanceType<typeof AuthModel>

export class AuthModel extends EventEmitter {
    public path: Array<string> = []
    public lang: rootModel['lang'] = 'ru'
    public search: ParsedQuery = {}

    constructor() {
        super()
        this.loadSettings()
    }

    private loadSettings() {
        const lang = localStorage.lang
        if (['ru', 'en'].includes(lang)) this.lang = lang
        else localStorage.lang = this.lang
    }
    on<T>(event: PageModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: PageModelEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    changePage({ path, search }: URLParams) {
        this.path = path
        this.search = search
        if (!Object.values(Paths).includes(path.at(0) as Paths)) return this.goTo404()
        switch (this.path[0]) {
            case Paths.Root:
                this.emit('USER_SIGNED_IN')
                break
            case Paths.Auth:
                this.goToAuth()
                break
            case Paths.Registration: {
                this.goToRegistration()
                break
            }
            default:
                this.goTo404()
        }
    }

    private goToAuth() {
        if (this.path[0] === Paths.Auth) {
            this.emit('CHANGE_PAGE', this.search)
        }
    }

    private goToRegistration() {
        if (this.path[0] === Paths.Registration) {
            this.emit('CHANGE_PAGE')
        }
    }

    private goTo404() {
        console.log('страница 404')
        this.emit('404')
    }
}
