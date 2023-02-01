import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/models/PageModel'
import { MainViewInstance } from '@/components/views/MainView'

export class AppController {
    private router: RouterInstance
    private model: PageModelInstance
    private view: MainViewInstance

    constructor(view: MainViewInstance, model: PageModelInstance, router: RouterInstance) {
        this.model = model
        this.view = view
        this.router = router
        router.on('ROUTE', (arg) => {
            model.changePage(arg)
        })
        view.on<string>('GOTO', (arg) => {
            model.changePage(this.router.getPathArray(arg))
        })
        model.on('CHANGE_PAGE', () => {
            this.router.replace(this.model.path.join(''))
        })
        router.init()
    }
}
