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
} from '@/utils/FireBaseAPI'
import { FirebaseStorage, uploadString } from 'firebase/storage'

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
                articleData.preview.image = ''
                const newArticle = await addDoc(
                    collection(this.db, 'articles'),
                    Object.assign(articleData, { createdAt: serverTimestamp() })
                )
                if (image) {
                    const imageRef = ref(this.storage, `articles/${newArticle.id}/previewImage`)
                    await uploadString(imageRef, image, 'data_url')
                    await updateDoc(doc(this.db, 'articles', newArticle.id), {
                        preview: {
                            image: imageRef.fullPath,
                        },
                    })
                }
                alert('Удачно!')
            } catch (e) {
                console.log(e)
            }
        })
    }
}
