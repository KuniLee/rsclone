import EventEmitter from 'events'
import { Paths, SettingsPaths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import authErrorPage from '@/templates/authError.hbs'
import profileSettingsTemp from '@/templates/profileSettings.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import emptyAvatar from '@/assets/icons/avatar.svg'
import { UserData, UserProps } from 'types/types'

type SettingsViewEventsName = 'LOAD_ARTICLES' | 'SAVE_SETTINGS' | 'GOTO'

export type SettingsViewInstance = InstanceType<typeof SettingsView>

export class SettingsView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private user: UserData | null = null

    constructor(private model: PageModelInstance) {
        super()
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.model.on('CHANGE_PAGE', () => {
            this.renderPage()
        })
    }

    emit<T>(event: SettingsViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: SettingsViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        this.mainPageContainer = document.body.querySelector('main') as HTMLElement
        const path = this.model.path
        if (!(path[0] === Paths.Settings && path[1] === SettingsPaths.Profile)) return
        if (!this.model.user) {
            this.showAuthFail()
            return
        }
        this.setUserProps(this.model.user)
        this.mainPageContainer.innerHTML = ''
        const pageWrapper = document.createElement('div')
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = profileSettingsTemp({
            words: getWords(Dictionary.ProfileSettings, this.model.lang),
            user: this.user?.properties,
            emptyAvatar,
        })
        this.addListeners(pageWrapper)
        this.mainPageContainer.append(pageWrapper)
    }

    private addListeners(pageWrapper: HTMLDivElement) {
        const file = pageWrapper.querySelector('input[type=file]') as HTMLInputElement
        const btnImage = pageWrapper.querySelector('.btnImage') as HTMLSpanElement
        const saveBnt = pageWrapper.querySelector('button[type=submit]') as HTMLLabelElement
        const nameInput = pageWrapper.querySelector('.name-input') as HTMLInputElement
        const aboutInput = pageWrapper.querySelector('.about-input') as HTMLInputElement
        nameInput.addEventListener('input', () => {
            this.onInput(nameInput, 40, 'fullName')
        })
        aboutInput.addEventListener('input', () => {
            this.onInput(aboutInput, 50, 'about')
        })
        saveBnt.onclick = () => {
            if (this.user) this.emit<UserData>('SAVE_SETTINGS', this.user)
        }
        file.addEventListener('change', () => {
            if (file.files?.length === 1) {
                if (this.checkTheImage(file.files[0])) {
                    this.showPreview(file.files[0])
                    btnImage.textContent = Dictionary.buttons.Remove[this.model.lang]
                } else this.showErrorMsg()
            }
        })
        btnImage.addEventListener('click', (ev) => {
            if (this.user?.properties.avatar) {
                ev.preventDefault()
                this.removeAvatar()
                btnImage.textContent = Dictionary.buttons.Upload[this.model.lang]
            } else file.click()
        })
    }

    private onInput(inputEl: HTMLInputElement, length: number, param: keyof UserProps) {
        let value = inputEl.value
        if (value.length > length) value = value.slice(0, length - 1)
        if (this.user) this.user.properties[param] = value
        const counter = inputEl.previousElementSibling as HTMLElement
        if (counter?.lastChild) counter.lastChild.textContent = String(length - value.length)
    }

    private showErrorMsg() {
        console.log('error')
    }

    private checkTheImage(img: File) {
        return img.type.match(/image.*/) && img.size < 1024 * 1024
    }

    private showPreview(file: File) {
        const img = document.createElement('img')
        img.className = 'w-full h-full object-contain'
        img.onload = () => {
            this.resizeImg(img)
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            img.src = <string>e.target?.result
        }
        reader.readAsDataURL(file)
        const imageWrapper = this.mainPageContainer?.querySelector('.user-avatar') as HTMLDivElement
        imageWrapper.innerHTML = ''
        imageWrapper.append(img)
    }

    private resizeImg(img: HTMLImageElement) {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 96
        const MAX_HEIGHT = 96
        let width = img.naturalWidth
        let height = img.naturalHeight
        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
            }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        if (this.user) this.user.properties.avatar = canvas.toDataURL('image/png')
    }

    private showAuthFail() {
        if (this.mainPageContainer) this.mainPageContainer.innerHTML = ''
        const pageWrapper = document.createElement('div')
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = authErrorPage({ words: getWords(Dictionary.errorPage, this.model.lang) })
        const mainPageBtn = pageWrapper.querySelector('button') as HTMLButtonElement
        mainPageBtn.onclick = () => {
            this.emit<string>('GOTO', location.origin)
        }
        this.mainPageContainer?.append(pageWrapper)
    }

    private setUserProps(user: UserData) {
        this.user = user
    }

    private removeAvatar() {
        if (this.user) this.user.properties.avatar = null
        const imageWrapper = this.mainPageContainer?.querySelector('.user-avatar') as HTMLDivElement
        imageWrapper.innerHTML = `<img class="w-full h-full object-contain" src="${emptyAvatar}" alt="user-avatar">`
    }
}
