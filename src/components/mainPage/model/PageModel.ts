import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'

type PageModelEventsName = 'CHANGE_PAGE' | '404'
export type PageModelInstance = InstanceType<typeof PageModel>

export class PageModel extends EventEmitter {
    public path: Array<string> = []
    public lang: 'ru' | 'en' = 'ru'

    constructor() {
        super()
    }

    on<T>(event: PageModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: PageModelEventsName) {
        return super.emit(event)
    }

    changePage(arg: Array<string>) {
        this.path = arg
        if (!Object.values(Paths).includes(arg.at(0) as Paths)) return this.goTo404()
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
            case Paths.Feed:
                this.goToFeed()
                break
            case Paths.Auth:
                this.goToAuth()
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
        this.emit('CHANGE_PAGE')
    }
}
