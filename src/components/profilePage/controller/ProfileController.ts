import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FireBaseAPIInstance } from '@/utils/FireBaseAPI'
import { ProfileModelInstance } from '../model/ProfileModel'
import { ProfileViewInstance } from './../view/ProfileView'

export class ProfileController {
    private view: ProfileViewInstance
    private profileModel: ProfileModelInstance
    private pageModel: PageModelInstance

    constructor(
        view: ProfileViewInstance,
        private models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance },
        private api: FireBaseAPIInstance
    ) {
        this.view = view
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
    }
}
