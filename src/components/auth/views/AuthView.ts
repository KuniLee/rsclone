import EventEmitter from 'events'
import authTemplate from '@/templates/authPage.hbs'
import registerTemplate from '@/templates/registerPage.hbs'
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
        this.show()
        this.buildPage()
        this.model.on('CHANGE_PAGE', () => {
            const url = new URL(String(window.location)).searchParams
            const query = url.get('register')
            if (this.model.path[0] === Paths.Auth) {
                if (!query) {
                    this.buildPage()
                } else {
                    this.buildPage(true)
                }
            }
        })
    }

    private buildPage(isRegister?: boolean) {
        const mainContainer = document.querySelector('main')
        if (mainContainer) {
            if (!isRegister) {
                mainContainer.innerHTML = authTemplate({})
            } else {
                mainContainer.innerHTML = registerTemplate({})
            }
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
                const url = new URL(e.target.href)
                this.emit<string>('GOTO', undefined, { path: url.pathname, query: url.search })
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
        const emailInput = document.querySelector('.email-input') as HTMLInputElement
        emailInput?.addEventListener('change', (e) => {
            const reg = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
            this.validateInputs(emailInput, reg)
        })
        const passwordInput = document.querySelector('.password-input') as HTMLInputElement
        passwordInput?.addEventListener('change', () => {
            const reg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}')
            this.validateInputs(passwordInput, reg)
        })
    }

    private validateInputs(element: HTMLInputElement, reg: RegExp) {
        const value = element.value
        const patternMatch = value.match(reg)
        if (patternMatch || value.length === 0) {
            if (element.classList.contains('border-[#ff6e6e]')) {
                element.classList.remove('border-[#ff6e6e]')
            }
        } else {
            element.classList.add('border-[#ff6e6e]')
        }
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
