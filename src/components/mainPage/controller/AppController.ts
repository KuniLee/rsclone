import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { MainViewInstance } from '@/components/mainPage/views/MainView'
import { SettingsViewInstance } from '@/components/mainPage/views/SettingsView'
import { FireBaseAPI, Auth, User, getDoc, doc, Firestore, updateDoc } from '@/utils/FireBaseAPI'
import { UserData } from 'types/types'

export class AppController {
    private router: RouterInstance
    private model: PageModelInstance
    private view: MainViewInstance
    private settingsView: SettingsViewInstance
    private auth: Auth
    private db: Firestore

    constructor(
        view: { mainView: MainViewInstance; settingsView: SettingsViewInstance },
        model: PageModelInstance,
        router: RouterInstance,
        api: FireBaseAPI
    ) {
        this.model = model
        this.view = view.mainView
        this.settingsView = view.settingsView
        this.auth = api.auth
        this.db = api.db
        this.router = router
        this.view.on<string>('GOTO', this.goTo.bind(this))
        this.settingsView.on<string>('GOTO', this.goTo.bind(this))
        this.settingsView.on<UserData>('SAVE_SETTINGS', this.uploadUserData.bind(this))
        router.on('ROUTE', () => {
            model.changePage(this.router.getParams())
        })

        api.on<User>('CHANGE_AUTH', async (user) => {
            const userData = await this.getUserData(user)
            this.model.changeAuth(userData)
        })
    }

    private goTo(path: string) {
        this.model.changePage({
            path: this.router.getPathArray(path),
            search: this.router.getParsedSearch(path),
        })
    }

    private async getUserData({ uid }: User) {
        try {
            const result = await getDoc(doc(this.db, `users/${uid}`))
            const data = await result.data()
            return { ...data, uid } as UserData
        } catch (e) {
            console.log(e)
        }
    }

    private async uploadUserData(userData: UserData) {
        const newData = { ...userData }
        Reflect.deleteProperty(newData, 'uid')
        try {
            await updateDoc(doc(this.db, `users/${userData.uid}`), newData)
        } catch (e) {
            console.log(e)
        }
    }
}
