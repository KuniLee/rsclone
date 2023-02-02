import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { AuthLoaderInstance } from '@/utils/AuthLoader'
import { URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'
import { AuthViewTypes } from 'types/types'

type PageModelEventsName = 'CHANGE_PAGE' | '404' | 'USER_SIGNED_UP' | 'EMAIL_EXIST' | 'WRONG_DATA'
export type AuthModelInstance = InstanceType<typeof AuthModel>

export class AuthModel extends EventEmitter {
    public path: Array<string> = []
    public lang: 'ru' | 'en' = 'ru'
    private loader: AuthLoaderInstance
    public search: ParsedQuery<string> = {}

    constructor(loader: AuthLoaderInstance) {
        super()
        this.loader = loader
    }

    async signInUser(email: string, password: string) {
        const result = await this.loader.signIn(email, password)
        if (result) {
            this.emit('USER_SIGNED_UP')
        } else {
            this.emit('WRONG_DATA')
        }
    }

    async signUpUser(data: AuthViewTypes) {
        if (data.email && data.password && data.nick) {
            const checkExistEmail = await this.loader.checkEmailInDatabase(data.email)
            if (checkExistEmail.length === 0) {
                const result = this.loader.signUp(data.email, data.password)
                this.emit('USER_SIGNED_UP')
            } else {
                this.emit('EMAIL_EXIST')
            }
        }
    }
    on<T>(event: PageModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: PageModelEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    changePage({ path, search }: URLParams) {
        this.path = path
        if (this.path[0] === '/auth') {
            this.path[0] += '.html'
        }
        this.search = search
        if (!Object.values(Paths).includes(path.at(0) as Paths)) return this.goTo404()
        switch (this.path[0]) {
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
