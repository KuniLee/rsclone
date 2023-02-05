import { ParsedQuery } from 'query-string'
import EventEmitter from 'events'

export type URLParams = {
    path: string[]
    search: ParsedQuery
}

export interface rootModel extends EventEmitter {
    path: Array<string>
    search: ParsedQuery
    lang: 'ru' | 'en'
}
