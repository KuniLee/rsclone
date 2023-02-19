import { BlocksType } from 'types/types'

const blocks: Record<BlocksType['type'], (arg0: BlocksType) => string> = {
    title(block) {
        return `<h1>${block.value}</h1>`
    },
    text(block) {
        return `<p class="my-4">${block.value}</p>`
    },
    image(block) {
        const fig = document.createElement('figure')
        fig.insertAdjacentHTML('afterbegin', `<img class="w-full" src="${block.imageSrc}" alt="postImg">`)
        if (block.value)
            fig.insertAdjacentHTML(
                'beforeend',
                `<figcaption class="text-sm text-center mt-2">${block.value}</figcaption>`
            )
        return fig.outerHTML
    },
    heading(block) {
        const el = document.createElement(`h${block.mod?.at(-1) || 1}`)
        el.className = 'mt-10 font-medium'
        if (typeof block.value === 'string') {
            el.innerText = block.value
        }
        return el.outerHTML
    },
    delimiter(block) {
        return 'delimiter'
    },
    quotes(block) {
        const quote = document.createElement('div')
        quote.className = 'my-6 pl-4 py-0.5 border-l-color-button border-l-4'
        if (Array.isArray(block.value))
            block.value.forEach((el) => {
                quote.insertAdjacentHTML('beforeend', this.text(el))
            })
        return quote.outerHTML
    },
    code(block) {
        return 'code'
    },
}

export default function (block: BlocksType) {
    switch (block.type) {
        case 'text':
            return blocks.text(block)
        case 'heading':
            return blocks.heading(block)
        case 'image':
            return blocks.image(block)
        case 'quotes':
            return blocks.quotes(block)

        default:
            console.log(block)
    }
}
