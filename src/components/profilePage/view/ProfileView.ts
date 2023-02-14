import EventEmitter from 'events'
import { ProfileModelInstance } from './../model/ProfileModel'
import { PageModelInstance } from './../../mainPage/model/PageModel'
import { Paths } from '@/types/enums'
import profilePageTemplate from '@/templates/profilePage.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import emptyAvatar from '@/assets/icons/avatar.svg'
import preloader from '@/templates/preloader.html'
import { User } from 'firebase/auth'

type ProfileViewEventsName = 'GOTO' | 'LOAD_USER_INFO'

export type ProfileViewInstance = InstanceType<typeof ProfileView>

export class ProfileView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private profileModel: ProfileModelInstance

    constructor(models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.pageModel.on('CHANGE_PAGE', () => {
            const path = this.pageModel.path
            if (path.length === 2 && path[0] === Paths.UsersList) {
                const username = this.pageModel.path[1].slice(1)
                this.showPreloader()
                this.emit<User['displayName']>('LOAD_USER_INFO', username)
            }
        })
        this.profileModel.on('USER_INFO_LOADED', () => {
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
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = ''
        const profilePage = this.createPage()
        this.mainPageContainer.append(profilePage)
        this.addListeners(profilePage)
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
        const profilePageWrapper = document.createElement('div')
        const registeredDate = this.profileModel.userInfo?.createdAt.toDate().toLocaleDateString()
        profilePageWrapper.className = 'profile sm:container mx-auto'
        profilePageWrapper.innerHTML = profilePageTemplate({
            words: getWords(Dictionary.ProfilePage, this.pageModel.lang),
            user: this.profileModel.userInfo,
            registeredDate,
            emptyAvatar,
        })
        return profilePageWrapper
    }

    private showPreloader() {
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = preloader
    }
}
