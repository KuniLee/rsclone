import { rootModel } from 'types/interfaces'

export function getTimeAgo(date: Date, lang: rootModel['lang'] = 'en') {
    const timeDiff = Date.now() - date.getTime()
    const seconds = timeDiff / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    const days = hours / 24
    const months = days / 30
    const years = days / 365

    const translations = {
        en: {
            now: 'just now',
            minute: 'minute',
            hour: 'hour',
            day: 'day',
            month: 'month',
            year: 'year',
            pluralSuffix: 's',
        },
        ru: {
            now: 'только что',
            minute: 'минуту',
            hour: 'час',
            day: 'день',
            month: 'месяц',
            year: 'год',
            pluralSuffix: '',
        },
    }

    const { now, minute, hour, day, month, year, pluralSuffix } = translations[lang]

    if (seconds < 60) {
        return now
    } else if (minutes < 60) {
        const n = Math.round(minutes)
        return `${n} ${minute}${n > 1 ? pluralSuffix : ''} ${lang === 'en' ? 'ago' : 'назад'}`
    } else if (hours < 24) {
        const n = Math.round(hours)
        return `${n} ${hour}${n > 1 ? pluralSuffix : ''} ${lang === 'en' ? 'ago' : 'назад'}`
    } else if (days < 30) {
        const n = Math.round(days)
        return `${n} ${day}${n > 1 ? pluralSuffix : ''} ${lang === 'en' ? 'ago' : 'назад'}`
    } else if (months < 12) {
        const n = Math.round(months)
        return `${n} ${month}${n > 1 ? pluralSuffix : ''} ${lang === 'en' ? 'ago' : 'назад'}`
    } else {
        const n = Math.round(years)
        return `${n} ${year}${n > 1 ? pluralSuffix : ''} ${lang === 'en' ? 'ago' : 'назад'}`
    }
}
