import EventEmitter from 'events'
import { ProfileModelInstance } from './../model/ProfileModel'
import { PageModelInstance } from './../../mainPage/model/PageModel'
import { Paths } from '@/types/enums'
import profilePageTemplate from '@/templates/profilePage.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import { UserData } from '@/types/types'
import emptyAvatar from '@/assets/icons/avatar.svg'

export type ProfileViewInstance = InstanceType<typeof ProfileView>

export class ProfileView extends EventEmitter {
    private mainPageContainer: HTMLElement
    private pageModel: PageModelInstance
    private profileModel: ProfileModelInstance
    private user: UserData | null = null

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

    private renderPage() {
        if (
            !(
                this.pageModel.path.length === 2 &&
                this.pageModel.path[0] === Paths.UsersList &&
                this.pageModel.path[1] === '/' + this.pageModel.user.displayName
            )
        )
            return
        this.mainPageContainer.innerHTML = ''
        this.user = this.pageModel.user
        const registeredDate = this.convertTimeStampToDate({
            sec: this.pageModel.user.createdAt.seconds,
            nanosec: this.pageModel.user.createdAt.nanoseconds,
        })
        const pageWrapper = document.createElement('div')
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = profilePageTemplate({
            words: getWords(Dictionary.ProfilePage, this.pageModel.lang),
            user: this.user,
            registeredDate,
            emptyAvatar,
        })
        this.mainPageContainer.append(pageWrapper)
    }

    private convertTimeStampToDate({ sec, nanosec }: Record<string, number>) {
        return new Date(sec * 1000 + nanosec / 1000000).toLocaleDateString()
    }
}
