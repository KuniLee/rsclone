import EventEmitter from 'events'
import { Paths, SettingsPaths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import profileTemp from '@/templates/profile.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'

type SettingsViewEventsName = 'LOAD_ARTICLES' | 'DOWNLOAD_IMAGE' | 'UPLOAD_IMAGE'

export type SettingsViewInstance = InstanceType<typeof SettingsView>

export class SettingsView extends EventEmitter {
    private mainPageContainer: HTMLElement

    constructor(private model: PageModelInstance) {
        super()
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.model.on('CHANGE_PAGE', () => {
            const path = this.model.path
            // это временно
            if (path[0] === Paths.Settings && path[1] === SettingsPaths.Profile) {
                this.renderPage()
                this.emit('DOWNLOAD_IMAGE')
                return
            }
        })
    }

    emit<T>(event: SettingsViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: SettingsViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        this.mainPageContainer.innerHTML = ''
        const pageWrapper = document.createElement('div')
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = profileTemp({ words: getWords(Dictionary.ProfileSettings, this.model.lang) })
        this.mainPageContainer.append(pageWrapper)
    }
}
