import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { MainViewInstance } from '@/components/mainPage/views/MainView'
import { rootModel, URLParams } from 'types/interfaces'

export class AppController {
    private router: RouterInstance
    private model: PageModelInstance
    private view: MainViewInstance

    constructor(view: MainViewInstance, model: PageModelInstance, router: RouterInstance) {
        this.model = model
        this.view = view
        this.router = router
        view.on<string>('GOTO', (arg) => {
            model.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        view.on<rootModel['lang']>('CHANGE_LANG', (lang) => model.changeLang(lang))
        router.on('ROUTE', () => {
            model.changePage(this.router.getParams())
        })
    }
}
