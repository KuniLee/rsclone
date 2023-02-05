import '@/styles/style.css'

import { Router } from '@/utils/Rooter'
import { AppController } from '@/components/mainPage/controller/AppController'
import { PageModel } from '@/components/mainPage/model/PageModel'
import { MainView } from '@/components/mainPage/views/MainView'
import { FeedView } from '@/components/mainPage/views/FeedView'
import { FireBaseAPI } from '@/utils/FireBaseAPI'
import { FeedController } from '@/components/mainPage/controller/FeedController'
import { FeedModel } from '@/components/mainPage/model/FeedModel'

const pageModel = new PageModel()
const feedModel = new FeedModel()

const router = new Router(pageModel)
const mainView = new MainView(pageModel)
const feedView = new FeedView({ feedModel, pageModel })

const api = new FireBaseAPI()

const feedController = new FeedController(feedView, { feedModel, pageModel }, api)
const appController = new AppController(mainView, pageModel, router)
