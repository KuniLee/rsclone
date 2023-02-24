import { Timestamp } from 'firebase/firestore'
import { DateTime } from 'luxon'

export default function (date: Timestamp) {
    if (date) {
        const locateDT = DateTime.fromJSDate(date.toDate())
            .setLocale(localStorage.lang)
            .toLocaleString(DateTime.DATETIME_MED)
        return `<time class="text-sm text-[#777]" datetime="${date.toString()}">${locateDT}</time>`
    }
}
