import { createBrowserHistory } from 'history'
import queryString from 'query-string'

import EventEmitter from 'events'
import { URLParams } from 'types/interfaces'
import { rootModel } from 'types/interfaces'

type RouterEventsName = 'ROUTE'

const history = createBrowserHistory()

export type RouterInstance = InstanceType<typeof Router>

export class Router extends EventEmitter {
    private loaded = false

    constructor(private model: rootModel) {
        super()
        history.listen(({ action }) => {
            if (action === 'POP') {
                this.replace(this.createPathQuery(this.getParams()))
                this.emit<URLParams>('ROUTE', this.getParams())
            }
        })
        model.on('CHANGE_PAGE', this.change.bind(this))
        model.on('SHOW_FEED', this.change.bind(this))
    }

    private change() {
        const { path, search } = this.model
        const oldParams = this.createPathQuery(this.getParams())
        const newParams = this.createPathQuery({ path, search })
        if (!this.loaded) {
            this.replace(newParams)
            this.loaded = true
        } else if (oldParams === newParams) this.replace(newParams)
        else this.push(newParams)
    }

    getPathArray(url: string) {
        const pathname = new URL(url).pathname
        return Array.from(pathname.match(/\/[A-z0-9_-]+/gi) || ['/'])
    }

    getParsedSearch(url: string) {
        return queryString.parse(queryString.extract(url))
    }

    createPathQuery(urlParams: URLParams) {
        const queryStr = queryString.stringify(urlParams.search)
        let pathQuery = urlParams.path.join('')
        if (queryStr) pathQuery = pathQuery + `?${queryString.stringify(urlParams.search)}`
        return pathQuery
    }

    getParams(): URLParams {
        const path = this.getPathArray(location.href)
        const search = this.getParsedSearch(location.href) || {}
        return { path, search }
    }

    emit<T>(event: RouterEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: RouterEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    push(pathQuery: string) {
        history.push(pathQuery)
    }

    replace(pathQuery: string) {
        history.replace(pathQuery)
    }

    isSameDomain(link: string) {
        return new URL(link).hostname === location.hostname
    }
}
