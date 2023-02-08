import EventEmitter from 'events'
import { Paths, SettingsPaths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import profileTemp from '@/templates/profile.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import emptyAvatar from '@/assets/icons/avatar.svg'

console.log(emptyAvatar)

type SettingsViewEventsName = 'LOAD_ARTICLES' | 'UPLOAD_IMAGE'

export type SettingsViewInstance = InstanceType<typeof SettingsView>

export class SettingsView extends EventEmitter {
    private mainPageContainer: HTMLElement

    constructor(private model: PageModelInstance) {
        super()
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.model.on('SIGN_IN', () => {
            if (this.model.user) this.renderPage()
        })
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
        const path = this.model.path
        if (!(path[0] === Paths.Settings && path[1] === SettingsPaths.Profile)) return
        this.mainPageContainer.innerHTML = ''
        const pageWrapper = document.createElement('div')
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = profileTemp({
            words: getWords(Dictionary.ProfileSettings, this.model.lang),
            avatar: emptyAvatar,
        })
        this.addListeners(pageWrapper)
        this.mainPageContainer.append(pageWrapper)
    }

    private addListeners(pageWrapper: HTMLDivElement) {
        const file = pageWrapper.querySelector('input[type=file]') as HTMLInputElement
        file.addEventListener('change', () => {
            if (file.files?.length === 1) {
                if (this.checkTheImage(file.files[0])) this.showPreview(file.files[0])
                else this.showErrorMsg()
            }
        })
    }

    private showErrorMsg() {
        console.log('error')
    }

    private checkTheImage(img: File) {
        return img.type.match(/image.*/) && img.size < 1024 * 1024
    }

    private showPreview(file: File) {
        const avatarContainer = this.mainPageContainer.querySelector('.user-avatar') as HTMLDivElement
        const img = document.createElement('img') as HTMLImageElement
        const reader = new FileReader()
        reader.onload = (e) => {
            img.src = <string>e.target?.result
        }
        img.onload = () => {
            this.resizeImg(img)
        }
        reader.readAsDataURL(file)
        avatarContainer.innerHTML = ''
        avatarContainer.append(img)
        return img
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
        console.log(canvas.toDataURL('image/png'))
    }
}
