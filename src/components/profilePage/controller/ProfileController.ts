import { UserData } from 'types/types'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { collection, FireBaseAPIInstance, Firestore, getDocs, query, where } from '@/utils/FireBaseAPI'
import { Auth, getAuth, User } from 'firebase/auth'
import { ProfileModelInstance } from '../model/ProfileModel'
import { ProfileViewInstance } from './../view/ProfileView'

export class ProfileController {
    private view: ProfileViewInstance
    private profileModel: ProfileModelInstance
    private pageModel: PageModelInstance
    private db: Firestore
    private auth: Auth

    constructor(
        view: ProfileViewInstance,
        private models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance },
        private api: FireBaseAPIInstance
    ) {
        this.db = api.db
        this.auth = api.auth
        this.view = view
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.view.on('LOAD_USER_INFO', async (username: User['displayName']) => {
            const userInfo = await this.getUserInfo(username)
            if (!userInfo) this.pageModel.goTo404()
            else this.profileModel.setUserInfo = userInfo
        })
    }

    private async getUserInfo(username: User['displayName']) {
        try {
            const q = query(collection(this.db, 'users'), where('displayName', '==', username))
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty) return querySnapshot.docs[0].data() as UserData
        } catch (error) {
            console.log('Error fetching user data:', error)
        }
    }
}
