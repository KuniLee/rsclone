import { PageModel } from '@/components/mainPage/model/PageModel'
import popupSettings from '../templates/popupSettings.hbs'
import dictionary from '@/utils/dictionary'

export class PopupSettings {
    private modalSettings: HTMLElement
    private model: PageModel

    constructor(model: PageModel) {
        this.model = model
        this.modalSettings = document.createElement('div')
        this.modalSettings.className = 'popup'
    }

    create() {
        const textData = Object.keys(dictionary.popupSettings).reduce((acc, key) => {
            return { ...acc, [key]: dictionary.popupSettings[key][this.model.lang] }
        }, {})
        this.modalSettings.innerHTML = popupSettings({ textData })
        return this.modalSettings
    }
}
