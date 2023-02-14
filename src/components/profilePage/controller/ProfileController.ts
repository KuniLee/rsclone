import { UserData } from 'types/types'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { doc, FireBaseAPIInstance, Firestore, getDoc } from '@/utils/FireBaseAPI'
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
            this.profileModel.setUserInfo = userInfo
        })
    }

    get currentUser() {
        const auth = getAuth()
        return auth.currentUser
    }

    private async getUserInfo(username: User['displayName']) {
        const user = this.currentUser
        if (user) {
            const uid = user.uid
            if (user && user.displayName === username) {
                const docRef = doc(this.db, `users/${uid}`)
                try {
                    const docSnap = await getDoc(docRef)
                    return { ...docSnap.data() } as UserData
                } catch (error) {
                    console.log('Error fetching user data:', error)
                }
            }
        }
    }
}
