import '@/styles/style.css'

import { AuthModel } from '@/components/auth/model/AuthModel'
import { AuthController } from '@/components/auth/controller/AuthController'
import { Router } from '@/utils/Rooter'
import { AuthView } from '@/components/auth/views/AuthView'
import { FireBaseAPI } from '@/utils/FireBaseAPI'

const api = new FireBaseAPI()

const authModel = new AuthModel()
const router = new Router(authModel)
const authView = new AuthView(authModel)
const authController = new AuthController(authView, authModel, router, api)
