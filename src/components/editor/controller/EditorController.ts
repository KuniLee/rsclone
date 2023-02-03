import { RouterInstance } from '@/utils/Rooter'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { URLParams } from 'types/interfaces'
import { EditorViewInstance } from '@/components/editor/view/EditorView'
import { EditorModelInstance } from '@/components/editor/model/EditorModel'

export class EditorController {
    private router: RouterInstance
    private view: EditorViewInstance
    private editorModel: EditorModelInstance
    private pageModel: PageModelInstance

    constructor(
        view: EditorViewInstance,
        pageModel: PageModelInstance,
        editorModel: EditorModelInstance,
        router: RouterInstance
    ) {
        this.pageModel = pageModel
        this.editorModel = editorModel
        this.view = view
        this.router = router
        view.on<string>('GOTO', (arg) => {
            pageModel.changePage({
                path: this.router.getPathArray(arg),
                search: this.router.getParsedSearch(arg),
            })
        })
        router.on('ROUTE', () => {
            pageModel.changePage(this.router.getParams())
        })
    }
}
