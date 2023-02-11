import { PopupSettings } from '@/utils/popupSettings'
import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerUserSignInTemplate from '@/templates/headerUserSignIn.hbs'
import headerUserSignOutTemplate from '@/templates/header.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { DropdownMenu } from '@/utils/dropdownMenu'
import footerTemplate from '@/templates/footer.hbs'
import { rootModel } from 'types/interfaces'
import emptyAvatar from '@/assets/icons/avatar.svg'

type ItemViewEventsName = 'GOTO' | 'SIGN_OUT'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private model: PageModel
    private mainPageContainer: HTMLElement
    private footerEl: HTMLElement

    constructor(model: PageModel) {
        super()
        this.model = model
        this.mainPageContainer = document.createElement('main')
        this.mainPageContainer.classList.add('main', 'sm:mt-3', 'mb-10')
        this.footerEl = this.createFooter()
        this.buildPage()
        this.model.on('404', () => {
            this.show404page()
        })
        this.model.on('SIGN_IN', () => {
            this.buildPage()
        })
        this.model.on('SIGN_OUT', () => {
            this.buildPage()
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    buildPage() {
        const dropdownMenu = new DropdownMenu(this.model)
        const popupSettings = new PopupSettings(this.model)
        const headerEl = this.createHeader()
        let dropdownMenuEl = dropdownMenu.renderUserSignOut()
        if (this.model.user) {
            dropdownMenuEl = dropdownMenu.renderUserSignIn()
        }
        const popupSettingsEl = popupSettings.render()
        this.render(headerEl)
        document.body.onclick = null
        this.addListeners(headerEl, dropdownMenuEl, popupSettingsEl)
    }

    private addListeners(header: HTMLElement, dropDownMenu: HTMLElement, popupSettings: HTMLElement) {
        const navEl = header.querySelector('.nav')
        const headerFlowsEl = header.querySelector('.header__flows')
        const bgEl = this.createBg()

        header.addEventListener('click', (ev) => {
            const el = (ev.target as HTMLElement).parentElement
            if (el instanceof HTMLAnchorElement) {
                ev.preventDefault()
                this.emit<string>('GOTO', el.href)
            }
        })

        if (navEl) {
            navEl.addEventListener('click', (ev) => {
                if (ev.target instanceof HTMLAnchorElement) {
                    const pathname = ev.target.href
                    if (!pathname.includes(Paths.Auth) && !pathname.includes(Paths.Registration)) {
                        ev.preventDefault()
                        this.setActiveLink(navEl.children, ev.target)
                        this.emit<string>('GOTO', ev.target.href)
                    }
                }
            })
        }

        document.body.onclick = (ev) => {
            if (ev.target instanceof HTMLElement) {
                this.toggleDropdownMenu(ev.target, header, dropDownMenu)
                this.togglePopupSettings(ev.target, header, popupSettings, bgEl)
                if (headerFlowsEl) {
                    this.toggleSidebar(ev.target, headerFlowsEl, bgEl, header)
                }
            }
        }

        window.addEventListener('resize', () => {
            if (headerFlowsEl && window.innerWidth > 768 && headerFlowsEl.classList.contains('sidebar')) {
                this.closeSidebar(headerFlowsEl, bgEl, header)
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private togglePopupSettings(
        element: HTMLElement,
        header: HTMLElement,
        popupSettings: HTMLElement,
        bg: HTMLElement
    ) {
        const visualSettings = header.querySelector('.visual-settings')
        const popupSettingsEl = document.querySelector('.popup-settings')
        const saveSettingsBtn = document.querySelector('.btn-save')
        if (visualSettings) {
            visualSettings.addEventListener('click', () => {
                header.append(bg, popupSettings)
                Array.from(document.getElementsByName('lang')).forEach((input) => {
                    if (input instanceof HTMLInputElement && this.model.lang === input.id) {
                        input.checked = true
                    }
                })
            })
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', (ev) => {
                    ev.preventDefault()
                    const selectedLangInput = Array.from(document.getElementsByName('lang')).find(
                        (input) => input instanceof HTMLInputElement && input.checked
                    )
                    if (selectedLangInput) {
                        localStorage.lang = selectedLangInput.id as rootModel['lang']
                        location.reload()
                    }
                })
            }
        }

        if (popupSettingsEl) {
            if (
                !element.closest('.visual-settings') &&
                (!element.closest('.popup-settings') || element.classList.contains('ico_close'))
            ) {
                header.removeChild(popupSettings)
                header.removeChild(bg)
            }
        }
    }

    private openSidebar(headerFlows: Element, sidebarBg: HTMLElement, header: HTMLElement) {
        headerFlows.classList.add('sidebar')
        headerFlows.classList.remove('hidden')
        header.appendChild(sidebarBg)
    }

    private closeSidebar(headerFlows: Element, sidebarBg: HTMLElement, header: HTMLElement) {
        headerFlows.classList.remove('sidebar')
        headerFlows.classList.add('hidden')
        header.removeChild(sidebarBg)
    }

    private toggleSidebar(element: HTMLElement, headerFlows: Element, bgEl: HTMLElement, header: HTMLElement) {
        if (element.classList.contains('burger')) {
            this.openSidebar(headerFlows, bgEl, header)
        }
        if (
            headerFlows.classList.contains('sidebar') &&
            (element.classList.contains('nav__link') || element.classList.contains('bg'))
        ) {
            this.closeSidebar(headerFlows, bgEl, header)
        }
    }

    private toggleDropdownMenu(element: HTMLElement, header: HTMLElement, dropdownMenu: HTMLElement) {
        const userIconLight = header.querySelector('.ico_user-light')
        const userIcon = header.querySelectorAll('.user')
        const exit = dropdownMenu.querySelector('.exit')
        if (element.classList.contains('user')) {
            element.classList.toggle('active')
            if (element.classList.contains('active')) {
                header.append(dropdownMenu)
            } else {
                header.removeChild(dropdownMenu)
            }
        }
        if (
            (!element.closest('.drop-down-menu') && !element.classList.contains('user')) ||
            element.classList.contains('user-avatar') ||
            element.classList.contains('user-name')
        ) {
            userIcon.forEach((userIcon) => {
                if (userIcon && userIcon.classList.contains('active')) {
                    userIcon.classList.remove('active')
                    header.removeChild(dropdownMenu)
                }
            })
        }
        if (
            (!element.closest('.drop-down-menu') &&
                !element.classList.contains('ico_user-light') &&
                !element.classList.contains('ico_close')) ||
            element.classList.contains('user-avatar') ||
            element.classList.contains('user-name')
        ) {
            if (userIconLight && userIconLight.classList.contains('active')) {
                userIconLight.classList.remove('active')
                header.removeChild(dropdownMenu)
            }
        }
        if (exit) {
            exit.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit('SIGN_OUT')
                location.reload()
            })
        }
    }

    private setActiveLink(links: HTMLCollection, currentLink: HTMLElement) {
        Array.from(links).forEach((link) => {
            if (link !== currentLink) link.classList.replace('text-color-text-dark', 'text-color-text-light')
            currentLink.classList.replace('text-color-text-light', 'text-color-text-dark')
        })
    }

    private createHeader() {
        const header = document.createElement('header')
        header.className = 'bg-color-light border-solid border-b border-color-border-header sticky top-0 header z-10'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: Paths.Flows + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        const logo = dictionary.logo.Logo[this.model.lang]
        let currentPath = location.pathname
        if (currentPath === Flows.All) currentPath = Paths.Flows + currentPath
        if (this.model.user) {
            const userAvatar = this.model.user.properties.avatar
            header.innerHTML = headerUserSignInTemplate({ flows, logo, currentPath, userAvatar, emptyAvatar })
        } else {
            header.innerHTML = headerUserSignOutTemplate({ flows, logo, currentPath })
        }
        return header
    }

    private createFooter() {
        const footer = document.createElement('footer')
        footer.classList.add('footer')
        footer.innerHTML = footerTemplate({})
        return footer
    }

    private createBg() {
        const bg = document.createElement('div')
        bg.className = 'bg-color-popup-bg fixed top-0 bottom-0 left-0 right-0 bg'
        return bg
    }

    private render(header: HTMLElement) {
        document.body.replaceChildren(header, this.mainPageContainer, this.footerEl)
    }
}
