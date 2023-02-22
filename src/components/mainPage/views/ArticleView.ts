import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import postTemplate from '@/templates/post/post.hbs'
import dictionary, { getWords } from '@/utils/dictionary'
import aside from '@/templates/aside.hbs'
import { Comment } from '@/utils/commentBuilder'
import commentsBlocksTemplate from '@/templates/comments/commentsBlocks.hbs'
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
                    const commentsBlockEl = this.createCommentsBlocks()
                    feedEl.append(commentsBlockEl)
                    this.addListeners(feedEl)
                }
            }
        })
        this.feedModel.on('COMMENTS_LOADED', () => {
            console.log(this.feedModel.getComments())
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
<div class="w-full flex flex-col gap-4 post"></div><aside class="hidden lg:block max-w-[300px] h-fit bg-color-light">${aside(
            {
                words: getWords(dictionary.Aside, this.pageModel.lang),
            }
        )}</aside>
</div>`
    }

    private renderPost(feedWrapperEl: HTMLElement) {
        feedWrapperEl.innerHTML = postTemplate({
            article: this.feedModel.article,
            words: getWords(dictionary.PostPage, this.pageModel.lang),
        })
    }

    private createCommentsBlocks() {
        const template = document.createElement('template')
        template.innerHTML = commentsBlocksTemplate({
            user: this.pageModel.user,
            words: getWords(dictionary.Comments, this.pageModel.lang),
            loginHref: Paths.Auth,
        })
        return template.content
    }

    private addListeners(feedWrapper: HTMLElement) {
        const paragraphEditableElements = feedWrapper.querySelectorAll('.editable')
        const sendBtnEl = feedWrapper.querySelector('.comment-form__button_send')
        feedWrapper.querySelectorAll('a').forEach((el) => {
            el.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit<string>('GO_TO', el.href)
            })
        })
        paragraphEditableElements.forEach((paragraphEditableEl) => {
            if (paragraphEditableEl instanceof HTMLElement) this.addInputListeners(paragraphEditableEl, feedWrapper)
        })
        if (sendBtnEl) {
            sendBtnEl.addEventListener('click', () => {
                const comment = this.parseComment(feedWrapper)
                this.emit('PARSED_COMMENT', comment)
            })
        }
    }

    private addInputListeners(paragraphEditable: HTMLElement, feedWrapper: HTMLElement) {
        const sendBtn = feedWrapper.querySelector('.comment-form__button_send')
        const commentEditorEl = feedWrapper.querySelector('.comment-editor')
        paragraphEditable.addEventListener('input', (ev) => {
            const target = ev.target
            const paragraph = paragraphEditable.parentElement
            if (sendBtn instanceof HTMLButtonElement) sendBtn.disabled = this.checkCommentLength(paragraphEditable)
            if (target instanceof HTMLElement && paragraph) {
                if (target.textContent) {
                    paragraph.classList.add('before:hidden')
                } else {
                    paragraph.classList.remove('before:hidden')
                }
            }
        })
        paragraphEditable.addEventListener('keypress', (ev) => {
            if (ev instanceof KeyboardEvent && commentEditorEl instanceof HTMLElement) {
                if (ev.key === 'Enter') {
                    ev.preventDefault()
                    this.addParagraph(commentEditorEl, feedWrapper)
                }
            }
        })
        paragraphEditable.addEventListener('keydown', (ev) => {
            if (ev instanceof KeyboardEvent) {
                if (ev.key === 'Backspace' || ev.key === 'Delete') {
                    const paragraph = paragraphEditable.parentElement
                    if (paragraph && commentEditorEl instanceof HTMLElement) {
                        const paragraphs = [...commentEditorEl.children]
                        if (paragraphEditable.textContent === '' && paragraphs.length !== 1) {
                            this.removeParagraph(paragraph, commentEditorEl)
                        }
                    }
                }
            }
        })
        paragraphEditable.addEventListener('focus', () => {
            if (commentEditorEl) {
                const paragraphs = [...commentEditorEl.children]
                const paragraph = paragraphEditable.parentElement
                this.setCaret(paragraphEditable)
                paragraphs.forEach((paragraphEl, i) => {
                    if (paragraph && paragraphEl instanceof HTMLElement) {
                        if (i === paragraphs.indexOf(paragraph)) {
                            this.showPlusIcon(paragraphEl)
                        } else {
                            this.hidePlusIcon(paragraphEl)
                        }
                    }
                })
            }
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

    private checkCommentLength(commentEditor: HTMLElement) {
        const content = commentEditor.textContent
        if (content && content.length) return false
        return true
    }

    private addParagraph(commentEditor: HTMLElement, feedWrapper: HTMLElement) {
        const template = document.createElement('template')
        template.innerHTML = commentEditorNewParagraphTemplate({
            words: getWords(dictionary.Comments, this.pageModel.lang),
        })
        const content = template.content
        commentEditor.append(content)
        const paragraphEl = commentEditor.querySelector('.new')
        if (paragraphEl) {
            const editableParagraphEl = paragraphEl.querySelector('.editable')
            if (editableParagraphEl instanceof HTMLElement) {
                editableParagraphEl.focus()
                paragraphEl.classList.remove('new')
                this.addInputListeners(editableParagraphEl, feedWrapper)
            }
        }
        this.hidePlaceholder(commentEditor)
    }

    private removeParagraph(paragraph: HTMLElement, commentEditor: HTMLElement) {
        paragraph.remove()
        const paragraphs = [...commentEditor.children]
        const lastParagraph = paragraphs[paragraphs.length - 1]
        const lastEditableParagraph = paragraphs[paragraphs.length - 1].querySelector('.editable')
        const plusIcon = paragraphs[paragraphs.length - 1].querySelector('.ico_plus')
        if (lastEditableParagraph instanceof HTMLElement && plusIcon) {
            lastEditableParagraph.focus()
            if (lastEditableParagraph.textContent === '') {
                lastParagraph.classList.remove('before:hidden')
            }
        }
    }

    private hidePlaceholder(commentEditor: HTMLElement) {
        const paragraphs = [...commentEditor.children]
        const lastParagraph = paragraphs[paragraphs.length - 1]
        paragraphs.forEach((paragraph, i) => {
            if (i !== paragraphs.indexOf(lastParagraph) && paragraph instanceof HTMLElement) {
                paragraph.classList.add('before:hidden')
                this.hidePlusIcon(paragraph)
            }
        })
    }

    private hidePlusIcon(paragraph: HTMLElement) {
        const plusIcon = paragraph.querySelector('.ico_plus')
        if (plusIcon) plusIcon.classList.add('hidden')
    }

    private showPlusIcon(paragraph: HTMLElement) {
        const plusIcon = paragraph.querySelector('.ico_plus')
        if (plusIcon) plusIcon.classList.remove('hidden')
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
