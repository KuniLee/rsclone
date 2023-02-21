import dictionary from '@/utils/dictionary'
import { rootModel } from 'types/interfaces'
export default function (level: string) {
    let color = ''
    switch (level) {
        case 'easy':
            color = 'text-[#47c270]'
            break
        case 'medium':
            color = 'text-[#49addf]'
            break
        case 'hard':
            color = 'text-[#ef6c82]'
            break
        default:
            return
    }
    return `<div class="flex my-1 ${color}">
<svg height="24" width="24" class="fill-current"><title>Level of difficulty</title>
    <use xlink:href="/src/assets/icons/megazord.svg#complexity-${level}"></use></svg><span class="font-semibold">${
        dictionary.PostPage[level][localStorage.lang as rootModel['lang']]
    }</span></div>`
}
