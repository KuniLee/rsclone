import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FeedViewInstance } from '@/components/mainPage/views/FeedView'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import {
    Auth,
    collection,
    FireBaseAPIInstance,
    FirebaseStorage,
    Firestore,
    getDocs,
    getDownloadURL,
    limit,
    orderBy,
    query,
    ref,
    where,
} from '@/utils/FireBaseAPI'
import type { QueryConstraint } from 'firebase/firestore'
import { Article } from 'types/types'
import { Flows } from 'types/enums'

export class FeedController {
    private view: FeedViewInstance
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private readonly db: Firestore
    private readonly auth: Auth
    private storage: FirebaseStorage

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
        this.storage = api.storage
        this.view.on<Flows>('LOAD_ARTICLES', async (flow) => {
            if (flow) this.feedModel.setFlow = flow
            else this.feedModel.setFlow = Flows.All
            this.feedModel.addArticles(await this.loadArticles())
        })
    }

    private async loadArticles() {
        const queryConstants: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(1)]
        if (this.feedModel.currentFlow !== Flows.All)
            queryConstants.push(where('flow', '==', this.feedModel.currentFlow?.slice(1)))
        const ref = collection(this.db, 'articles')
        const querySnapshot = await getDocs(query(ref, ...queryConstants))
        const articles: Array<Article> = []
        querySnapshot.forEach((doc) => {
            const article = doc.data() as Article
            articles.push({ ...article, id: doc.id })
        })
        this.feedModel.latestArticle = querySnapshot.docs[querySnapshot.docs.length - 1]
        console.log(articles)
        return await Promise.all(articles.map((article) => this.downloadImage(article)))
    }

    private async downloadImage(article: Article) {
        article.preview.image = await getDownloadURL(ref(this.storage, article.preview.image))
        return article
    }
}
