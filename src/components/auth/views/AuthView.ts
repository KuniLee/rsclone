import EventEmitter from 'events'
import authTemplate from '@/templates/authPage.hbs'
import registerTemplate from '@/templates/registerPage.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import headerTemplate from '@/templates/header.hbs'
import { AuthViewTypes } from 'types/types'

type ItemViewEventsName = 'GOTO' | 'LOGIN' | 'CHECK_EMAIL' | 'SIGN_UP'

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
        this.model.on('CHANGE_PAGE', (arg) => {
            if (this.model.path[0] === Paths.Auth) {
                if (typeof arg === 'object' && arg) {
                    const searchParams = new URLSearchParams(Object.entries(arg))
                    const query = searchParams.get('register')
                    if (query) {
                        this.buildPage(true)
                    } else {
                        this.buildPage()
                    }
                } else {
                    this.buildPage()
                }
            }
        })
        this.model.on('USER_SIGNED_UP', () => {
            const logo = document.querySelector('.header__logo') as HTMLElement
            if (logo) {
                logo.click()
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
                const captcha = document.getElementById('captcha1') as HTMLElement
                if (captcha && grecaptcha) {
                    setTimeout(() => {
                        grecaptcha.render('captcha1', {
                            sitekey: '6LcNQUckAAAAAP1R8Ewdw2p6lUQDn4IYE5GSpC63',
                        })
                    }, 1000)
                }
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
                this.emit<string>('GOTO', e.target.href)
            }
        })
        const registrationSubmitBtn = document.querySelector('.registrationCompleteBtn') as HTMLButtonElement
        registrationSubmitBtn?.addEventListener('click', (e) => {
            e.preventDefault()
            const checkResult: AuthViewTypes | boolean = this.checkAllRegistrationForms()
            if (checkResult) {
                if (grecaptcha) {
                    if (grecaptcha.getResponse().length) {
                        this.emit('SIGN_UP', undefined, checkResult)
                    }
                }
            }
        })
        const signIn = document.querySelector('.signIn')
        signIn?.addEventListener('click', (e) => {
            e.preventDefault()
            if (e.target instanceof HTMLAnchorElement) {
                this.emit<string>('GOTO', e.target.href)
            }
        })
        submitButton?.addEventListener('click', (e) => {
            e.preventDefault()
            const emailInput = document.querySelector('.email-input') as HTMLInputElement
            const passwordInput = document.querySelector('.password-input') as HTMLInputElement
            if (emailInput && passwordInput) {
                const emailValue = emailInput.value
                const passwordValue = passwordInput.value
                if (emailValue && passwordValue) {
                    this.emit('LOGIN', undefined, { email: emailValue, password: passwordValue })
                }
            }
        })
        const emailInput = document.querySelector('.email-input') as HTMLInputElement
        emailInput?.addEventListener('input', (e) => {
            const reg = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
            this.validateInputs(emailInput, reg)
        })
        const nickname = document.querySelector('.nickname-input') as HTMLInputElement
        nickname?.addEventListener('input', () => {
            const reg = new RegExp('[A-z0-9]{4,}')
            this.validateInputs(nickname, reg)
        })
        const passwordInput = document.querySelector('.password-input') as HTMLInputElement
        passwordInput?.addEventListener('input', () => {
            const reg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}')
            this.checkPasswords()
            this.validateInputs(passwordInput, reg)
        })
        const passwordRepeatInput = document.querySelector('.password-repeat-input') as HTMLInputElement
        passwordRepeatInput?.addEventListener('input', () => {
            this.checkPasswords()
        })
    }

    private checkAllRegistrationForms() {
        const email = document.querySelector('.email-input') as HTMLInputElement
        const nick = document.querySelector('.nickname-input') as HTMLInputElement
        const pass = document.querySelector('.password-input') as HTMLInputElement
        const passRepeat = document.querySelector('.password-repeat-input') as HTMLInputElement
        const emailReg = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        const nickReg = new RegExp('[A-z0-9]{4,}')
        const passReg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}')
        const emailCheckResult = this.validateInputs(email, emailReg)
        const nickCheckResult = this.validateInputs(nick, nickReg)
        const passCheckResult = this.validateInputs(pass, passReg)
        const samePassCheckResult = this.checkPasswords()
        if (emailCheckResult && nickCheckResult && passCheckResult && samePassCheckResult) {
            return {
                email: email.value,
                password: pass.value,
                nick: nick.value,
            }
        } else {
            return false
        }
    }

    private checkPasswords() {
        const passwordRepeatInput = document.querySelector('.password-repeat-input') as HTMLInputElement
        const passwordInput = document.querySelector('.password-input') as HTMLInputElement
        if (passwordRepeatInput && passwordInput) {
            if (passwordRepeatInput.value.length !== 0) {
                if (passwordInput.value !== passwordRepeatInput.value) {
                    passwordInput.classList.add('border-[#ff6e6e]')
                    passwordRepeatInput.classList.add('border-[#ff6e6e]')
                } else {
                    passwordInput.classList.remove('border-[#ff6e6e]')
                    passwordRepeatInput.classList.remove('border-[#ff6e6e]')
                    return true
                }
            }
        }
    }
    private validateInputs(element: HTMLInputElement, reg: RegExp) {
        const value = element.value
        const patternMatch = value.match(reg)
        if (patternMatch || value.length === 0) {
            if (element.classList.contains('border-[#ff6e6e]')) {
                element.classList.remove('border-[#ff6e6e]')
            }
            if (patternMatch) {
                return true
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
