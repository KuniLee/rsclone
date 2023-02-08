import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { MainViewInstance } from '@/components/mainPage/views/MainView'
import { SettingsViewInstance } from '@/components/mainPage/views/SettingsView'

export class AppController {
    private router: RouterInstance
    private model: PageModelInstance
    private view: MainViewInstance
    private settingsView: SettingsViewInstance

    constructor(
        view: { mainView: MainViewInstance; settingsView: SettingsViewInstance },
        model: PageModelInstance,
        router: RouterInstance
    ) {
        this.model = model
        this.view = view.mainView
        this.settingsView = view.settingsView
        this.router = router
        this.view.on<string>('GOTO', (arg) => {
            model.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        router.on('ROUTE', () => {
            model.changePage(this.router.getParams())
        })
    }
}
