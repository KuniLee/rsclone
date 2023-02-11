import EventEmitter from 'events'
import { ProfileModelInstance } from './../model/ProfileModel'
import { PageModelInstance } from './../../mainPage/model/PageModel'
import { Paths } from '@/types/enums'
import profilePageTemplate from '@/templates/profilePage.hbs'

type ProfileViewEventsName = 'GOTO'

export type ProfileViewInstance = InstanceType<typeof ProfileView>

export class ProfileView extends EventEmitter {
    private mainPageContainer: HTMLElement
    private pageModel: PageModelInstance
    private profileModel: ProfileModelInstance

    constructor(models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.pageModel.on('CHANGE_PAGE', () => {
            this.renderPage()
        })
        this.pageModel.on('SIGN_IN', () => {
            this.renderPage()
        })
    }

    emit<T>(event: ProfileViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ProfileViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private renderPage() {
        if (
            !(
                this.pageModel.path.length === 2 &&
                this.pageModel.path[0] === Paths.UsersList &&
                this.pageModel.path[1] === '/' + this.pageModel.user.displayName
            )
        )
            return
        this.mainPageContainer.innerHTML = profilePageTemplate({})
    }
}
