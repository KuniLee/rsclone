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
import { QueryConstraint, DocumentReference, setDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore'
import { Flows, Paths } from 'types/enums'
import { Article, URLParams } from 'types/interfaces'
import { ArticleViewInstance } from '@/components/mainPage/views/ArticleView'
import { RouterInstance } from '@/utils/Rooter'
import { CommentInfo, ParsedData } from 'types/types'

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
        private router: RouterInstance,
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
            const comments = await this.loadComments(id)
            if (article) {
                this.feedModel.setArticle(article)
                if (comments) this.feedModel.setComments(comments)
            } else {
                this.pageModel.goTo404()
            }
        })
        this.view.on<URLParams>('GO_TO', (path) => {
            this.pageModel.changePage(path)
        })
        this.articleView.on<string>('GO_TO', this.goTo.bind(this))
        this.articleView.on<ParsedData>('PARSED_COMMENT', async (comment) => {
            const article = this.feedModel.article
            if (article) {
                await this.addComment(comment, article.id)
                const comments = await this.loadComments(article.id)
                if (comments) this.feedModel.setComments(comments)
            }
        })
    }

    private async loadArticle(id: string): Promise<Article | undefined> {
        try {
            const snapshot = await getDoc<Article>(doc(this.db, 'articles', id) as DocumentReference<Article>)
            if (!snapshot.exists()) return
            const article = await this.api.downloadArticleData(await snapshot.data())
            const imageBlocks = article.blocks.filter((el) => el.imageSrc !== undefined)
            await Promise.all(
                imageBlocks.map(async (block) => {
                    try {
                        block.imageSrc = await getDownloadURL(ref(this.storage, block.imageSrc))
                    } catch (e) {
                        console.log(e)
                        block.imageSrc = ''
                    }
                })
            )
            return { ...article, id }
        } catch (e) {
            console.log(e)
        }
    }

    private async loadArticles() {
        const queryConstants: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(250)]
        if (this.feedModel.currentFlow !== Flows.All)
            queryConstants.push(where('flows', 'array-contains', this.feedModel.currentFlow?.slice(1)))
        const ref = collection(this.db, 'articles')
        const querySnapshot = await getDocs(query(ref, ...queryConstants))
        const articles: Array<Article> = []
        querySnapshot.forEach((doc) => {
            const article = doc.data() as Article
            articles.push({ ...article, id: doc.id })
        })
        this.feedModel.latestArticle = querySnapshot.docs[querySnapshot.docs.length - 1]
        return await Promise.all(articles.map((article) => this.api.downloadArticleData(article)))
    }

    private goTo(path: string) {
        const lastHref = '/' + path.split('/').slice(-1).join('')
        if (this.router.isSameDomain(path) && lastHref !== Paths.Auth) {
            this.pageModel.changePage({
                path: this.router.getPathArray(path),
                search: this.router.getParsedSearch(path),
            })
        } else {
            this.router.push(path)
            location.reload()
        }
    }

    private async addComment(comment: ParsedData, articleId: Article['id']) {
        try {
            const commentsArticleRef = doc(collection(this.db, `articles/${articleId}/comments`))
            const commentsUserRef = doc(this.db, `users/${this.pageModel.user.uid}`)
            await updateDoc(commentsUserRef, { comments: arrayUnion(commentsArticleRef) })
            await setDoc(
                commentsArticleRef,
                Object.assign(comment, { createdAt: serverTimestamp(), user: commentsUserRef })
            )
        } catch (e) {
            console.log(e)
        }
    }

    private async loadComments(articleId: Article['id']) {
        try {
            const queryConstants: QueryConstraint[] = [orderBy('createdAt', 'asc')]
            const commentsArticleRef = collection(this.db, `articles/${articleId}/comments`)
            const commentsSnapshot = await getDocs(query(commentsArticleRef, ...queryConstants))
            const comments: Array<CommentInfo> = []
            commentsSnapshot.forEach((doc) => {
                const comment = doc.data() as CommentInfo
                comments.push({ ...comment })
            })
            await Promise.all(comments.map((comment) => this.api.loadUsersData(comment)))
            return comments
        } catch (e) {
            console.log(e)
        }
    }
}
