import { PageModel } from '@/components/mainPage/model/PageModel'
import dropDownTemplate from '../templates/dropdownMenu.hbs'
import dictionary from '@/utils/dictionary'

export class DropdownMenu {
    private dropdownMenu: HTMLElement
    private model: PageModel

    constructor(model: PageModel) {
        this.model = model
        this.dropdownMenu = document.createElement('div')
    }

    renderNotAuth() {
        const buttons = Object.keys(dictionary.buttons)
            .slice(1)
            .reduce((acc, key) => {
                return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
            }, {})
        this.dropdownMenu.innerHTML = dropDownTemplate({ buttons })
        return this.dropdownMenu
    }
}
