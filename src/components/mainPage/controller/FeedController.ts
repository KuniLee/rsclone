import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FeedViewInstance } from '@/components/mainPage/views/FeedView'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import { FireBaseAPIInstance, Firestore, Auth, collection, getDocs } from '@/utils/FireBaseAPI'
import { Article } from 'types/types'

export class FeedController {
    private view: FeedViewInstance
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private readonly db: Firestore
    private readonly auth: Auth

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
        this.view.on('LOAD_ARTICLES', async () => {
            console.log(this.pageModel.path[0])
            this.feedModel.setArticles(await this.loadArticles())
        })
        this.view.on<File>('LOAD_IMAGE', (file) => {
            this.loadImage(file)
        })
    }

    private async loadArticles() {
        const ref = collection(this.db, 'articles')
        const querySnapshot = await getDocs(ref)
        const articles: Array<Article> = []
        querySnapshot.forEach((doc) => {
            const article = doc.data() as Article
            articles.push({ ...article, id: doc.id })
        })
        return articles
    }

    private loadImage(file: File) {
        console.log(file)
    }
}
