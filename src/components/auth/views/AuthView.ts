import EventEmitter from 'events'
import authTemplate from '@/templates/authPage.hbs'
import registerTemplate from '@/templates/registerPage.hbs'
import { Paths } from 'types/enums'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import headerTemplate from '@/templates/header.hbs'
import { AuthViewTypes } from 'types/types'
import footerTemplate from '@/templates/footer.hbs'
import dictionary from '@/utils/dictionary'

type ItemViewEventsName = 'GOTO' | 'LOGIN' | 'CHECK_EMAIL' | 'SIGN_UP'

export type AuthViewInstance = InstanceType<typeof AuthView>

export class AuthView extends EventEmitter {
    private model: AuthModelInstance
    private headerEl: HTMLElement
    private footerEl: HTMLElement
    private mainPageContainer: HTMLElement

    constructor(authModel: AuthModelInstance) {
        super()
        this.model = authModel
        this.headerEl = this.renderHeader()
        this.footerEl = this.renderFooter()
        this.mainPageContainer = document.createElement('main')
        this.mainPageContainer.className = 'bg-color-bg-dark flex-grow'
        this.show()
        this.buildPage()
        this.model.on('CHANGE_PAGE', () => {
            if (this.model.path[0] === Paths.Auth) this.buildPage()
            if (this.model.path[0] === Paths.Registration) this.buildPage(true)
        })
        this.model.on('USER_SIGNED_UP', () => {
            this.emit('GOTO', window.location.origin + '/login')
        })
        this.model.on('USER_SIGNED_IN', () => {
            location.href = window.location.origin
        })
        this.model.on('EMAIL_EXIST', () => {
            const errorExist = document.querySelector('.email-error__exist') as HTMLElement
            const emailErrorList = document.querySelector('.email-error') as HTMLElement
            const registrationSubmitBtn = document.querySelector('.registrationCompleteBtn') as HTMLButtonElement
            if (registrationSubmitBtn) {
                registrationSubmitBtn.disabled = false
            }
            if (errorExist && emailErrorList) {
                emailErrorList.hidden = false
                errorExist.hidden = false
            }
        })
        this.model.on('WRONG_DATA', () => {
            const errorWrongData = document.querySelector('.auth-error') as HTMLElement
            const submitButton = document.querySelector('.login-btn') as HTMLButtonElement
            if (submitButton) {
                submitButton.disabled = false
            }
            if (errorWrongData) {
                errorWrongData.hidden = false
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
                            sitekey: process.env.KAPTCHA_KEY,
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
        const submitButton = document.querySelector('.login-btn') as HTMLButtonElement
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
            registrationSubmitBtn.disabled = true
            if (checkResult) {
                if (grecaptcha) {
                    const captchaError = document.querySelector('.captcha-error') as HTMLElement
                    if (grecaptcha.getResponse().length) {
                        if (captchaError) {
                            captchaError.hidden = true
                        }
                        this.emit('SIGN_UP', undefined, checkResult)
                    } else {
                        registrationSubmitBtn.disabled = false
                        if (captchaError) {
                            captchaError.hidden = false
                        }
                    }
                } else {
                    registrationSubmitBtn.disabled = false
                }
            } else {
                registrationSubmitBtn.disabled = false
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
            submitButton.disabled = true
            if (emailInput && passwordInput) {
                const emailValidate = this.validateInputs(
                    emailInput,
                    new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
                )
                const passwordValidate = this.validateInputs(
                    passwordInput,
                    new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}')
                )
                if (emailValidate && passwordValidate) {
                    this.emit('LOGIN', undefined, { email: emailInput.value, password: passwordInput.value })
                } else {
                    submitButton.disabled = false
                }
            } else {
                submitButton.disabled = false
            }
        })
        const emailInput = document.querySelector('.email-input') as HTMLInputElement
        emailInput?.addEventListener('input', () => {
            const reg = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
            const result = this.validateInputs(emailInput, reg)
            const emailError = document.querySelector('.email-error') as HTMLElement
            const emailExistError = document.querySelector('.email-error__exist') as HTMLElement
            const errorWrongData = document.querySelector('.auth-error') as HTMLElement
            if (errorWrongData) {
                errorWrongData.hidden = true
            }
            if (emailExistError) {
                emailExistError.hidden = true
            }
            if (emailError) {
                emailError.hidden = !(!result && result !== null)
            }
        })
        const nickname = document.querySelector('.nickname-input') as HTMLInputElement
        nickname?.addEventListener('input', () => {
            const reg = new RegExp('[A-z0-9]{4,}')
            const result = this.validateInputs(nickname, reg)
            const nickError = document.querySelector('.nick-error') as HTMLElement
            if (nickError) {
                nickError.hidden = !(!result && result !== null)
            }
        })
        const passwordInput = document.querySelector('.password-input') as HTMLInputElement
        passwordInput?.addEventListener('input', () => {
            const reg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}')
            this.checkPasswords()
            const result = this.validateInputs(passwordInput, reg)
            const passError = document.querySelector('.password-error') as HTMLElement
            const passValue = passwordInput.value
            const errorWrongData = document.querySelector('.auth-error') as HTMLElement
            if (errorWrongData) {
                errorWrongData.hidden = true
            }
            if (passError && !result && result !== null) {
                passError.hidden = false
                const passLowerError = document.querySelector('.password-error__lower') as HTMLElement
                if (passLowerError) {
                    if (!passValue.match(/.*[a-z]/)) {
                        passLowerError.hidden = false
                    } else {
                        passLowerError.hidden = true
                    }
                }
                const passUpperError = document.querySelector('.password-error__upper') as HTMLElement
                if (passUpperError) {
                    if (!passValue.match(/.*[A-Z]/)) {
                        passUpperError.hidden = false
                    } else {
                        passUpperError.hidden = true
                    }
                }
                const passDigitError = document.querySelector('.password-error__digit') as HTMLElement
                if (passDigitError) {
                    if (!passValue.match(/.*[0-9]/)) {
                        passDigitError.hidden = false
                    } else {
                        passDigitError.hidden = true
                    }
                }
                const passSpecError = document.querySelector('.password-error__spec') as HTMLElement
                if (passSpecError) {
                    if (!passValue.match(/.*[!@#$%^&*_=+-]/)) {
                        passSpecError.hidden = false
                    } else {
                        passSpecError.hidden = true
                    }
                }
                const passLengthError = document.querySelector('.password-error__length') as HTMLElement
                if (passLengthError) {
                    passLengthError.hidden = !(passValue.length < 8 && passValue.length > 16)
                }
            } else {
                if (passError) {
                    passError.hidden = true
                }
            }
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
                    passwordInput.classList.add('border-color-border-input')
                    passwordRepeatInput.classList.add('border-color-border-input')
                } else {
                    passwordInput.classList.remove('border-color-border-input')
                    passwordRepeatInput.classList.remove('border-color-border-input')
                    return true
                }
            }
        }
    }

    private validateInputs(element: HTMLInputElement, reg: RegExp) {
        const value = element.value
        const patternMatch = value.match(reg)
        if (patternMatch || value.length === 0) {
            if (element.classList.contains('border-color-border-input')) {
                element.classList.remove('border-color-border-input')
            }
            if (value.length === 0) {
                return null
            }
            if (patternMatch) {
                return true
            }
        } else {
            element.classList.add('border-color-border-input')
        }
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private renderHeader() {
        const header = document.createElement('header')
        header.className = 'border-solid border-b border-color-border-header'
        const logo = dictionary.logo.Logo[this.model.lang]
        header.innerHTML = headerTemplate({ logo })
        return header
    }

    private renderFooter() {
        const footer = document.createElement('footer')
        footer.classList.add('footer')
        footer.innerHTML = footerTemplate({})
        return footer
    }

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer, this.footerEl)
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
