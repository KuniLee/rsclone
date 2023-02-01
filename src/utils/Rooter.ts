import { createBrowserHistory } from 'history'
import type { Location, Search } from 'history'
import queryString from 'query-string'

import EventEmitter from 'events'

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

    getPathArray(pathname: string) {
        return Array.from(pathname.match(/\/[a-z0-9]+/gi) || ['/'])
    }

    init() {
        const path = this.getPathArray(location.pathname)
        this.emit<string[]>('ROUTE', path)
    }

    emit<T>(event: RouterEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    push(path: string) {
        history.push(path)
    }
    replace(path: string) {
        history.replace(path)
    }
}
