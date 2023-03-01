import { UserData } from './../../../types/types'
import EventEmitter from 'events'
import { Paths } from 'types/enums'
import { PageModelInstance } from '../model/PageModel'
import { FeedModelInstance } from '@/components/mainPage/model/FeedModel'
import preloader from '@/templates/preloader.html'
import postTemplate from '@/templates/post/post.hbs'
import dictionary, { getWords } from '@/utils/dictionary'
import aside from '@/templates/aside.hbs'
import commentEditorTemplate from '@/templates/comments/commentEditor.hbs'
import commentsTemplate from '@/templates/comments/comments.hbs'
import commentTemplate from '@/templates/comments/comment.hbs'
import editCommentsFormTemplate from '@/templates/comments/editCommentForm.hbs'
import editCommentParagraphTemplate from '@/templates/comments/editCommentNewParagraph.hbs'
import commentButtonsTemplate from '@/templates/comments/buttons.hbs'
import noCommentsBlockTemplate from '@/templates/comments/noCommentsBlock.hbs'
import commentEditorNewParagraphTemplate from '@/templates/comments/commentEditorNewParagraph.hbs'
import { ParsedData } from 'types/types'
import { EditCommentElements } from '@/types/interfaces'

type ArticleEventsName = 'LOAD_POST' | 'GO_TO' | 'PARSED_COMMENT' | 'REMOVE_COMMENT' | 'EDIT_COMMENT'

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
        const comments = this.feedModel.getComments()
        console.log(comments)
        template.innerHTML = commentsTemplate({
            words: getWords(dictionary.Comments, this.pageModel.lang),
            comments,
        })
        const commentsEl = template.content.querySelector('.comments')
        const commentsWrapperEl = template.content.querySelector('.comments-wrapper')
        const currentUserName = this.pageModel.user as UserData
        let id = 0
        comments.forEach((comment) => {
            const insideTemplate = document.createElement('template')
            const commentAuthor = comment.user as UserData
            insideTemplate.innerHTML = commentTemplate({ comment })
            const commentBody = insideTemplate.content.querySelector('.comment__body')
            const commentEl = insideTemplate.content.querySelector('.comment')
            if (commentsWrapperEl) commentsWrapperEl.append(insideTemplate.content)
            if (currentUserName && commentAuthor && commentEl) {
                if (currentUserName.displayName === commentAuthor.displayName) {
                    commentEl.setAttribute('data-id', String(id))
                    const buttonsTemplate = document.createElement('template')
                    buttonsTemplate.innerHTML = commentButtonsTemplate({})
                    const removeButtonFragment = buttonsTemplate.content
                    if (commentBody && commentEl && commentsEl) {
                        commentBody.append(removeButtonFragment)
                        this.addControlButtonsCommentListeneres(commentBody, commentEl, commentsEl)
                    }
                    id++
                }
            }
        })
        return template.content
    }

    private createEditCommentForm() {
        const template = document.createElement('template')
        template.innerHTML = editCommentsFormTemplate({ words: getWords(dictionary.Comments, this.pageModel.lang) })
        return template.content
    }

    private addControlButtonsCommentListeneres(commentBody: Element, commentEl: Element, commentsEl: Element) {
        const removeBtnEl = commentBody.querySelector('.ico_close')
        const editBtnEl = commentBody.querySelector('.ico_edit')
        if (removeBtnEl instanceof HTMLElement && commentsEl instanceof HTMLElement) {
            this.addRemoveCommentListener(removeBtnEl, commentsEl)
        }

        if (editBtnEl instanceof HTMLElement && commentEl instanceof HTMLElement) {
            this.addEditCommentListener(editBtnEl, commentEl)
        }
    }

    private addRemoveCommentListener(removeBtn: HTMLElement, commentsEl: Element) {
        removeBtn.addEventListener('click', () => {
            this.removeComment(removeBtn, commentsEl)
        })
    }

    private removeComment(removeBtn: HTMLElement, commentsEl: Element) {
        const commentEl = removeBtn.closest('.comment')
        const commentsCountEl = commentsEl.querySelector('.comments__count')
        const commentsWrapperEl = commentsEl.querySelector('.comments-wrapper')
        if (commentEl instanceof HTMLElement && commentsCountEl instanceof HTMLElement && commentsWrapperEl) {
            const commentId = commentEl.dataset.id
            this.emit('REMOVE_COMMENT', commentId)
            commentEl.remove()
            const commentsElements = commentsWrapperEl.children
            let id = 0
            Array.from(commentsElements).forEach((element) => {
                if (element instanceof HTMLElement && element.hasAttribute('data-id')) {
                    element.dataset.id = `${id}`
                    id++
                }
            })
            const comments = this.feedModel.getComments()
            const commentsLength = comments.length
            if (commentsLength) {
                commentsCountEl.textContent = `${commentsLength}`
            } else {
                commentsCountEl.remove()
                const noCommentsBock = this.createNoCommentsBlock()
                if (commentsWrapperEl) {
                    commentsWrapperEl.innerHTML = ''
                    commentsWrapperEl.append(noCommentsBock)
                }
            }
        }
    }

    private createNoCommentsBlock() {
        const template = document.createElement('template')
        template.innerHTML = noCommentsBlockTemplate({
            words: getWords(dictionary.Comments, this.pageModel.lang),
        })
        return template.content
    }

    private createEditParagraphs(paragraphContent: Array<string>) {
        const template = document.createElement('template')
        template.innerHTML = editCommentParagraphTemplate({ content: paragraphContent })
        return template.content
    }

    private addEditCommentListener(editBtn: HTMLElement, commentEl: HTMLElement) {
        editBtn.addEventListener('click', () => {
            const commentContent = commentEl.querySelector('.comment__content')
            const editCommentForm = this.createEditCommentForm()
            editBtn.classList.add('hidden')
            commentEl.append(editCommentForm)
            const cancelBtn = commentEl.querySelector('.edit-comment-form__button_cancel')
            const saveBtn = commentEl.querySelector('.edit-comment-form__button_save')
            const editCommentEditor = commentEl.querySelector('.edit-comment-content')
            if (commentContent instanceof HTMLElement) {
                if (editCommentEditor instanceof HTMLElement) {
                    this.setEditCommentContent(commentContent, editCommentEditor, commentEl)
                }
                if (cancelBtn instanceof HTMLElement) {
                    this.addCancelBtnEditCommentListener(cancelBtn, { commentContent, commentEl, editBtn })
                }
                if (saveBtn instanceof HTMLElement && editCommentEditor instanceof HTMLElement) {
                    this.addSaveBtnEditCommentListener(saveBtn, editCommentEditor, {
                        commentContent,
                        commentEl,
                        editBtn,
                    })
                }
            }
        })
    }

    private setEditCommentContent(commentContent: HTMLElement, editCommentEditor: HTMLElement, comment: HTMLElement) {
        const paragraphsElements = commentContent.children
        const paragraphsContent: Array<string> = []
        Array.from(paragraphsElements).forEach((paragraphsEl) => {
            const paragraphContent = paragraphsEl.textContent
            if (paragraphContent) paragraphsContent.push(paragraphContent)
        })
        editCommentEditor.append(this.createEditParagraphs(paragraphsContent))
        const paragraphEditableElements = comment.querySelectorAll('.editable')
        paragraphEditableElements.forEach((paragraphEditableEl) => {
            if (paragraphEditableEl instanceof HTMLElement && editCommentEditor instanceof HTMLElement)
                this.addParagraphEditableListeners(editCommentEditor, paragraphEditableEl)
        })
        commentContent.classList.add('hidden')
    }

    private addSaveBtnEditCommentListener(
        saveBtn: HTMLElement,
        editCommentEditor: HTMLElement,
        { commentContent, commentEl, editBtn }: EditCommentElements
    ) {
        saveBtn.addEventListener('click', () => {
            const paragraphEditableElements = editCommentEditor.querySelectorAll('.editable')
            const parsedCommentContent = this.parseComment(paragraphEditableElements)
            const comment = editCommentEditor.closest('.comment')
            if (comment instanceof HTMLElement && paragraphEditableElements[0].textContent) {
                const commentId = comment.dataset.id
                this.emit('EDIT_COMMENT', { parsedCommentContent, commentId })
                this.removeEditCommentEditor(commentContent, commentEl, editBtn)
                this.setNewEditedParagraphs(paragraphEditableElements, comment, commentContent)
            }
        })
    }

    private setNewEditedParagraphs(
        paragraphEditableElements: NodeListOf<Element>,
        commentEl: HTMLElement,
        content: HTMLElement
    ) {
        const newParagraphs: Array<HTMLElement> = []
        paragraphEditableElements.forEach((element) => {
            const paragraphContent = element.textContent
            if (paragraphContent && commentEl) {
                const newParagraph = document.createElement('p')
                newParagraph.append(paragraphContent)
                newParagraphs.push(newParagraph)
            }
        })
        content.innerHTML = ''
        newParagraphs.forEach((paragraph) => {
            content.append(paragraph)
        })
    }

    private removeEditCommentEditor(content: HTMLElement, comment: HTMLElement, editBtn: HTMLElement) {
        content.classList.remove('hidden')
        const editCommentFormEl = comment.querySelector('.edit-comment-form')
        if (editCommentFormEl) editCommentFormEl.remove()
        editBtn.classList.remove('hidden')
    }

    private addCancelBtnEditCommentListener(
        cancelBtn: HTMLElement,
        { commentContent, commentEl, editBtn }: EditCommentElements
    ) {
        cancelBtn.addEventListener('click', () => {
            this.removeEditCommentEditor(commentContent, commentEl, editBtn)
        })
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
        const commentFormEl = feedWrapper.querySelector('.comment-form')
        if (commentFormEl instanceof HTMLElement) {
            const commentEditorEl = commentFormEl.querySelector('.comment-editor')
            if (commentEditorEl instanceof HTMLElement) {
                const paragraphEditableElements = commentEditorEl.querySelectorAll('.editable')
                const sendBtnEl = feedWrapper.querySelector('.comment-form__button_send')
                paragraphEditableElements.forEach((paragraphEditableEl) => {
                    if (paragraphEditableEl instanceof HTMLElement && sendBtnEl instanceof HTMLElement)
                        this.addParagraphEditableListeners(commentEditorEl, paragraphEditableEl, sendBtnEl)
                })
                if (sendBtnEl instanceof HTMLElement) {
                    sendBtnEl.addEventListener('click', () => {
                        const paragraphEditableElements = commentEditorEl.querySelectorAll('.editable')
                        const comment = this.parseComment(paragraphEditableElements)
                        this.emit('PARSED_COMMENT', comment)
                        this.resetCommentEditor(paragraphEditableElements, sendBtnEl)
                    })
                }
            }
        }
    }

    private resetCommentEditor(paragraphsEditable: NodeListOf<Element>, sendBtn: HTMLElement) {
        paragraphsEditable.forEach((paragraphEditable, i) => {
            const paragraph = paragraphEditable.parentElement
            if (paragraphEditable instanceof HTMLElement && sendBtn instanceof HTMLButtonElement && paragraph) {
                sendBtn.disabled = true
                if (i !== 0) {
                    paragraph.remove()
                } else {
                    paragraphEditable.textContent = ''
                    paragraph.classList.remove('before:hidden')
                }
            }
        })
    }

    private addParagraphEditableListeners(
        commentEditor: HTMLElement,
        paragraphEditable: HTMLElement,
        sendBtn?: HTMLElement
    ) {
        const paragraph = paragraphEditable.parentElement
        paragraphEditable.addEventListener('input', () => {
            if (sendBtn instanceof HTMLButtonElement) {
                sendBtn.disabled = this.checkCommentLength(commentEditor)
            }
            if (paragraphEditable.textContent && paragraph) {
                paragraph.classList.add('before:hidden')
            }
        })
        paragraphEditable.addEventListener('keypress', (ev) => {
            if (ev instanceof KeyboardEvent && commentEditor instanceof HTMLElement) {
                if (ev.key === 'Enter') {
                    ev.preventDefault()
                    if (paragraph) this.addParagraph(commentEditor, paragraph)
                }
            }
        })
        paragraphEditable.addEventListener('keydown', (ev) => {
            if (ev instanceof KeyboardEvent) {
                if (ev.key === 'Backspace' || ev.key === 'Delete') {
                    if (paragraph) {
                        const paragraphsEl = [...commentEditor.children]
                        if (!paragraphEditable.textContent && paragraphsEl.length !== 1) {
                            ev.preventDefault()
                            this.removeParagraph(paragraph, commentEditor)
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

    private addParagraph(commentEditor: HTMLElement, paragraph: HTMLElement) {
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
                this.addParagraphEditableListeners(commentEditor, paragraphEditableEl)
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

    private parseComment(paragraphsEditable: NodeListOf<Element>) {
        const comment: ParsedData = {
            blocks: [],
        }
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
