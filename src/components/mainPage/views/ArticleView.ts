import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import postTemplate from '@/templates/post/post.hbs'
import dictionary, { getWords } from '@/utils/dictionary'
import aside from '@/templates/aside.hbs'
import emptyAvatar from '@/assets/icons/avatar.svg'
import commentEditorTemplate from '@/templates/comments/commentEditor.hbs'
import commentsTemplate from '@/templates/comments/comments.hbs'
import commentEditorNewParagraphTemplate from '@/templates/comments/commentEditorNewParagraph.hbs'
import { ParsedData } from '@/types/types'

type ArticleEventsName = 'LOAD_POST' | 'GO_TO' | 'PARSED_COMMENT'

export type ArticleViewInstance = InstanceType<typeof ArticleView>

export class ArticleView extends EventEmitter {
    private mainPageContainer: HTMLElement | undefined
    private pageModel: PageModelInstance
    private feedModel: FeedModelInstance

    constructor(models: { pageModel: PageModelInstance; feedModel: FeedModelInstance }) {
        super()
        this.pageModel = models.pageModel
        this.feedModel = models.feedModel
        this.pageModel.on('CHANGE_PAGE', () => {
            const path = this.pageModel.path
            if (path.length === 2 && path[0] === Paths.Post) {
                this.renderPage()
                this.showPreloader()
                this.emit('LOAD_POST', path[1].slice(1))
            }
        })
        this.feedModel.on('POST_LOADED', () => {
            if (this.mainPageContainer) {
                const feedEl = this.mainPageContainer.querySelector('.post')
                if (feedEl instanceof HTMLElement) {
                    this.renderPost(feedEl)
                    const commentEditor = this.createCommentEditor()
                    const commets = this.createComments()
                    feedEl.append(commets, commentEditor)
                    this.addListeners(feedEl)
                }
            }
        })
        this.feedModel.on('COMMENTS_LOADED', () => {
            if (this.mainPageContainer) {
                const feedEl = this.mainPageContainer.querySelector('.post')
                if (feedEl instanceof HTMLElement) {
                    const commets = this.createComments()
                    const commentsEl = feedEl.querySelector('.comments')
                    if (commentsEl) feedEl.replaceChild(commets, commentsEl)
                    this.addLinksListeners(feedEl)
                }
            }
        })
    }

