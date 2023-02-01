import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { AuthLoaderInstance } from '@/utils/AuthLoader'

type PageModelEventsName = 'CHANGE_PAGE' | '404'
export type AuthModelInstance = InstanceType<typeof AuthModel>

export class AuthModel extends EventEmitter {
    public path: Array<string> = []
    public lang: 'ru' | 'en' = 'ru'
    private loader: AuthLoaderInstance

    constructor(loader: AuthLoaderInstance) {
        super()
        this.loader = loader
    }

    async signInUser(email: string, password: string) {
        const result = await this.loader.signIn(email, password)
        if (result) {
            alert('USER SIGN IN')
        } else {
            alert('WRONG DATA')
        }
    }

    on<T>(event: PageModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: PageModelEventsName) {
        return super.emit(event)
    }

    changePage(arg: Array<string>) {
        this.path = arg
        console.log('test')
        if (!Object.values(Paths).includes(arg.at(0) as Paths)) return this.goTo404()
        switch (this.path[0]) {
            case Paths.All:
                this.path = [Paths.All]
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
            this.emit('CHANGE_PAGE')
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
