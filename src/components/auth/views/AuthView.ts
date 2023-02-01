import EventEmitter from 'events'
import authTemplate from '@/templates/authPage.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import headerTemplate from '@/templates/header.hbs'
import { AuthViewTypes } from 'types/types'

type ItemViewEventsName = 'GOTO' | 'LOGIN'

export type AuthViewInstance = InstanceType<typeof AuthView>

export class AuthView extends EventEmitter {
    private model: AuthModelInstance
    private headerEl: HTMLElement
    private mainPageContainer: HTMLElement

    constructor(authModel: AuthModelInstance) {
        super()
        this.model = authModel
        this.headerEl = this.renderHeader()
        this.mainPageContainer = document.createElement('main')
        this.mainPageContainer.className = 'bg-[#f0f0f0] flex-grow'
        this.addListeners()
        this.show()
        this.buildPage()
        this.model.on('CHANGE_PAGE', () => {
            if (this.model.path[0] === Paths.Auth) this.buildPage()
        })
    }

    private buildPage() {
        const mainContainer = document.querySelector('main')
        if (mainContainer) {
            mainContainer.innerHTML = authTemplate({})
            this.addListeners()
        }
    }

    private addListeners() {
        const registrationBtn = document.querySelector('.registration')
        const forgotPass = document.querySelector('.forgot-pass')
        const submitButton = document.querySelector('.login-btn')
        registrationBtn?.addEventListener('click', (e) => {
            e.preventDefault()
            if (e.target instanceof HTMLAnchorElement) {
                this.emit<string>('GOTO', new URL(e.target.href).pathname)
            }
        })
        submitButton?.addEventListener('click', (e) => {
            e.preventDefault()
            const emailInput = document.querySelector('.email-login-input') as HTMLInputElement
            const passwordInput = document.querySelector('.password-login-input') as HTMLInputElement
            if (emailInput && passwordInput) {
                const emailValue = emailInput.value
                const passwordValue = passwordInput.value
                if (emailValue && passwordValue) {
                    this.emit('LOGIN', undefined, { email: emailValue, password: passwordValue })
                }
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private renderHeader() {
        const header = document.createElement('header')
        header.innerHTML = headerTemplate({})
        return header
    }

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer)
    }

    private openRegistrationForm() {
        console.log('test')
    }

    emit<T>(event: ItemViewEventsName, arg?: T, data?: AuthViewTypes) {
        return super.emit(event, arg, data)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T, data: AuthViewTypes) => void) {
        return super.on(event, callback)
    }
}
