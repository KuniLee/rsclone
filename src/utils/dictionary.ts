import { Flows } from 'types/enums'

type language = { ru: string; en: string }

const logo: Record<string, language> = {
    Logo: { ru: 'Хабр', en: 'Habr' },
}

const flowsNames: Record<keyof typeof Flows, language> = {
    All: { ru: 'Все потоки', en: 'All streams' },
    Develop: { ru: 'Разработка', en: 'Development' },
    Admin: { ru: 'Администрирование', en: 'Admin' },
}

const buttons: Record<string, language> = {
    Feed: { ru: 'Моя лента', en: 'My feed' },
    Auth: { ru: 'Вход', en: 'Sign in' },
    Registration: { ru: 'Регистрация', en: 'Registration' },
    Settings: { ru: 'Настройки', en: 'Settings' },
}

const popupSettings: Record<string, language> = {
    Title: { ru: 'Настройки страницы', en: 'Page Settings' },
    Interface: { ru: 'Интерфейс', en: 'Content' },
    Save: { ru: 'Сохранить настройки', en: 'Save preferences' },
}

export default { flowsNames, buttons, popupSettings, logo }
