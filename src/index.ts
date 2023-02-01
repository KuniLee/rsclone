import '@/styles/style.css'

import { Router } from '@/utils/Rooter'
import { AppController } from '@/components/controllers/AppController'
import { PageModel } from '@/components/models/PageModel'
import { MainView } from '@/components/views/MainView'
import { FeedView } from '@/components/views/FeedView'
import { FlowView } from '@/components/views/FlowView'
import { AuthModel } from '@/components/models/AuthModel'
import { AuthView } from '@/components/views/AuthView'

const router = new Router()

const pageModel = new PageModel()
const authModel = new AuthModel()

const mainView = new MainView(pageModel)
const feedView = new FeedView(pageModel)
const flowView = new FlowView(pageModel)

const authView = new AuthView(pageModel, authModel)

const appController = new AppController(mainView, pageModel, router)
