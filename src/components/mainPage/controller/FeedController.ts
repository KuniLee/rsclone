import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FeedViewInstance } from '@/components/mainPage/views/FeedView'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import {
    Auth,
    collection,
    doc,
    FireBaseAPIInstance,
    FirebaseStorage,
    Firestore,
    getDoc,
    getDocs,
    getDownloadURL,
    limit,
    orderBy,
    query,
    ref,
    where,
} from '@/utils/FireBaseAPI'
import type { QueryConstraint } from 'firebase/firestore'
import { Article, UserData } from 'types/types'
import { Flows } from 'types/enums'
import { URLParams } from 'types/interfaces'
import { ArticleViewInstance } from '@/components/mainPage/views/ArticleView'

export class FeedController {
    private view: FeedViewInstance
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance
    private readonly db: Firestore
    private readonly auth: Auth
    private readonly storage: FirebaseStorage
    private articleView: ArticleViewInstance

    constructor(
        views: { feedView: FeedViewInstance; articleView: ArticleViewInstance },
        models: { pageModel: PageModelInstance; feedModel: FeedModelInstance },
        private api: FireBaseAPIInstance
    ) {
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.view = views.feedView
        this.articleView = views.articleView
        this.db = api.db
        this.auth = api.auth
        this.storage = api.storage
        this.view.on<Flows>('LOAD_ARTICLES', async (flow) => {
            if (flow) this.feedModel.setFlow = flow
            else this.feedModel.setFlow = Flows.All
            this.feedModel.addArticles(await this.loadArticles())
        })
        this.articleView.on<string>('LOAD_POST', async (id) => {
            const article = await this.loadArticle(id)
            if (article) this.feedModel.setArticle(article as Article)
            else this.pageModel.goTo404()
        })
        this.view.on<URLParams>('GO_TO', (path) => {
            this.pageModel.changePage(path)
        })
    }

    private async loadArticle(id: string) {
        const article = await getDoc(doc(this.db, 'articles', id))
        return article.exists() ? await article.data() : undefined
    }

    private async loadArticles() {
        const queryConstants: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(5)]
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
        return await Promise.all(articles.map((article) => this.downloadImage(article)))
    }

    private async downloadImage(article: Article) {
        const [user, image] = await Promise.all([
            (await getDoc(doc(this.db, 'users', article.userId))).data(),
            getDownloadURL(ref(this.storage, article.preview.image)),
        ])
        article.preview.image = image
        article.user = user as UserData
        return article
    }

    private async downloadArticleData(article: Article) {
        const [user, image] = await Promise.all([
            (await getDoc(doc(this.db, 'users', article.userId))).data(),
            getDownloadURL(ref(this.storage, article.preview.image)),
        ])
        article.preview.image = image
        article.user = user as UserData
        return article
    }
}
