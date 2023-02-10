import { PageModel } from '@/components/mainPage/model/PageModel'
import dropDownUserSignOutTemplate from '../templates/dropdownMenuUserSignOut.hbs'
import dropDownUserSignInTemplate from '../templates/dropdownMenuUserSignIn.hbs'
import dictionary from '@/utils/dictionary'

export class DropdownMenu {
    private dropdownMenu: HTMLElement
    private model: PageModel

    constructor(model: PageModel) {
        this.model = model
        this.dropdownMenu = document.createElement('div')
    }

    renderUserSignOut() {
        const buttons = Object.keys(dictionary.buttons)
            .slice(1)
            .reduce((acc, key) => {
                return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
            }, {})
        this.dropdownMenu.innerHTML = dropDownUserSignOutTemplate({ buttons })
        return this.dropdownMenu
    }

    renderUserSignIn() {
        const buttons = Object.keys(dictionary.buttons)
            .slice(1)
            .reduce((acc, key) => {
                return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
            }, {})
        if (this.model.user) {
            const userName = this.model.user.properties.fullName
            const userAvatar = this.model.user.properties.avatar
            this.dropdownMenu.innerHTML = dropDownUserSignInTemplate({ buttons, userName, userAvatar })
        }

        return this.dropdownMenu
    }
}
