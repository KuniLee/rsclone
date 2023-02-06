import { PopupSettings } from '@/utils/popupSettings'
import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerTemplate from '@/templates/header.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { DropdownMenu } from '@/utils/dropdownMenu'
import footerTemplate from '@/templates/footer.hbs'

type ItemViewEventsName = 'GOTO'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private model: PageModel
    private headerEl: HTMLElement
    private footerEl: HTMLElement
    private mainPageContainer: HTMLElement
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
        this.mainPageContainer.classList.add('main')
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
        const navEl = document.querySelector('.nav')
        const headerFlowsEl = document.querySelector('.header__flows')
        const sideBarBgEl = document.querySelector('.sidebar-bg')
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
                if (headerFlowsEl && sideBarBgEl) {
                    this.toggleSidebar(ev.target, headerFlowsEl, sideBarBgEl)
                }
            }
        })

        window.addEventListener('resize', () => {
            if (
                sideBarBgEl &&
                headerFlowsEl &&
                window.innerWidth > 768 &&
                headerFlowsEl.classList.contains('sidebar')
            ) {
                headerFlowsEl.classList.remove('sidebar')
                headerFlowsEl.classList.add('hidden')
                sideBarBgEl.classList.add('hidden')
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private togglePopupSettings(element: HTMLElement) {
        const settingsBtn = document.querySelector('.settings')
        const popupSettings = document.querySelector('.popup-settings')
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                document.body.appendChild(this.popupSettings.render())
            })
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

    private toggleSidebar(element: HTMLElement, headerFlows: Element, sideBarBg: Element) {
        if (element.closest('.burger')) {
            headerFlows.classList.add('sidebar')
            headerFlows.classList.remove('hidden')
            sideBarBg.classList.remove('hidden')
        }
        if (headerFlows.classList.contains('sidebar') && !element.closest('.sidebar') && !element.closest('.burger')) {
            headerFlows.classList.remove('sidebar')
            headerFlows.classList.add('hidden')
            sideBarBg.classList.add('hidden')
        }
    }

    private toggleDropdownMenu(element: HTMLElement) {
        const userIconLight = document.querySelector('.ico_user-light')
        const userIcon = document.querySelector('.ico_user')
        if (element.classList.contains('ico_user') || element.classList.contains('ico_user-light')) {
            element.classList.toggle('active')
            if (element.classList.contains('active')) {
                this.headerEl.appendChild(this.dropdownMenu.renderNotAuth())
            } else {
                this.headerEl.removeChild(this.dropdownMenu.renderNotAuth())
            }
        }
        if (!element.closest('.drop-down-menu') && !element.classList.contains('ico_user')) {
            if (userIcon && userIcon.classList.contains('active')) {
                userIcon.classList.remove('active')
                this.headerEl.removeChild(this.dropdownMenu.renderNotAuth())
            }
        }
        if (
            !element.closest('.drop-down-menu') &&
            !element.classList.contains('ico_user-light') &&
            !element.classList.contains('ico_close')
        ) {
            if (userIconLight && userIconLight.classList.contains('active')) {
                userIconLight.classList.remove('active')
                this.headerEl.removeChild(this.dropdownMenu.renderNotAuth())
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
        header.className = 'border-solid border-b border-color-border-header sticky top-0 header'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: '/flows' + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
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

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer, this.footerEl)
    }
}
