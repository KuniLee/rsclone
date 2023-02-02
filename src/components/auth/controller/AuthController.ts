import { RouterInstance } from '@/utils/Rooter'
import { AuthModelInstance } from '@/components/auth/model/AuthModel'
import { AuthViewInstance } from '@/components/auth/views/AuthView'

export class AuthController {
    private router: RouterInstance
    private authModel: AuthModelInstance
    private authView: AuthViewInstance

    constructor(view: AuthViewInstance, model: AuthModelInstance, router: RouterInstance) {
        this.authModel = model
        this.authView = view
        this.router = router
        router.on('ROUTE', (arg) => {
            model.changePage(arg)
        })
        view.on<string>('GOTO', (arg, data) => {
            if (!arg && data) {
                if (data.path && data.query) {
                    console.log(data.path)
                    this.router.replace(data.path + '.html' + data.query)
                    model.changePage([data.path, data.query])
                }
            } else {
                model.changePage(this.router.getPathArray(arg + '.html'))
            }
        })
        model.on('CHANGE_PAGE', () => {
            this.router.replace(this.authModel.path.join(''))
        })
        router.init()
        this.authView.on('LOGIN', (arg, data) => {
            if (data.email && data.password) {
                this.authModel.signInUser(data.email, data.password)
            }
        })
    }
}
