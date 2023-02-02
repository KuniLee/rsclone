import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { MainViewInstance } from '@/components/mainPage/views/MainView'
import { URLParams } from 'types/interfaces'

export class AppController {
    private router: RouterInstance
    private model: PageModelInstance
    private view: MainViewInstance

    constructor(view: MainViewInstance, model: PageModelInstance, router: RouterInstance) {
        this.model = model
        this.view = view
        this.router = router
        router.on<URLParams>('ROUTE', (arg) => {
            model.changePage(arg)
        })
        view.on<string>('GOTO', (arg) => {
            model.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        model.on('CHANGE_PAGE', () => {
            this.router.replace(this.router.createPathQuery({ path: this.model.path, search: this.model.search }))
        })
        router.init()
    }
}
