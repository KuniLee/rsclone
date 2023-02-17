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
                const docRef = doc(collection(this.db, 'articles'))
                const docId = docRef.id
                const blocks = articleData.blocks
                if (blocks) {
                    let index = 0
                    for (const el of blocks) {
                        if (el.type === 'image') {
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
                if (image) {
                    const imageRef = ref(this.storage, `articles/${docId}/previewImage`)
                    await uploadString(imageRef, image, 'data_url')
                    articleData.preview.image = imageRef.fullPath
                }
                const newArticle = await setDoc(docRef, Object.assign(articleData, { createdAt: serverTimestamp() }))
                alert('Удачно!')
            } catch (e) {
                console.log(e)
            }
        })
    }
}
