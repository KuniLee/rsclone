import EventEmitter from 'events'
import { Flows, Paths, Sandbox, SettingsPaths } from 'types/enums'
import { rootModel, URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'
import { UserData } from 'types/types'

type PageModelEventsName = 'CHANGE_PAGE' | '404' | 'SIGN_IN' | 'SIGN_OUT'
export type PageModelInstance = InstanceType<typeof PageModel>

export class PageModel extends EventEmitter {
    public path: Array<string> = []
    public lang: rootModel['lang'] = 'ru'
    public search: ParsedQuery = {}
    public user: UserData | null = null

    constructor() {
        super()
        this.loadSettings()
    }

    private loadSettings() {
        const lang = localStorage.lang
        if (['ru', 'en'].includes(lang)) this.lang = lang
    }

    on<T>(event: PageModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: PageModelEventsName) {
        return super.emit(event)
    }

    changePage({ path, search }: URLParams) {
        this.path = path
        this.search = search
        if (!Object.values(Paths).includes(path.at(0) as Paths)) return this.goTo404()
        switch (this.path[0]) {
            case Paths.Root:
                this.path = [Paths.All]
                this.goToFlows()
                break
            case Paths.News:
                this.goToNews()
                break
            case Paths.All:
                this.goToFlows()
                break
            case Paths.Flows:
                this.goToFlows()
                break
            case Paths.Sandbox:
                this.goToSandbox()
                break
            case Paths.Feed:
                this.goToFeed()
                break
            case Paths.Auth:
                this.goToAuth()
                break
            case Paths.Search:
                this.goToSearch()
                break
            case Paths.Settings:
                if (Object.values(SettingsPaths).includes(this.path[1] as SettingsPaths)) this.emit('CHANGE_PAGE')
                else this.goTo404()
                break
            default:
                this.goTo404()
        }
    }

    private goToFlows() {
        if (this.path[0] === Paths.All) {
            console.log(`страница all`)
            this.emit('CHANGE_PAGE')
            return
        }
        if (Object.values(Flows).includes(this.path[1] as Flows)) {
            if (this.path[1] === Paths.All) {
                this.path = [Paths.All]
                console.log(`страница all`)
                this.emit('CHANGE_PAGE')
                return
            }
            console.log(`страница flows${this.path[1]}`)
            this.emit('CHANGE_PAGE')
        } else this.goTo404()
    }

    private goToSandbox() {
        if (Object.values(Sandbox).includes(this.path[1] as Sandbox)) {
            console.log(`страница sandbox${this.path[1]}`)
            this.emit('CHANGE_PAGE')
        } else this.goTo404()
    }

    private goTo404() {
        console.log('страница 404')
        this.emit('404')
    }

    private goToNews() {
        console.log('страница news')
        this.emit('CHANGE_PAGE')
    }

    private goToFeed() {
        if (this.path.length === 1) this.emit('CHANGE_PAGE')
        else if (this.path.length === 2 && this.path[1] === '/settings') console.log('настройки')
        else this.goTo404()
    }

    private goToAuth() {
        if (this.path.length === 1 && this.path[0] === Paths.Auth) this.emit('CHANGE_PAGE')
        else this.goTo404()
    }

    private goToSearch() {
        console.log('страница search')
        this.emit('CHANGE_PAGE')
    }

    changeAuth(userData?: UserData) {
        if (userData) {
            this.user = userData
            console.log('in')
            this.emit('SIGN_IN')
        } else {
            this.user = null
            console.log('out')
            this.emit('SIGN_OUT')
        }
    }
}
