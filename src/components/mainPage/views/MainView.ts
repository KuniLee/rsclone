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
        this.footerEl = this.renderFooter()
        this.renderPage()
        this.model.on('404', () => {
            this.show404page()
        })
        this.model.on('SIGN_IN', () => {
            this.renderPage()
        })
        this.model.on('SIGN_OUT', () => {
            this.renderPage()
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        const dropdownMenuEl = new DropdownMenu(this.model)
        const popupSettingsEl = new PopupSettings(this.model)
        const headerEl = this.renderHeader()
        this.show(headerEl)
        document.body.onclick = null
        console.log(this.model.user)
        this.addListeners(headerEl, dropdownMenuEl, popupSettingsEl)
    }

    private addListeners(header: HTMLElement, dropDownMenu: DropdownMenu, popupSettings: PopupSettings) {
        const navEl = header.querySelector('.nav')
        const headerFlowsEl = header.querySelector('.header__flows')
        const bgEl = this.createBg()

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
                this.togglePopupSettings(ev.target, header, popupSettings)
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

    private togglePopupSettings(element: HTMLElement, header: HTMLElement, popupSettings: PopupSettings) {
        const visualSettings = header.querySelector('.visual-settings')
        const popupSettingsEl = document.querySelector('.popup-settings')
        const saveSettingsBtn = document.querySelector('.btn-save')
        if (visualSettings) {
            visualSettings.addEventListener('click', () => {
                document.body.appendChild(popupSettings.render())
                Array.from(document.getElementsByName('visual-settings')).forEach((input) => {
                    if (input instanceof HTMLInputElement && this.model.lang === input.id) {
                        input.checked = true
                    }
                })
            })
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', (ev) => {
                    ev.preventDefault()
                    const selectedLangInput = Array.from(document.getElementsByName('visual-settings')).find(
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
                document.body.removeChild(popupSettings.render())
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

    private toggleDropdownMenu(element: HTMLElement, header: HTMLElement, dropDownMenu: DropdownMenu) {
        const userIcon = header.querySelector('.user')
        let dropdownMenuEl = dropDownMenu.renderUserSignOut()
        if (this.model.user) {
            dropdownMenuEl = dropDownMenu.renderUserSignIn()
        }
        const exit = dropdownMenuEl.querySelector('.exit')
        if (element.classList.contains('user')) {
            element.classList.toggle('active')
            if (element.classList.contains('active')) {
                header.append(dropdownMenuEl)
            } else {
                header.removeChild(dropdownMenuEl)
            }
        }
        if (!element.closest('.drop-down-menu') && !element.classList.contains('user')) {
            if (userIcon && userIcon.classList.contains('active')) {
                userIcon.classList.remove('active')
                header.removeChild(dropdownMenuEl)
            }
        }

        if (exit) {
            exit.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit('SIGN_OUT')
            })
        }
    }

    private setActiveLink(links: HTMLCollection, currentLink: HTMLElement) {
        Array.from(links).forEach((link) => {
            if (link !== currentLink) link.classList.replace('text-color-text-dark', 'text-color-text-light')
            currentLink.classList.replace('text-color-text-light', 'text-color-text-dark')
        })
    }

    private renderHeader() {
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
            header.innerHTML = headerUserSignInTemplate({ flows, logo, currentPath, userAvatar })
        } else {
            header.innerHTML = headerUserSignOutTemplate({ flows, logo, currentPath })
        }
        return header
    }

    private renderFooter() {
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

    private show(header: HTMLElement) {
        document.body.replaceChildren(header, this.mainPageContainer, this.footerEl)
    }
}
