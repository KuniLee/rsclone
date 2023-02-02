import '@/styles/style.css'

import { Router } from '@/utils/Rooter'
import { AppController } from '@/components/controllers/AppController'
import { PageModel } from '@/components/models/PageModel'
import { MainView } from '@/components/views/MainView'
import { FeedView } from '@/components/views/FeedView'
import { FlowView } from '@/components/views/FlowView'

const pageModel = new PageModel()

const router = new Router(pageModel)
const mainView = new MainView(pageModel)
const feedView = new FeedView(pageModel)
const flowView = new FlowView(pageModel)

const appController = new AppController(mainView, pageModel, router)
