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
    delimiter() {
        return `<div class="min-h-[60px] w-full max-w-[96.6%]">
        <div class="w-[280px] border border-black border-b-0 my-[56px] mx-auto h-full"></div></div>`
    },
    quote(block) {
        const quote = document.createElement('div')
        quote.className = 'my-6 pl-4 py-0.5 border-l-color-button border-l-4'
        if (Array.isArray(block.value))
            block.value.forEach((el) => {
                quote.insertAdjacentHTML('beforeend', this.text(el))
            })
        return quote.outerHTML
    },
    numberList(block) {
        const ol = document.createElement('ol')
        ol.className = 'list-decimal pl-5'
        for (const li of block.value) {
            const el = document.createElement('li')
            el.className = 'mb-1 pl-4'
            el.textContent = (li as BlocksType).value.toString()
            ol.append(el)
        }
        return ol.outerHTML
    },
    unorderedList(block) {
        const ol = document.createElement('ul')
        ol.className = 'list-disc pl-5'
        for (const li of block.value) {
            const el = document.createElement('li')
            el.className = 'mb-1 pl-4'
            el.textContent = (li as BlocksType).value.toString()
            ol.append(el)
        }
        return ol.outerHTML
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
        case 'quote':
            return blocks.quote(block)
        case 'delimiter':
            return blocks.delimiter(block)
        case 'numberList':
            return blocks.numberList(block)
        case 'unorderedList':
            return blocks.unorderedList(block)
        default:
            console.log(block)
    }
}
