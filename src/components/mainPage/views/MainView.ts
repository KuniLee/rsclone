import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerTemplate from '@/templates/header.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { DropdownMenu } from '@/utils/dropdownMenu'

type ItemViewEventsName = 'GOTO'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private model: PageModel
    private headerEl: HTMLElement
    private mainPageContainer: HTMLElement
    private dropDownMenu: DropdownMenu

    constructor(model: PageModel) {
        super()
        this.model = model
        this.dropDownMenu = new DropdownMenu(this.model)
        this.headerEl = this.renderHeader()
        this.mainPageContainer = document.createElement('main')
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
        const user = document.querySelector('.ico_user')
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
                if (ev.target === user) {
                    ev.target.classList.toggle('active')
                    if (ev.target.classList.contains('active')) {
                        this.headerEl.appendChild(this.dropDownMenu.renderNotAuth())
                    } else {
                        this.headerEl.removeChild(this.dropDownMenu.renderNotAuth())
                    }
                }
                if (!ev.target.closest('.drop-down-menu') && ev.target !== user) {
                    if (user && user.classList.contains('active')) {
                        user.classList.remove('active')
                        this.headerEl.removeChild(this.dropDownMenu.renderNotAuth())
                    }
                }
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private setActiveLink(links: HTMLCollection, currentLink: HTMLElement) {
        Array.from(links).forEach((link) => {
            if (link !== currentLink) link.classList.replace('text-[#000000]', 'text-[#909090]')
            currentLink.classList.replace('text-[#909090]', 'text-[#000000]')
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

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer)
    }
}
