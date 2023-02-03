import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'

type EditorModelEventsName = 'CHANGE_PAGE' | '404'
export type EditorModelInstance = InstanceType<typeof EditorModel>

export class EditorModel extends EventEmitter {
    public path: Array<string> = []
    public lang: 'ru' | 'en' = 'ru'
    public search: ParsedQuery<string> = {}

    constructor() {
        super()
    }

    on<T>(event: EditorModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: EditorModelEventsName) {
        return super.emit(event)
    }
}
