import { UserData } from 'types/types'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { collection, FireBaseAPIInstance, FirebaseStorage, Firestore, getDocs, query, where } from '@/utils/FireBaseAPI'
import { Auth, User } from 'firebase/auth'
import { ProfileModelInstance } from '../model/ProfileModel'
import { ProfileViewInstance } from './../view/ProfileView'
import { limit, orderBy, QueryConstraint } from 'firebase/firestore'
import { Article, URLParams } from 'types/interfaces'

export class ProfileController {
    private view: ProfileViewInstance
    private profileModel: ProfileModelInstance
    private pageModel: PageModelInstance
    private db: Firestore
    private auth: Auth
    private storage: FirebaseStorage

    constructor(
        view: ProfileViewInstance,
        private models: { profileModel: ProfileModelInstance; pageModel: PageModelInstance },
        private api: FireBaseAPIInstance
    ) {
        this.db = api.db
        this.auth = api.auth
        this.storage = api.storage
        this.view = view
        this.pageModel = models.pageModel
        this.profileModel = models.profileModel
        this.view.on('LOAD_USER_INFO', async (username: User['displayName']) => {
            const userInfo = await this.getUserInfo(username)
            if (!userInfo) this.pageModel.goTo404()
            else this.profileModel.userInfo = userInfo
        })
        this.view.on('LOAD_ARTICLES', async () => {
            if (this.profileModel.userInfo) {
                const uid = this.profileModel.userInfo.uid
                this.profileModel.articles = await this.loadArticles(uid)
            }
        })
        this.view.on<URLParams>('GO_TO', (path) => {
            console.log(path)
            this.pageModel.changePage(path)
        })
    }

    private async getUserInfo(username: User['displayName']) {
        try {
            const q = query(collection(this.db, 'users'), where('displayName', '==', username))
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty)
                return { uid: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as UserData
        } catch (error) {
            console.log('Error fetching user data:', error)
        }
    }

    private async loadArticles(id: User['uid']) {
        const queryConstants: QueryConstraint[] = [where('userId', '==', id), orderBy('createdAt', 'desc')]
        const articlesRef = collection(this.db, 'articles')
        const q = query(articlesRef, ...queryConstants)
        const querySnapshot = await getDocs(q)
        const articles: Array<Article> = []
        querySnapshot.forEach((doc) => {
            const article = doc.data() as Article
            articles.push({ ...article, id: doc.id })
        })
        return await Promise.all(articles.map((article) => this.api.downloadArticleData(article)))
    }
}
