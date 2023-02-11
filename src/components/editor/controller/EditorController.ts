import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { EditorViewInstance } from '@/components/editor/view/EditorView'
import { EditorModelInstance } from '@/components/editor/model/EditorModel'
import { FireBaseAPI, Firestore, addDoc, collection } from '@/utils/FireBaseAPI'

export class EditorController {
    private router: RouterInstance
    private view: EditorViewInstance
    private editorModel: EditorModelInstance
    private pageModel: PageModelInstance
    private db: Firestore

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
        this.router = router
        view.on<string>('GOTO', (arg) => {
            pageModel.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        view.on('ARTICLE_PARSED', async (arg, articleData) => {
            try {
                await addDoc(collection(this.db, 'articles'), articleData)
                alert('Удачно!')
            } catch (e) {
                console.log(e)
            }
        })
    }
}
