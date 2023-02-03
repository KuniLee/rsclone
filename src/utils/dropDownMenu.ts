import { PageModel } from '@/components/mainPage/model/PageModel'
import dropDownTemplate from '../templates/dropdownMenu.hbs'
import dictionary from '@/utils/dictionary'

export class DropdownMenu {
    private dropdownMenu: HTMLElement
    private model: PageModel

    constructor(model: PageModel) {
        this.model = model
        this.dropdownMenu = document.createElement('div')
        this.dropdownMenu.className = 'drop-down-menu'
    }

    renderNotAuth() {
        const buttons = Object.keys(dictionary.buttons)
            .slice(1)
            .reduce((acc, key) => {
                return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
            }, {})
        this.dropdownMenu.innerHTML = dropDownTemplate({ buttons })
        const settings = document.querySelector('.settings')
        if (settings)
            settings.addEventListener('click', () => {
                console.log('hhh')
            })
        return this.dropdownMenu
    }
}
