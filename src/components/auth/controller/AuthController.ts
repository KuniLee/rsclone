import { RouterInstance } from '@/utils/Rooter'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import { AuthViewInstance } from '@/components/auth/views/AuthView'
import { URLParams } from 'types/interfaces'

export class AuthController {
    private router: RouterInstance
    private authModel: AuthModelInstance
    private authView: AuthViewInstance

    constructor(view: AuthViewInstance, model: AuthModelInstance, router: RouterInstance) {
        this.authModel = model
        this.authView = view
        this.router = router
        router.on<URLParams>('ROUTE', (arg) => {
            model.changePage(arg)
        })
        view.on<string>('GOTO', (arg) => {
            console.log(arg)
            model.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        model.on('CHANGE_PAGE', () => {
            this.router.replace(
                this.router.createPathQuery({ path: this.authModel.path, search: this.authModel.search })
            )
        })
        router.init()
        this.authView.on('LOGIN', (arg, data) => {
            if (data.email && data.password) {
                this.authModel.signInUser(data.email, data.password)
            }
        })
        this.authView.on('SIGN_UP', (arg, data) => {
            console.log(data)
            this.authModel.signUpUser(data)
        })
    }
}
