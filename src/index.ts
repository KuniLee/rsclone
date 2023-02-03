import '@/styles/style.css'

import { Router } from '@/utils/Rooter'
import { AppController } from '@/components/mainPage/controller/AppController'
import { PageModel } from '@/components/mainPage/model/PageModel'
import { MainView } from '@/components/mainPage/views/MainView'
import { FeedView } from '@/components/mainPage/views/FeedView'
import { FlowView } from '@/components/mainPage/views/FlowView'

const pageModel = new PageModel()

const router = new Router(pageModel)
const mainView = new MainView(pageModel)
const feedView = new FeedView(pageModel)
const flowView = new FlowView(pageModel)

const appController = new AppController(mainView, pageModel, router)
