import { createBrowserHistory } from 'history'
import queryString from 'query-string'

import EventEmitter from 'events'
import { URLParams } from 'types/interfaces'

type RouterEventsName = 'ROUTE'

const history = createBrowserHistory()

export type RouterInstance = InstanceType<typeof Router>

export class Router extends EventEmitter {
    public pathParts: Array<string> = []

    constructor() {
        super()
        history.listen(({ location, action }) => {
            if (action !== 'REPLACE') this.init()
        })
    }

    getPathArray(url: string) {
        const pathname = new URL(url).pathname
        return Array.from(pathname.match(/\/[a-z0-9]+/gi) || ['/'])
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

    init() {
        const path = this.getPathArray(location.href)
        const search = this.getParsedSearch(location.href)
        this.emit<URLParams>('ROUTE', { path, search })
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
}
