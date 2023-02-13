import EventEmitter from 'events'
import { ProfileModelInstance } from './../model/ProfileModel'
import { PageModelInstance } from './../../mainPage/model/PageModel'
import { Paths } from '@/types/enums'
import profilePageTemplate from '@/templates/profilePage.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import { UserData } from '@/types/types'
import emptyAvatar from '@/assets/icons/avatar.svg'

type ProfileViewEventsName = 'GOTO'

export type ProfileViewInstance = InstanceType<typeof ProfileView>

export class ProfileView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private profileModel: ProfileModelInstance
    private user: UserData | null = null

    constructor(models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.pageModel.on('CHANGE_PAGE', () => {
            this.buildPage()
        })
    }

    emit<T>(event: ProfileViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ProfileViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private buildPage() {
        if (
            !(
                this.pageModel.path.length === 2 &&
                this.pageModel.path[0] === Paths.UsersList &&
                this.pageModel.path[1] === '/' + this.pageModel.user.displayName
            )
        )
            return
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = ''
        const profilePage = this.createPage()
        this.mainPageContainer.append(profilePage)
        this.addListeners(profilePage)
    }

    private convertTimeStampToDate({ sec, nanosec }: Record<string, number>) {
        return new Date(sec * 1000 + nanosec / 1000000).toLocaleDateString()
    }

    private addListeners(pageWrapper: HTMLElement) {
        const usernameEl = pageWrapper.querySelector('.username')
        if (usernameEl && usernameEl instanceof HTMLAnchorElement) {
            usernameEl.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit<string>('GOTO', usernameEl.href)
            })
        }
    }

    private createPage() {
        const pageWrapper = document.createElement('div')
        const registeredDate = this.convertTimeStampToDate({
            sec: this.pageModel.user.createdAt.seconds,
            nanosec: this.pageModel.user.createdAt.nanoseconds,
        })
        pageWrapper.className = 'sm:container mx-auto'
        pageWrapper.innerHTML = profilePageTemplate({
            words: getWords(Dictionary.ProfilePage, this.pageModel.lang),
            user: this.pageModel.user,
            registeredDate,
            emptyAvatar,
        })
        return pageWrapper
    }
}
