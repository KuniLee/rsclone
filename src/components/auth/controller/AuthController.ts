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
        view.on<string>('GOTO', (arg) => {
            console.log('test')
            model.changePage(this.router.getPathArray(arg))
        })
        model.on('CHANGE_PAGE', () => {
            this.router.replace(this.authModel.path.join(''))
        })
        router.init()
    }
}
