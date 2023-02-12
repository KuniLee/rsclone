import '@/styles/style.css'

import { Router } from '@/utils/Rooter'
import { AppController } from '@/components/mainPage/controller/AppController'
import { PageModel } from '@/components/mainPage/model/PageModel'
import { MainView } from '@/components/mainPage/views/MainView'
import { FeedView } from '@/components/mainPage/views/FeedView'
import { FireBaseAPI } from '@/utils/FireBaseAPI'
import { FeedController } from '@/components/mainPage/controller/FeedController'
import { FeedModel } from '@/components/mainPage/model/FeedModel'
import { EditorModel } from '@/components/editor/model/EditorModel'
import { EditorView } from '@/components/editor/view/EditorView'
import { EditorController } from '@/components/editor/controller/EditorController'
import { SettingsView } from '@/components/mainPage/views/SettingsView'

const pageModel = new PageModel()
const editorModel = new EditorModel()
const feedModel = new FeedModel()

const api = new FireBaseAPI()

const router = new Router(pageModel)

const mainView = new MainView(pageModel)
const feedView = new FeedView({ feedModel, pageModel })
const settingsView = new SettingsView(pageModel)
const editorView = new EditorView(editorModel, pageModel)

const feedController = new FeedController(feedView, { feedModel, pageModel }, api)
const appController = new AppController({ mainView, settingsView }, pageModel, router, api)
const editorController = new EditorController(editorView, pageModel, editorModel, router, api)
