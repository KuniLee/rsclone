import { Flows } from 'types/enums'

export type language = { ru: string; en: string }

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
    loadMore: { ru: 'Ещё', en: 'More' },
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
    edit: { ru: 'Редактировать', en: 'Edit article' },
}

const PageNotFound: Record<string, language> = {
    Title: { ru: 'Страница не найдена', en: 'Page not found' },
    Message: {
        ru: 'Страница устарела, была удалена или не существовала вовсе',
        en: 'Page is outdated, was removed or never existed at all',
    },
}

const EditorPage: Record<string, language> = {
    NeverPublish: { ru: 'Никогда не публиковалось', en: 'Never been published' },
    Title: { ru: 'Заголовок', en: 'Title' },
    MenuCall: { ru: 'Нажмите "/" для вызова меню', en: 'Press "/" to access menu' },
    Heading: { ru: 'Заголовок', en: 'Heading' },
    Quote: { ru: 'Цитата', en: 'Quote' },
    Delete: { ru: 'Удалить', en: 'Delete' },
    NumberedList: { ru: 'Нумерованный список', en: 'Numbered list' },
    UnorderedList: { ru: 'Список', en: 'Unordered list' },
    Image: { ru: 'Изображение', en: 'Image' },
    Delimiter: { ru: 'Разделитель', en: 'Delimiter' },
    ToSettings: { ru: 'Далее к настройкам', en: 'Proceed to settings' },
    Language: { ru: 'Язык публикации', en: 'Language' },
    LanguageRu: { ru: 'Русский', en: 'Russian' },
    LanguageEn: { ru: 'Английский', en: 'English' },
    Flows: { ru: 'Потоки', en: 'Flows' },
    PostSettings: { ru: 'Настройки публикации', en: 'Post settings' },
    FlowsHint: { ru: 'Выберите потоки', en: 'Choose flows' },
    Keywords: { ru: 'Ключевые слова', en: 'Keywords' },
    KeywordsPlaceholder: { ru: 'Введите ключевые слова', en: 'Enter keywords' },
    KeywordsHint: {
        ru: 'Введите сюда от 1 до 10 ключевых слов, отделяя их запятыми',
        en: 'Enter from 1 to 10 key words here, separated by commas',
    },
    PreviewHeader: { ru: 'Отображение в ленте', en: 'Post feed view' },
    Translation: { ru: 'Перевод', en: 'Translation' },
    TranslationCheckboxText: { ru: 'Публикация является переводом', en: 'This publication is a translation' },
    TranslationAuthor: { ru: 'Автор оригинала', en: 'Original author' },
    TranslationAuthorHint: { ru: "Например: Tim O'Reily", en: "E.g. Tim O'Reily" },
    TranslationLink: { ru: 'Ссылка на оригинальную публикацию', en: 'Original source' },
    TranslationLinkHint: {
        ru: 'Например: http://www.oreillynet.com/pub/a/oreilly/tim/news/2005/09/30/what-is-web-20.html?page=1',
        en: 'E.g. http://www.oreillynet.com/pub/a/oreilly/tim/news/2005/09/30/what-is-web-20.html?page=1',
    },
    Difficult: { ru: 'Сложность', en: 'Level of difficulty' },
    DifficultNone: { ru: 'Не указан', en: 'Not selected' },
    DifficultEasy: { ru: 'Легкий', en: 'Easy' },
    DifficultMedium: { ru: 'Средний', en: 'Medium' },
    DifficultHard: { ru: 'Тяжелый', en: 'Hard' },
    AddCover: { ru: 'Добавьте обложку', en: 'Add cover here' },
    CoverInfo: {
        ru: 'Перенесите сюда файл (jpg, gif, png) размером 780×440 или нажмите',
        en: 'Drop a file with 780×440 size here (jpg, gif, png) or click',
    },
    UploadCoverButton: { ru: 'Загрузить обложку', en: 'Upload cover' },
    PreviewTextPlaceholder: { ru: 'Введите текст', en: 'Type something' },
    PreviewHint: {
        ru: 'Рекомендуем не менее 100 и не более 2000 символов, минимальное допустимое число - 50 символов, максимально допустимое количество - 3000',
        en: 'We recommend at least 100 and no more than 2000 characters, the minimum allowed number is 50 characters, the maximum allowed number is 3000',
    },
    ReadMoreText: { ru: 'Текст кнопки «Читать далее»', en: 'Read more button text' },
    ReadMoreTextPlaceholder: { ru: 'Читать далее', en: 'Read more' },
    BackToPublication: { ru: 'Назад к публикации', en: 'Back to publication' },
    SendArticle: { ru: 'Опубликовать', en: 'Publish' },
    PopupNameHeading: { ru: 'Заголовок', en: 'Heading' },
    PopupNameQuote: { ru: 'Цитата', en: 'Quote' },
    PopupNameImage: { ru: 'Изображение', en: 'Image' },
    Heading1: { ru: 'Заголовок 1', en: 'Heading 1' },
    Heading2: { ru: 'Заголовок 2', en: 'Heading 2' },
    Heading3: { ru: 'Заголовок 3', en: 'Heading 3' },
    AddImageText: { ru: 'Добавить картинку', en: 'Add image' },
    AddFigcaptionText: { ru: 'Добавьте подпись к изображению', en: 'Image title' },
    LoadAnotherImage: { ru: 'Загрузить другую', en: 'Upload new one' },
    documentCreated: { ru: 'Документ был создан ', en: 'Article was created ' },
    RemoveCover: { ru: 'Удалить обложку', en: 'Remove cover' },
    ChangePosition: { ru: 'Изменить позицию', en: 'Edit position' },
    SavePosition: { ru: 'Сохранить позицию', en: 'Save position' },
    GetSave: { ru: 'У вас есть сохранение от', en: 'You have an autosaved draft on' },
    Restore: { ru: 'Восстановить', en: 'Restore' },
    ImageSizeError: {
        ru: 'Размер изображения слишком большой. Максимальный размер изображения не должен превышать 1 Мб',
        en: 'The image size is too large. The maximum image size should not exceed 1 MB',
    },
    SavedLocally: {
        ru: 'Сохранено локально в',
        en: 'Saved locally at',
    },
}

