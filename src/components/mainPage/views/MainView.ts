import { PopupSettings } from '@/utils/popupSettings'
import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerTemplate from '@/templates/header.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { DropdownMenu } from '@/utils/dropdownMenu'
import footerTemplate from '@/templates/footer.hbs'
import { rootModel } from 'types/interfaces'

type ItemViewEventsName = 'GOTO'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private readonly model: PageModel
    private readonly headerEl: HTMLElement
    private readonly footerEl: HTMLElement
    private readonly mainPageContainer: HTMLElement
    private dropdownMenu: DropdownMenu
    private popupSettings: PopupSettings

    constructor(model: PageModel) {
        super()
        this.model = model
        this.dropdownMenu = new DropdownMenu(this.model)
        this.popupSettings = new PopupSettings(this.model)
        this.headerEl = this.renderHeader()
        this.footerEl = this.renderFooter()
        this.mainPageContainer = document.createElement('main')
        this.mainPageContainer.classList.add('main', 'sm:mt-3', 'mb-10')
        this.show()
        this.addListeners()
        this.model.on('404', () => {
            this.show404page()
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private addListeners() {
        const navEl = this.headerEl.querySelector('.nav')
        const headerFlowsEl = this.headerEl.querySelector('.header__flows')
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

        document.body.addEventListener('click', (ev) => {
            if (ev.target instanceof HTMLElement) {
                this.toggleDropdownMenu(ev.target)
                this.togglePopupSettings(ev.target)
                if (headerFlowsEl) {
                    this.toggleSidebar(ev.target, headerFlowsEl, bgEl)
                }
            }
        })

        window.addEventListener('resize', () => {
            if (headerFlowsEl && window.innerWidth > 768 && headerFlowsEl.classList.contains('sidebar')) {
                this.closeSidebar(headerFlowsEl, bgEl)
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private togglePopupSettings(element: HTMLElement) {
        const settingsBtn = this.headerEl.querySelector('.settings')
        const popupSettings = document.querySelector('.popup-settings')
        const saveSettingsBtn = document.querySelector('.btn-save')
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                document.body.appendChild(this.popupSettings.render())
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
        if (popupSettings) {
            if (
                !element.closest('.settings') &&
                (!element.closest('.popup-settings') || element.classList.contains('ico_close'))
            ) {
                document.body.removeChild(this.popupSettings.render())
            }
        }
    }

    private openSidebar(headerFlows: Element, sidebarBg: HTMLElement) {
        headerFlows.classList.add('sidebar')
        headerFlows.classList.remove('hidden')
        this.headerEl.appendChild(sidebarBg)
    }

    private closeSidebar(headerFlows: Element, sidebarBg: HTMLElement) {
        headerFlows.classList.remove('sidebar')
        headerFlows.classList.add('hidden')
        this.headerEl.removeChild(sidebarBg)
    }

    private toggleSidebar(element: HTMLElement, headerFlows: Element, bgEl: HTMLElement) {
        if (element.classList.contains('burger')) {
            this.openSidebar(headerFlows, bgEl)
        }
        if (
            headerFlows.classList.contains('sidebar') &&
            (element.classList.contains('nav__link') || element.classList.contains('bg'))
        ) {
            this.closeSidebar(headerFlows, bgEl)
        }
    }

    private toggleDropdownMenu(element: HTMLElement) {
        const userIconLight = this.headerEl.querySelector('.ico_user-light')
        const userIcon = this.headerEl.querySelector('.ico_user')
        const dropdownMenu = this.dropdownMenu.renderNotAuth()
        if (element.classList.contains('ico_user') || element.classList.contains('ico_user-light')) {
            element.classList.toggle('active')
            if (element.classList.contains('active')) {
                this.headerEl.append(dropdownMenu)
            } else {
                this.headerEl.removeChild(dropdownMenu)
            }
        }
        if (!element.closest('.drop-down-menu') && !element.classList.contains('ico_user')) {
            if (userIcon && userIcon.classList.contains('active')) {
                userIcon.classList.remove('active')
                this.headerEl.removeChild(dropdownMenu)
            }
        }
        if (
            !element.closest('.drop-down-menu') &&
            !element.classList.contains('ico_user-light') &&
            !element.classList.contains('ico_close')
        ) {
            if (userIconLight && userIconLight.classList.contains('active')) {
                userIconLight.classList.remove('active')
                this.headerEl.removeChild(dropdownMenu)
            }
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
        header.className = 'bg-color-light border-solid border-b border-color-border-header sticky top-0 header'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: Paths.Flows + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        flows.push({ name: dictionary.buttons.Sandbox[this.model.lang], link: Paths.Sandbox + '/new' })
        const logo = dictionary.logo.Logo[this.model.lang]
        header.innerHTML = headerTemplate({ flows, logo })
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

    private show() {
        document.body.replaceChildren(this.headerEl, this.mainPageContainer, this.footerEl)
    }
}
