import EventEmitter from 'events'
import type { PageModel } from '../models/PageModel'
import authTemplate from '../../templates/authPage.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { AuthModelInstance } from '@/components/models/AuthModel'

type ItemViewEventsName = 'GOTO'

export type AuthViewInstance = InstanceType<typeof AuthView>

export class AuthView extends EventEmitter {
    private model: PageModel
    private authModel: AuthModelInstance

    constructor(model: PageModel, authModel: AuthModelInstance) {
        super()
        this.model = model
        this.authModel = authModel
        this.model.on('CHANGE_PAGE', () => {
            if (this.model.path[0] === Paths.Auth) this.buildPage()
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private buildPage() {
        const mainContainer = document.querySelector('.main')
        if (mainContainer) {
            mainContainer.innerHTML = authTemplate({})
        }
    }
}
