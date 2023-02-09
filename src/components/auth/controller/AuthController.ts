import { RouterInstance } from '@/utils/Rooter'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import { AuthViewInstance } from '@/components/auth/views/AuthView'
import { URLParams } from 'types/interfaces'
import { FireBaseAPIInstance, Auth, User, serverTimestamp, Firestore, doc, setDoc } from '@/utils/FireBaseAPI'
import { Paths } from 'types/enums'
import { AuthViewTypes } from 'types/types'

export class AuthController {
    private readonly auth: Auth
    private readonly db: Firestore

    constructor(
        private view: AuthViewInstance,
        private model: AuthModelInstance,
        private router: RouterInstance,
        private api: FireBaseAPIInstance
    ) {
        this.router = router
        this.auth = api.auth
        this.db = api.db
        router.on<URLParams>('ROUTE', (arg) => {
            this.model.changePage(arg)
        })
        view.on<string>('GOTO', (arg) => {
            model.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        this.view.on('LOGIN', (arg, data) => {
            if (data.email && data.password) {
                this.signInUser(data.email, data.password)
            }
        })
        this.view.on('SIGN_UP', (arg, data) => {
            this.signUpUser(data)
        })
    }

    private async signInUser(email: string, password: string) {
        const result = await this.api.signIn(email, password)
        if (result) this.model.changePage({ path: [Paths.Root], search: {} })
        else this.model.emit('WRONG_DATA')
    }

    async signUpUser(data: AuthViewTypes) {
        if (data.email && data.password && data.nick) {
            const checkExistEmail = await this.api.checkEmailInDatabase(data.email)
            if (checkExistEmail.length === 0) {
                const result = await this.api.signUp(data.email, data.password, data.nick)
                if (!(typeof result === 'boolean')) {
                    await this.addUserToDataBase(result)
                    this.model.emit('USER_SIGNED_UP')
                }
            } else this.model.emit('EMAIL_EXIST')
        }
    }

    private async addUserToDataBase(user: User) {
        const data = {
            email: user.email,
            displayName: user.displayName,
            createdAt: serverTimestamp(),
            properties: {
                about: '',
                fullName: '',
                avatar: '',
            },
        }
        return await setDoc(doc(this.db, 'users', user.uid), data)
    }
}
