import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { FeedViewInstance } from '@/components/mainPage/views/FeedView'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import {
    FireBaseAPIInstance,
    Firestore,
    Auth,
    collection,
    getDocs,
    FirebaseStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    getDoc,
    doc,
    setDoc,
} from '@/utils/FireBaseAPI'
import { Article } from 'types/types'

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
        this.view.on('LOAD_ARTICLES', async () => {
            console.log(this.pageModel.path[0])
            this.feedModel.setArticles(await this.loadArticles())
        })
        this.view.on<File>('UPLOAD_IMAGE', async (file) => {
            this.loadImage(file)
        })
        this.view.on('DOWNLOAD_IMAGE', async () => {
            await this.downloadImage()
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
        const imageRef = ref(this.storage, `images/avatar`)
        uploadBytes(imageRef, file).then((snapshot) => {
            console.log(snapshot)
            this.downloadImage()
        })
    }

    private async downloadImage() {
        try {
            const url = await getDownloadURL(ref(this.storage, 'images/avatar'))
            this.feedModel.setImage(url)
        } catch (e) {
            console.log(e)
        }
    }
}
