import dictionary, { getWords } from '@/utils/dictionary'
import EventEmitter from 'events'
import { PageModel } from '@/components/mainPage/model/PageModel'
import { Paths } from 'types/enums'
import commentTemplate from '@/templates/comment.hbs'
import emptyAvatar from '@/assets/icons/avatar.svg'

export type CommentEventsName = ''

export class Comment extends EventEmitter {
    constructor() {
        super()
    }

    emit<T>(event: CommentEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: CommentEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    render() {
        const template = document.createElement('template')
        // template.innerHTML = commentTemplate({ user, emptyAvatar })
        return template.content
    }
}
