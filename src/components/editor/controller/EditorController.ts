import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { EditorViewInstance } from '@/components/editor/view/EditorView'
import { EditorModelInstance } from '@/components/editor/model/EditorModel'
import {
    FireBaseAPI,
    Firestore,
    addDoc,
    collection,
    ref,
    uploadBytes,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    getDoc,
} from '@/utils/FireBaseAPI'
import { FirebaseStorage, getDownloadURL, uploadString } from 'firebase/storage'
import { NewArticleData } from 'types/types'

export class EditorController {
    private router: RouterInstance
    private view: EditorViewInstance
    private editorModel: EditorModelInstance
    private pageModel: PageModelInstance
    private db: Firestore
    private storage: FirebaseStorage

    constructor(
        view: EditorViewInstance,
        pageModel: PageModelInstance,
        editorModel: EditorModelInstance,
        router: RouterInstance,
        api: FireBaseAPI
    ) {
        this.pageModel = pageModel
        this.editorModel = editorModel
        this.view = view
        this.db = api.db
        this.storage = api.storage
        this.router = router
        view.on<string>('GOTO', (arg) => {
            pageModel.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        view.on('ARTICLE_PARSED', async (arg, articleData) => {
            try {
                const image = articleData.preview.image
                const docRef = doc(collection(this.db, 'articles'))
                const userRef = doc(this.db, `users/${this.pageModel.user.uid}`)
                const usersArticles = await getDoc(userRef)
                const userData = await usersArticles.data()
                const docId = docRef.id
                const blocks = articleData.blocks
                if (blocks) {
                    let index = 0
                    for (const el of blocks) {
                        if (el.type === 'image') {
                            if (el.imageSrc) {
                                const image = el.imageSrc
                                const imageRef = ref(this.storage, `articles/${docId}/image${index}`)
                                if (image != null) {
                                    await uploadString(imageRef, image, 'data_url')
                                    el.imageSrc = imageRef.fullPath
                                }
                                index++
                            }
                        }
                    }
                }
                if (image) {
                    const imageRef = ref(this.storage, `articles/${docId}/previewImage`)
                    await uploadString(imageRef, image, 'data_url')
                    articleData.preview.image = imageRef.fullPath
                }
                const newArticle = await setDoc(docRef, Object.assign(articleData, { createdAt: serverTimestamp() }))
                if (userData) {
                    if (userData.articles && userData.articles.length) {
                        userData.articles = [...userData.articles, docRef]
                    } else {
                        userData.articles = [docRef]
                    }
                }
                await updateDoc(userRef, userData)
                console.log('delete')
                await this.editorModel.deleteArticle()
                alert('Удачно!')
            } catch (e) {
                console.log(e)
            }
        })
        view.on('SAVE_ARTICLE_TO_LOCALSTORAGE', (arg, articleData, blocks) => {
            const result = this.editorModel.saveArticleToLocalStorage(blocks)
            if (result) {
                this.editorModel.updateTimeLocalSaved()
            }
        })
        view.on('GET_ARTICLE', async (id) => {
            try {
                const docRef = await getDoc(doc(this.db, `articles/${id}`))
                const article = (await docRef.data()) as NewArticleData
                const index = 0
                for (const el of article.blocks) {
                    if (el.type === 'image') {
                        el.imageSrc = await getDownloadURL(ref(this.storage, el.imageSrc))
                    }
                }
                article.preview.image = await getDownloadURL(ref(this.storage, article.preview.image))
                this.editorModel.getArticle(article)
            } catch (err) {
                this.editorModel.getArticle()
                console.log(err)
            }
        })
    }
}
