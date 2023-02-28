import { CommentInfo, NewArticleData, UserData } from 'types/types'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import {
    collection,
    deleteDoc,
    deleteObject,
    doc,
    FireBaseAPIInstance,
    FirebaseStorage,
    Firestore,
    getDoc,
    getDocs,
    listAll,
    query,
    ref,
    updateDoc,
    where,
} from '@/utils/FireBaseAPI'
import { Auth, User } from 'firebase/auth'
import { ProfileModelInstance } from '../model/ProfileModel'
import { ProfileViewInstance } from './../view/ProfileView'
import { limit, orderBy, QueryConstraint } from 'firebase/firestore'
import { Article, URLParams } from 'types/interfaces'
import { list } from 'postcss'

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
            this.pageModel.changePage(path)
        })
        this.view.on<string>('DELETE_ARTICLE', async (arg) => {
            try {
                const docRef = await getDoc(doc(this.db, `articles/${arg}`))
                const article = (await docRef.data()) as NewArticleData
                if (article) {
                    const queryConstants: QueryConstraint[] = [orderBy('createdAt', 'asc')]
                    const author = article.userId
                    const authorRef = await doc(this.db, `users/${author}`)
                    const authorArticles = await getDoc(authorRef)
                    const userData = await authorArticles.data()
                    if (userData) {
                        if (userData.articles && userData.articles.length) {
                            console.log(userData.articles)
                            const id = userData.articles.indexOf(`/articles/${arg}`)
                            userData.articles.splice(id, 1)
                            await updateDoc(authorRef, userData)
                        }
                    }
                    const commentsArticleRef = collection(this.db, `articles/${arg}/comments`)
                    const commentsSnapshot = await getDocs(query(commentsArticleRef, ...queryConstants))
                    const commentData: Array<string[]> = []
                    commentsSnapshot.forEach((el) => {
                        const commentId = el.id
                        const comment = el.data() as CommentInfo
                        // @ts-ignore
                        const userId = comment.user.id
                        commentData.push([commentId, userId])
                    })
                    for (const [commentId, userid] of commentData) {
                        const userRef = doc(this.db, `users/${userid}`)
                        const usersArticles = await getDoc(userRef)
                        const userData = (await usersArticles.data()) as UserData
                        if (userData.comments) {
                            userData.comments.forEach((el, index) => {
                                // @ts-ignore
                                if (el.id === commentId) {
                                    userData.comments?.splice(index, 1)
                                }
                            })
                            await updateDoc(userRef, userData)
                        }
                    }
                    const storageRef = await ref(this.storage, `articles/${arg}`)
                    const listOfImages = await listAll(storageRef)
                    if (listOfImages && Array.isArray(listOfImages.items)) {
                        for (const item of listOfImages.items) {
                            await deleteObject(item)
                        }
                    }
                    await deleteDoc(doc(this.db, `articles/${arg}`))
                    location.reload()
                }
            } catch (e) {
                console.log(e)
                location.reload()
            }
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
