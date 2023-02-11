import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FireBaseAPIInstance } from '@/utils/FireBaseAPI'
import { RouterInstance } from '@/utils/Rooter'
import { ProfileModelInstance } from '../model/ProfileModel'
import { ProfileViewInstance } from './../view/ProfileView'

export class ProfileController {
    private view: ProfileViewInstance
    private profileModel: ProfileModelInstance
    private pageModel: PageModelInstance

    constructor(
        view: ProfileViewInstance,
        private models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance },
        private router: RouterInstance,
        private api: FireBaseAPIInstance
    ) {
        this.view = view
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.router = router
        this.router.on('ROUTE', () => {
            this.pageModel.changePage(this.router.getParams())
        })
    }
}
