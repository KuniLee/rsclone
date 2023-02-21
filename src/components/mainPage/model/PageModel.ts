import EventEmitter from 'events'
import { Flows, Paths, Sandbox, SettingsPaths } from 'types/enums'
import { rootModel, URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'
import { UserData } from 'types/types'

type PageModelEventsName = 'CHANGE_PAGE' | '404' | 'AUTH_LOADED'
export type PageModelInstance = InstanceType<typeof PageModel>

export class PageModel extends EventEmitter {
    public path: Array<string> = []
    public lang: rootModel['lang'] = 'ru'
    public search: ParsedQuery = {}
    private _user: UserData | null = null

    constructor() {
        super()
        this.loadSettings()
    }

    get user() {
        return JSON.parse(JSON.stringify(this._user))
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
            case Paths.All:
            case Paths.Flows:
                this.goToFlows()
                break
            case Paths.Sandbox:
                this.goToSandbox()
                break
            case Paths.Auth:
                this.goToAuth()
                break
            case Paths.Post:
                this.emit('CHANGE_PAGE')
                break
            case Paths.Settings:
                if (Object.values(SettingsPaths).includes(this.path[1] as SettingsPaths)) this.emit('CHANGE_PAGE')
                else this.goTo404()
                break
            case Paths.UsersPage:
                this.goToProfile()
                break
            default:
                this.goTo404()
        }
    }

    private goToFlows() {
        if (this.path.length === 1 && this.path[0] === Paths.All) this.emit('CHANGE_PAGE')
        else if (this.path.length === 2 && this.path[0] === Paths.All && /\/page\d+/.test(this.path[1]))
            this.emit('CHANGE_PAGE')
        else if (this.path.length === 2 && Object.values(Flows).includes(this.path[1] as Flows)) {
            if (this.path[1] === Paths.All) {
                this.path = [Paths.All]
                console.log(`страница all`)
            }
            this.emit('CHANGE_PAGE')
        } else if (
            this.path.length === 3 &&
            this.path[0] === Paths.Flows &&
            Object.values(Flows).includes(this.path[1] as Flows) &&
            /\/page\d+/.test(this.path[2])
        )
            this.emit('CHANGE_PAGE')
        else this.goTo404()
    }

    private goToSandbox() {
        if (Object.values(Sandbox).includes(this.path[1] as Sandbox)) {
            console.log(`страница sandbox${this.path[1]}`)
            this.emit('CHANGE_PAGE')
        } else this.goTo404()
    }

    public goTo404() {
        console.log('страница 404')
        this.emit('404')
    }

    private goToAuth() {
        if (this.path.length === 1 && this.path[0] === Paths.Auth) this.emit('CHANGE_PAGE')
        else this.goTo404()
    }

    private goToProfile() {
        if (this.path.length === 2 && this.path[0] === Paths.UsersPage) this.emit('CHANGE_PAGE')
        else this.goTo404()
    }

    changeAuth(userData?: UserData) {
        if (userData) {
            this._user = userData
        } else {
            this._user = null
        }
        this.emit('AUTH_LOADED')
    }
}
