import '@/styles/style.css'

import { AuthModel } from '@/components/auth/model/AuthModel'
import { AuthController } from '@/components/auth/controller/AuthController'
import { Router } from '@/utils/Rooter'
import { AuthView } from '@/components/auth/views/AuthView'

export const router = new Router()

const authModel = new AuthModel()
const authView = new AuthView(authModel)
const authController = new AuthController(authView, authModel, router)
