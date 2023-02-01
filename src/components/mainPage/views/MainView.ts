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
        this.mainPageContainer.className = 'bg-[#f0f0f0] flex-grow'
        this.addListeners()
        this.show()
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
        this.headerEl.addEventListener('click', (ev) => {
            if (ev.target instanceof HTMLAnchorElement) {
                if (!ev.target.href.includes('.html')) {
                    ev.preventDefault()
                    this.emit<string>('GOTO', new URL(ev.target.href).pathname)
                }
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private renderHeader() {
        const header = document.createElement('header')
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: '/flows' + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        flows.push({ name: dictionary.buttons.Auth[this.model.lang], link: Paths.Auth })
        header.innerHTML = headerTemplate({ flows })
        return header
    }

    private show() {
        document.body.append(this.headerEl, this.mainPageContainer)
    }
}
