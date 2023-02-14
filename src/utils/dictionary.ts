import { Flows } from 'types/enums'

type language = { ru: string; en: string }

const logo: Record<string, language> = {
    Logo: { ru: 'Хабр', en: 'Habr' },
}

const flowsNames: Record<keyof typeof Flows, language> = {
    All: { ru: 'Все потоки', en: 'All streams' },
    Develop: { ru: 'Разработка', en: 'Development' },
    Admin: { ru: 'Администрирование', en: 'Admin' },
    Design: { ru: 'Дизайн', en: 'Design' },
}

const buttons: Record<string, language> = {
    Auth: { ru: 'Вход', en: 'Sign in' },
    Registration: { ru: 'Регистрация', en: 'Registration' },
    Sandbox: { ru: 'Написать статью', en: 'Write article' },
    VisualSettings: { ru: 'Язык', en: 'Language' },
    Settings: { ru: 'Настройки профиля', en: 'Profile settings' },
    Exit: { ru: 'Выход', en: 'Log out' },
    Save: { ru: 'Cохранить изменения', en: 'Save changes' },
    Upload: { ru: 'Загрузить', en: 'Upload' },
    Remove: { ru: 'Удалить', en: 'Remove' },
}

const popupSettings: Record<string, language> = {
    Title: { ru: 'Настройки страницы', en: 'Page Settings' },
    Interface: { ru: 'Интерфейс', en: 'Content' },
    Save: { ru: 'Сохранить настройки', en: 'Save preferences' },
}

const errorPage: Record<string, language> = {
    AuthFail: { ru: 'Ошибка авторизации', en: 'Authorization failed' },
    PleaseLogin: { ru: 'Для просмотра этой страницы необходимо авторизоваться', en: 'Please login to see this page' },
    Button: { ru: 'Вернуться на главную', en: 'Back to the main page' },
}

const ProfileSettings: Record<string, language> = {
    Settings: { ru: 'Настройки', en: 'Settings' },
    Avatar: {
        ru: 'Аватар',
        en: 'Avatar',
    },
    AvatarSize: {
        ru: 'Формат: jpg, gif, png. <br> Максимальный размер файла: 1Mb. <br> Разрешение: до 96x96px.',
        en: 'Format: jpg, gif, png. <br> Maximal size: 1 MB. <br> Resolution: up to 96x96px.',
    },
    RealName: { ru: 'Настоящее имя', en: 'Actual name' },
    RealNameAbout: {
        ru: 'Укажите ваши имя и фамилию, чтобы другие пользователи смогли узнать, как вас зовут',
        en: 'Specify your first and last name so that other users can find out what your name is',
    },
    DescYour: { ru: 'Опишите себя', en: 'Describe yourself' },
    DescYourAbout: {
        ru: 'Укажите свою специализацию. Например: Администратор баз данных',
        en: 'Specify your specialization. For example: Database Administrator',
    },
    Save: { ru: 'Cохранить изменения', en: 'Save changes' },
    Upload: { ru: 'Загрузить', en: 'Upload' },
    Remove: { ru: 'Удалить', en: 'Remove' },
}

const ProfilePage: Record<string, language> = {
    Information: { ru: 'Информация', en: 'Information' },
    Registered: { ru: 'Зарегистрирован', en: 'Registered' },
    Posts: { ru: 'Публикации', en: 'Posts' },
}

export function getWords(wordObj: Record<string, language>, lang: keyof language) {
    const result: Record<string, string> = {}
    for (const wordObjKey in wordObj) {
        result[wordObjKey] = wordObj[wordObjKey][lang]
    }
    return result
}

export default { flowsNames, buttons, popupSettings, logo, ProfileSettings, errorPage, ProfilePage }