    emit<T>(event: ArticleEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ArticleEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    private showPreloader() {
        const feedEl = this.mainPageContainer?.querySelector('.post') as HTMLDivElement
        feedEl.innerHTML = preloader
        window.scrollTo(0, 0)
    }

    private renderPage() {
        this.mainPageContainer = document.querySelector('main') as HTMLElement
        this.mainPageContainer.innerHTML = `<div class="flex gap-4">
<div class="w-full flex flex-col gap-4 post max-w-[760px]"></div>${aside({
            words: getWords(dictionary.Aside, this.pageModel.lang),
        })}
</div>`
    }

    private renderPost(feedWrapperEl: HTMLElement) {
        feedWrapperEl.innerHTML = postTemplate({
            article: this.feedModel.article,
            words: getWords(dictionary.PostPage, this.pageModel.lang),
        })
    }

    private createComments() {
        const template = document.createElement('template')
        template.innerHTML = commentsTemplate({
            user: this.pageModel.user,
            words: getWords(dictionary.Comments, this.pageModel.lang),
            comments: this.feedModel.getComments(),
            emptyAvatar,
        })
        return template.content
    }

    private createCommentEditor() {
        const template = document.createElement('template')
        template.innerHTML = commentEditorTemplate({
            user: this.pageModel.user,
            words: getWords(dictionary.Comments, this.pageModel.lang),
            loginHref: Paths.Auth,
        })
        return template.content
    }

    private addLinksListeners(feedWrapper: HTMLElement) {
        feedWrapper.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit<string>('GO_TO', el.href)
            })
        })
    }

    private addListeners(feedWrapper: HTMLElement) {
        const paragraphEditableElements = feedWrapper.querySelectorAll('.editable')
        const sendBtnEl = feedWrapper.querySelector('.comment-form__button_send')
        this.addLinksListeners(feedWrapper)
        paragraphEditableElements.forEach((paragraphEditableEl) => {
            if (paragraphEditableEl instanceof HTMLElement) this.addInputListeners(paragraphEditableEl, feedWrapper)
        })
        if (sendBtnEl instanceof HTMLElement) {
            sendBtnEl.addEventListener('click', () => {
                const comment = this.parseComment(feedWrapper)
                this.emit('PARSED_COMMENT', comment)
                this.resetCommentEditor(paragraphEditableElements, sendBtnEl)
            })
        }
    }

    private resetCommentEditor(paragraphsEditable: NodeListOf<Element>, sendBtn: HTMLElement) {
        paragraphsEditable.forEach((paragraphEditable) => {
            if (paragraphEditable instanceof HTMLElement && sendBtn instanceof HTMLButtonElement) {
                paragraphEditable.textContent = ''
                sendBtn.disabled = true
                const paragraph = paragraphEditable.parentElement
                if (paragraph) paragraph.classList.remove('before:hidden')
            }
        })
    }

    private addInputListeners(paragraphEditable: HTMLElement, feedWrapper: HTMLElement) {
        const sendBtn = feedWrapper.querySelector('.comment-form__button_send')
        const commentEditorEl = feedWrapper.querySelector('.comment-editor')
        const paragraph = paragraphEditable.parentElement
        paragraphEditable.addEventListener('input', () => {
            if (commentEditorEl && sendBtn instanceof HTMLButtonElement && commentEditorEl instanceof HTMLElement) {
                sendBtn.disabled = this.checkCommentLength(commentEditorEl)
            }
            if (paragraphEditable.textContent && paragraph) {
                paragraph.classList.add('before:hidden')
            }
        })
        paragraphEditable.addEventListener('keypress', (ev) => {
            if (ev instanceof KeyboardEvent && commentEditorEl instanceof HTMLElement) {
                if (ev.key === 'Enter') {
                    ev.preventDefault()
                    if (paragraph) this.addParagraph(commentEditorEl, feedWrapper, paragraph)
                }
            }
        })
        paragraphEditable.addEventListener('keydown', (ev) => {
            if (ev instanceof KeyboardEvent && commentEditorEl instanceof HTMLElement) {
                if (ev.key === 'Backspace' || ev.key === 'Delete') {
                    if (paragraph) {
                        const paragraphsEl = [...commentEditorEl.children]
                        if (!paragraphEditable.textContent && paragraphsEl.length !== 1) {
                            ev.preventDefault()
                            this.removeParagraph(paragraph, commentEditorEl)
                            const paragraphElIndex = paragraphsEl.indexOf(paragraph)
                            if (paragraphElIndex === 0) {
                                const nextParagraph = paragraphsEl[paragraphElIndex + 1]
                                this.removeParagraph(paragraphEditable, nextParagraph)
                            } else {
                                const prevParagraph = paragraphsEl[paragraphElIndex - 1]
                                this.removeParagraph(paragraphEditable, prevParagraph)
                            }
                        }
                        if (
                            paragraphEditable.textContent &&
                            paragraphEditable.textContent.length === 1 &&
                            paragraphsEl.length === 1
                        ) {
                            paragraph.classList.remove('before:hidden')
                        }
                    }
                }
            }
        })
        paragraphEditable.addEventListener('focus', () => {
            this.setCaret(paragraphEditable)
        })
    }

    private setCaret(element: HTMLElement) {
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(element)
        range.collapse(false)
        if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
        }
    }

    private checkCommentLength(commentEditorEl: HTMLElement) {
        const paragraphsEditable = commentEditorEl.querySelectorAll('.editable')
        for (let i = 0; i < paragraphsEditable.length; i++) {
            if (paragraphsEditable[i].textContent) return false
        }
        return true
    }

    private addParagraph(commentEditor: HTMLElement, feedWrapper: HTMLElement, paragraph: HTMLElement) {
        const template = document.createElement('template')
        template.innerHTML = commentEditorNewParagraphTemplate({
            words: getWords(dictionary.Comments, this.pageModel.lang),
        })
        const content = template.content
        paragraph.after(content)
        const paragraphEl = commentEditor.querySelector('.new')
        if (paragraphEl) {
            const paragraphEditableEl = paragraphEl.querySelector('.editable')
            if (paragraphEditableEl instanceof HTMLElement) {
                paragraphEditableEl.focus()
                paragraphEl.classList.remove('new')
                this.addInputListeners(paragraphEditableEl, feedWrapper)
            }
        }
        this.hidePlaceholder(commentEditor)
    }

    private removeParagraph(paragraphEditable: HTMLElement, paragraph: Element) {
        const paragraphEl = paragraph.querySelector('.editable')
        paragraphEditable.remove()
        if (paragraphEl instanceof HTMLElement) {
            paragraphEl.focus()
            if (paragraphEl.textContent === '') {
                paragraph.classList.remove('before:hidden')
            }
        }
    }

    private hidePlaceholder(commentEditor: HTMLElement) {
        const paragraphs = [...commentEditor.children]
        const lastParagraph = paragraphs[paragraphs.length - 1]
        paragraphs.forEach((paragraph, i) => {
            if (i !== paragraphs.indexOf(lastParagraph) && paragraph instanceof HTMLElement) {
                paragraph.classList.add('before:hidden')
            }
        })
    }

    private parseComment(feedWrapper: HTMLElement) {
        const comment: ParsedData = {
            blocks: [],
        }
        const paragraphsEditable = feedWrapper.querySelectorAll('.editable')
        paragraphsEditable.forEach((paragraphEditable) => {
            if (paragraphEditable.textContent) {
                comment.blocks.push({
                    type: 'text',
                    value: paragraphEditable.textContent,
                })
            }
        })
        return comment
    }
}
