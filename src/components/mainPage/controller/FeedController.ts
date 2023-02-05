import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FeedViewInstance } from '@/components/mainPage/views/FeedView'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import { FireBaseAPIInstance, Firestore, Auth } from '@/utils/FireBaseAPI'

export class FeedController {
    private view: FeedViewInstance
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private db: Firestore
    private auth: Auth

    constructor(
        view: FeedViewInstance,
        models: { pageModel: PageModelInstance; feedModel: FeedModelInstance },
        private api: FireBaseAPIInstance
    ) {
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.view = view
        this.db = api.db
        this.auth = api.auth
        this.api.on('CHANGE_AUTH', (user) => {
            console.log('смена: ', user)
        })
    }
}
