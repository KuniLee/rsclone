import { PageModel } from '@/components/mainPage/model/PageModel'
import dropDownUserSignInTemplate from '../templates/dropdownMenu.hbs'
import dictionary from '@/utils/dictionary'
import emptyAvatar from '@/assets/icons/avatar.svg'

export class DropdownMenu {
    private dropdownMenu: HTMLElement
    private model: PageModel

    constructor(model: PageModel) {
        this.model = model
        this.dropdownMenu = document.createElement('div')
        this.dropdownMenu.className = 'drop-down-menu__body'
    }

    create() {
        const buttons = Object.keys(dictionary.buttons).reduce((acc, key) => {
            return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
        }, {})
        this.dropdownMenu.innerHTML = dropDownUserSignInTemplate({ buttons, user: this.model.user, emptyAvatar })
        return this.dropdownMenu
    }
}
