import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerTemplate from '@/templates/header.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'

type ItemViewEventsName = 'GOTO'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private model: PageModel
    private headerEl: HTMLElement
    private mainPageContainer: HTMLElement

    constructor(model: PageModel) {
        super()
        this.model = model
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
        const links: HTMLElement[] = []
        this.headerEl.addEventListener('click', (ev) => {
            if (ev.target instanceof HTMLAnchorElement) {
                const pathname = ev.target.href
                if (!pathname.includes(Paths.Auth) && !pathname.includes(Paths.Registration)) {
                    ev.preventDefault()
                    this.emit<string>('GOTO', ev.target.href)
                    this.setActiveLink(links, ev.target)
                }
                this.setActiveLink(links, ev.target)
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private setActiveLink(links: HTMLElement[], currentLink: HTMLAnchorElement) {
        if (!links.includes(currentLink)) {
            links.push(currentLink)
            links[links.length - 1].classList.replace('text-[#909090]', 'text-[#000000]')
            links.slice(0, links.length - 1).forEach((link) => {
                link.classList.replace('text-[#000000]', 'text-[#909090]')
                links.splice(0, 1)
            })
        }
    }

    private renderHeader() {
        const header = document.createElement('header')
        header.className = 'border-solid border-b-[1px] border-[#dedede] sticky top-0'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: '/flows' + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        flows.push({ name: dictionary.buttons.Auth[this.model.lang], link: Paths.Auth })
        flows.push({ name: dictionary.buttons.Registration[this.model.lang], link: Paths.Registration })
        header.innerHTML = headerTemplate({ flows })
        return header
    }

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer)
    }
}
