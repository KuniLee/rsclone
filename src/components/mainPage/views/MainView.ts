import { PopupSettings } from './../../../utils/popupSettings'
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
        const nav = document.querySelector('.nav')
        if (nav) {
            nav.addEventListener('click', (ev) => {
                if (ev.target instanceof HTMLAnchorElement) {
                    const pathname = ev.target.href
                    if (!pathname.includes(Paths.Auth) && !pathname.includes(Paths.Registration)) {
                        ev.preventDefault()
                        this.setActiveLink(nav.children, ev.target)
                        this.emit<string>('GOTO', ev.target.href)
                    }
                }
            })
        }
        document.body.addEventListener('click', (ev) => {
            if (ev.target instanceof HTMLElement) {
                this.toggleDropdownMenu(ev.target)
                this.togglePopupSettings(ev.target)
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

    private toggleDropdownMenu(element: HTMLElement) {
        const user = document.querySelector('.ico_user')
        if (element === user) {
            element.classList.toggle('active')
            if (element.classList.contains('active')) {
                this.headerEl.appendChild(this.dropdownMenu.renderNotAuth())
            } else {
                this.headerEl.removeChild(this.dropdownMenu.renderNotAuth())
            }
        }
        if (!element.closest('.drop-down-menu') && element !== user) {
            if (user && user.classList.contains('active')) {
                user.classList.remove('active')
                this.headerEl.removeChild(this.dropdownMenu.renderNotAuth())
            }
        }
    }

    private setActiveLink(links: HTMLCollection, currentLink: HTMLElement) {
        Array.from(links).forEach((link) => {
            if (link !== currentLink) link.classList.replace('text-[#333]', 'text-[#909090]')
            currentLink.classList.replace('text-[#909090]', 'text-[#333]')
        })
    }

    private renderHeader() {
        const header = document.createElement('header')
        header.className = 'border-solid border-b-[1px] border-[#dedede] sticky top-0 bg-white'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: '/flows' + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        header.innerHTML = headerTemplate({ flows })
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
