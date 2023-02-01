import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'

type PageModelEventsName = 'CHANGE_PAGE' | '404'
export type AuthModelInstance = InstanceType<typeof AuthModel>

export class AuthModel extends EventEmitter {
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
                break
            default:
                this.goTo404()
        }
    }

    private goTo404() {
        console.log('страница 404')
        this.emit('404')
    }
}