const Aside: Record<string, language> = {
    Title: { ru: 'Об RS School', en: 'About RS School' },
    FirstParagraphPartOne: {
        ru: 'Бесплатные курсы от сообщества',
        en: 'RS School is free-of-charge and community-based education program conducted by',
    },
    FirstParagraphPartTwo: {
        ru: 'для тех, кто хочет получить знания и опыт, достаточные для трудоустройства.',
        en: 'developer community for those who want to gain knowledge and experience sufficient for employment.',
    },
    SecondParagraphPartOne: {
        ru: 'В',
        en: 'Everyone can study at',
    },
    SecondParagraphPartTwo: {
        ru: ' может учиться каждый, независимо от возраста, профессиональной занятости и места жительства.',
        en: ', regardless of age, professional employment, or place of residence.',
    },
}

const PostPage: Record<string, language> = {
    keywords: { ru: 'Теги', en: 'Tags' },
    isTranslate: { ru: 'Перевод', en: 'Translate' },
    TransAuthor: { ru: 'Автор оригинала:', en: 'Original author:' },
    hard: { ru: 'Сложно', en: 'Hard' },
    medium: { ru: 'Средне', en: 'Medium' },
    easy: { ru: 'Просто', en: 'Easy' },
    noMoreArticles: { ru: 'Статей больше нет', en: 'No more articles' },
}

const Comments: Record<string, language> = {
    CommentsTitle: { ru: 'Комментарии', en: 'Comments' },
    CommentsEmpty: {
        ru: 'Здесь пока нет ни одного комментария, вы можете стать первым!',
        en: 'There are no comments yet, you can be the first one!',
    },
    CommentsNoticePartOne: {
        ru: 'Только полноправные пользователи могут оставлять комментарии.',
        en: 'Only those users with full accounts are able to leave comments.',
    },
    CommentsNoticePartTwo: { ru: 'Войдите', en: 'Log in' },
    CommentsNoticePartThree: { ru: ', пожалуйста.', en: ', please.' },
    SendButton: { ru: 'Отправить', en: 'Send' },
    CommentField: { ru: 'Ваш комментарий', en: 'Your comment' },
    TypeSomething: { ru: 'Введите текст', en: 'Type something' },
    SaveButton: { ru: 'Сохранить', en: 'Save' },
    CancelButton: { ru: 'Отмена', en: 'Cancel' },
}

const AccessError: Record<string, language> = {
    AuthFail: { ru: 'Ошибка авторизации', en: 'Authorization failed' },
    PleaseLogin: {
        ru: 'Вы не имеете прав для редактирования этой страницы',
        en: 'You are not authorized to edit this page',
    },
    Button: { ru: 'Вернуться на главную', en: 'Back to the main page' },
}

const AuthPage: Record<string, language> = {
    LogIn: { ru: 'Вход', en: 'Log in' },
    Email: { ru: 'E-mail', en: 'E-mail' },
    Password: { ru: 'Пароль', en: 'Password' },
    ErrorLogin: { ru: 'Неверный логин или пароль', en: 'Wrong login or password' },
    In: { ru: 'Войти', en: 'Log in' },
    DontHaveAcc: { ru: 'Ещё нет аккаунта', en: 'Have no account yet' },
    SignUp: { ru: 'Зарегистрируйтесь', en: 'Sign up' },
    SignUpHeader: { ru: 'Регистрация', en: 'Sign up' },
    EmailError: { ru: 'Некорректный email', en: 'Incorrect email' },
    EmailExists: { ru: 'Email уже существует', en: 'Email already exist' },
    Nickname: { ru: 'Никнейм', en: 'Nickname' },
    LengthError: { ru: 'Длина должна быть', en: 'Length should be' },
    PasswordErrorLowerCase: { ru: 'Как минимум 1 строчная буква', en: 'At least 1 lowercase letter' },
    PasswordErrorUpperCase: { ru: 'Как минимум 1 заглавная буква', en: 'At least 1 capital letter' },
    PasswordDigitError: { ru: 'Как минимум 1 цифра', en: 'At least 1 digit' },
    PasswordSpecialChar: { ru: 'Как минимум 1 специальный символ', en: 'At least 1 special character' },
    PasswordLengthError: { ru: 'Длина от 8 до 16 символов', en: 'Length 8 to 16 characters' },
    PasswordRepeat: { ru: 'Пароль еще раз', en: 'Repeat password' },
    CaptchaCheck: { ru: 'Пройдите проверку', en: 'Pass check' },
    SignUpComplete: { ru: 'Зарегистрироваться', en: 'Sign Up' },
    AlreadySignUp: { ru: 'Уже зарегистрированы', en: 'Already registered' },
    SignIn: { ru: 'Войдите', en: 'Log in' },
}

export function getWords(wordObj: Record<string, language>, lang: keyof language) {
    const result: Record<string, string> = {}
    for (const wordObjKey in wordObj) {
        result[wordObjKey] = wordObj[wordObjKey][lang]
    }
    return result
}

export default {
    flowsNames,
    buttons,
    popupSettings,
    logo,
    ProfileSettings,
    errorPage,
    ProfilePage,
    PageNotFound,
    Aside,
    EditorPage,
    PostPage,
    Comments,
    AccessError,
    AuthPage,
}
