import { Flows } from 'types/enums'

type language = { ru: string; en: string }

const flowsNames: Record<keyof typeof Flows, language> = {
    All: { ru: 'Все потоки', en: 'All streams' },
    Develop: { ru: 'Разработка', en: 'Development' },
    Admin: { ru: 'Администрирование', en: 'Admin' },
}

const buttons: Record<string, language> = {
    Feed: { ru: 'Моя лента', en: 'My feed' },
    Auth: { ru: 'Вход', en: 'Sign in' },
}

export default { flowsNames, buttons }
