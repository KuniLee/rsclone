import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import textEditor from '@/templates/textEditor.hbs'
import newField from '@/templates/textEditorNewField.hbs'
import { Paths, Sandbox } from 'types/enums'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { Plugins, Sortable } from '@shopify/draggable'
import { SortableEventNames } from '@shopify/draggable'
import { NewArticleData, ParsedArticle, ParsedPreviewArticle } from 'types/types'
import authErrorPage from '@/templates/authError.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'

type ItemViewEventsName = 'GOTO' | 'ARTICLE_PARSED'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance
    private isGlobalListener: boolean
    private previewEditorBuilded: boolean

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
        this.isGlobalListener = false
        this.previewEditorBuilded = false
        this.pageModel.on('CHANGE_PAGE', () => {
            if (this.pageModel.path[0] === Paths.Sandbox && this.pageModel.path[1] === Sandbox.New) {
                if (this.pageModel.user) {
                    this.buildPage()
                } else {
                    this.showAuthFail()
                }
            }
        })
    }

    private buildPage() {
        const main = document.querySelector('main')
        if (main) {
            main.innerHTML = textEditor({})
        }
        this.addGlobalEventListener()
        const editor = document.querySelector('.textEditor') as HTMLElement
        const previewEditor = document.querySelector('.textPreviewEditor') as HTMLElement
        if (editor) {
            editor.querySelectorAll('.editable')?.forEach((el) => {
                this.addTextInputListeners(el as HTMLElement, editor)
            })
            editor.querySelectorAll('.textElement')?.forEach((el) => {
                this.addTextElementListeners(el as HTMLElement, editor)
            })
            this.addDrag(editor)
        }
        const hubsInput = document.querySelector('.hubs-input') as HTMLInputElement
        const keywordsInput = document.querySelector('.keywords-input') as HTMLInputElement
        const translateAuthor = document.querySelector('.translate__author') as HTMLInputElement
        const buttonText = document.querySelector('.buttonTextInput') as HTMLInputElement
        const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
        const translateLink = document.querySelector('.translate__link') as HTMLInputElement
        if (previewEditor) {
            previewEditor.querySelectorAll('.editable')?.forEach((el) => {
                this.addTextInputListeners(el as HTMLElement, previewEditor)
            })
            previewEditor.querySelectorAll('.textElement')?.forEach((el) => {
                this.addTextElementListeners(el as HTMLElement, previewEditor)
            })
            if (translateCheckbox) {
                translateCheckbox.addEventListener('change', () => {
                    this.checkSettings()
                })
            }
            const array = [hubsInput, keywordsInput, translateAuthor, translateCheckbox, translateLink, buttonText].map(
                (el) => {
                    if (el) {
                        const element = el as HTMLElement
                        element.addEventListener('input', () => {
                            if (hubsInput && keywordsInput && translateAuthor && translateCheckbox && translateLink) {
                                this.checkSettings()
                            }
                        })
                    }
                }
            )
            this.addDrag(previewEditor)
        }
        document.querySelector('.isTranslate')?.addEventListener('change', () => {
            const translateBlock = document.querySelector('.translate-info')
            if (translateBlock) {
                translateBlock.classList.toggle('hidden')
            }
        })
        document.querySelector('.toSettings')?.addEventListener('click', () => {
            if (previewEditor && editor) {
                this.preparePreviewBlock(editor, previewEditor)
                if (previewEditor.children.length > 1) {
                    if (previewEditor.firstElementChild) {
                        if (!this.previewEditorBuilded) {
                            this.previewEditorBuilded = true
                            previewEditor.firstElementChild.remove()
                            this.addEmptyValueToEnd(previewEditor)
                        }
                    }
                }
            }
            const submitButton = document.querySelector('.submitArticle') as HTMLButtonElement
            submitButton?.addEventListener('click', (e) => {
                e.preventDefault()
                if (hubsInput && keywordsInput && buttonText && translateCheckbox && translateLink && translateAuthor) {
                    submitButton.disabled = true
                    const parseMainEditorResult = this.parseArticle(editor)
                    const parsedPreviewResult = this.parseArticle(previewEditor)
                    const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
                    const parsedHubs = hubsInput.value ? hubsInput.value.split(', ') : []
                    const parsedKeywords = keywordsInput.value ? keywordsInput.value.split(', ') : []
                    const lang = (document.querySelector("input[name='lang']:checked") as HTMLInputElement)?.value
                    const image = document.querySelector('.preview-image') as HTMLImageElement
                    const imageSrc = image ? image.getAttribute('src') : ''
                    const imageSrcResult = imageSrc ?? ''
                    const textButtonValue = buttonText.value
                    const preview: ParsedPreviewArticle = {
                        image: imageSrcResult,
                        nextBtnText: textButtonValue,
                        previewBlocks: parsedPreviewResult.blocks,
                    }
                    const result: NewArticleData = {
                        blocks: parseMainEditorResult.blocks,
                        title: parseMainEditorResult.blocks[0].value,
                        habs: parsedHubs,
                        keywords: parsedKeywords,
                        lang: lang,
                        preview: preview,
                        userId: '',
                        translateAuthor: translateAuthor.value,
                        translateLink: translateLink.value,
                        isTranslate: translateCheckbox.checked,
                    }
                    this.emit('ARTICLE_PARSED', undefined, result)
                }
            })
            this.toggleEditorView()
        })
        document.querySelector('.backToEditor')?.addEventListener('click', (e) => {
            e.preventDefault()
            this.toggleEditorView()
        })
        document.querySelector('.image-preview')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            if (target) {
                if (target.files) {
                    if (!target.files.length) {
                        return
                    } else {
                        const fileReader = new FileReader()
                        fileReader.onload = () => {
                            const previewImage = document.querySelector('.preview-image') as HTMLImageElement
                            if (previewImage) {
                                if (typeof fileReader.result === 'string') {
                                    previewImage.src = fileReader.result
                                    previewImage.classList.remove('hidden')
                                    const textPreview = document.querySelector('.load-image-preview-text')
                                    if (textPreview) {
                                        textPreview.classList.add('hidden')
                                    }
                                }
                            }
                        }
                        fileReader.readAsDataURL(target.files[0])
                    }
                }
            }
        })
    }

    addDrag(list: HTMLElement) {
        const sortable = new Sortable<SortableEventNames | 'drag:stopped'>(list, {
            draggable: '.textElement',
            delay: {
                mouse: 0,
                drag: 0,
                touch: 0,
            },
            plugins: [Plugins.SortAnimation],
            swapAnimation: {
                duration: 200,
                horizontal: false,
                easingFunction: 'ease-in-out',
            },
        })
        sortable.on('drag:start', (event) => {
            const target = event.source
            if (target) {
                console.log(target)
                if (!target.querySelector('.startDrag')) {
                    event.cancel()
                }
            }
        })
        sortable.on('drag:stopped', () => {
            this.hidePlaceholder(list)
            this.removeStartDragClass()
        })
    }

    toggleEditorView() {
        const editor = document.querySelector('.mainEditor')
        const settings = document.querySelector('.editorSettings')
        if (editor && settings) {
            editor.classList.toggle('hidden')
            settings.classList.toggle('hidden')
        }
    }

    addGlobalEventListener() {
        if (!this.isGlobalListener) {
            this.isGlobalListener = true
            document.addEventListener('click', () => {
                const modalOptionsList = document.querySelectorAll('.options__drop-menu')
                modalOptionsList.forEach((el) => {
                    const element = el as HTMLElement
                    if (element.classList.contains('open')) {
                        element.hidden = true
                        element.classList.remove('open')
                    }
                })
            })
        }
    }

    addTextInputListeners(el: HTMLElement, editor: HTMLElement) {
        el.addEventListener('keypress', (e) => {
            const event = e as KeyboardEvent
            const item = editor.querySelector('.focused')
            if (event.key === 'Enter') {
                e.preventDefault()
                this.addNewField(editor)
            }
        })
        el.addEventListener('input', (e) => {
            const event = e as KeyboardEvent
            const target = el as HTMLElement
            const value = target.textContent
            const parent = el.parentNode as HTMLElement
            if (parent) {
                if (value) {
                    parent.classList.add('before:hidden')
                } else {
                    if (editor.lastElementChild === parent) {
                        parent.classList.remove('before:hidden')
                    }
                }
            }
            if (editor.classList.contains('textEditor')) {
                this.checkArticle()
            }
            if (editor.classList.contains('textPreviewEditor')) {
                this.checkSettings()
            }
            this.changeDragIconState(el)
        })
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = el as HTMLElement
                const value = target.textContent
                const parent = target.parentElement
                const listOfElements = editor.querySelectorAll('.textElement')
                if (value === '' && parent && parent.classList.contains('textElement') && listOfElements.length !== 1) {
                    this.deleteElement(parent, editor)
                    e.preventDefault()
                }
            }
        })
        el.addEventListener('focus', () => {
            const target = el as HTMLElement
            const parent = target.parentElement
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(target)
            range.collapse(false)
            if (selection) {
                selection.removeAllRanges()
                selection.addRange(range)
            }
            if (parent) {
                parent.classList.add('focused')
            }
        })
        el.addEventListener('blur', () => {
            const target = el as HTMLElement
            const parent = target.parentElement
            if (parent) {
                parent.classList.remove('focused')
            }
        })
    }

    addTextElementListeners(textElement: HTMLElement, editor: HTMLElement) {
        textElement.addEventListener('pointerdown', (e) => {
            const target = e.target as HTMLElement
            const closest = target.closest('.drag')
            if (closest) {
                closest.classList.add('cursor-grabbing')
                target.classList.add('startDrag')
            }
        })
        textElement.addEventListener('click', (e) => {
            const el = e.target as HTMLElement
            document.querySelectorAll('.open')?.forEach((el) => {
                el.classList.remove('open')
                ;(el as HTMLElement).hidden = true
            })
            if (el.closest('.options__open-btn')) {
                e.preventDefault()
                const dropMenu = textElement.querySelector('.options__drop-menu') as HTMLElement
                if (dropMenu) {
                    dropMenu.hidden = false
                    dropMenu.classList.add('open')
                    e.stopImmediatePropagation()
                }
            }
        })
        textElement.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            e.preventDefault()
            if (editor.querySelectorAll('.textElement')?.length !== 1) {
                this.deleteElement(textElement, editor)
            }
        })
    }
    addNewField(editor: HTMLElement, value?: string) {
        let el: Element | null = editor.querySelector('.focused') as HTMLElement
        el = el ? el : editor.lastElementChild
        if (el) {
            const template = document.createElement('template')
            template.innerHTML = newField({})
            el.after(template.content)
            const newElem = editor.querySelector('.new') as HTMLElement
            if (newElem) {
                if (editor.classList.contains('textPreviewEditor')) {
                    newElem.dataset.isEmpty = 'Введите текст'
                }
                const newElemField = newElem.querySelector('.editable') as HTMLElement
                if (newElemField) {
                    newElem.classList.remove('new')
                    if (value) {
                        newElemField.textContent = value
                    }
                    this.addTextInputListeners(newElemField, editor)
                    this.addTextElementListeners(newElem, editor)
                    newElemField.focus()
                }
            }
        }
        this.hidePlaceholder(editor)
    }
    deleteElement(element: HTMLElement, editor: HTMLElement) {
        element.remove()
        if (editor) {
            const lastChild = editor.lastElementChild as HTMLElement
            const lastChildInputField = lastChild.querySelector('.editable') as HTMLElement
            if (lastChild && lastChildInputField) {
                if (lastChildInputField.textContent === '') {
                    lastChild.classList.remove('before:hidden')
                }
                lastChildInputField.focus()
            }
        }
    }
    checkArticle() {
        const checkHeaderResult = this.checkHeader()
        const checkArticleFieldsResult = this.checkArticleFields()
        const toSettingsButton = document.querySelector('.toSettings') as HTMLButtonElement
        if (toSettingsButton) {
            toSettingsButton.disabled = !(checkHeaderResult && checkArticleFieldsResult && toSettingsButton)
        }
    }

    checkHeader() {
        const headerField = document.querySelector('.articleHeader')
        if (headerField) {
            if (headerField.textContent) {
                if (headerField.textContent.length > 5) {
                    return true
                }
            }
        }
        return false
    }

    checkArticleFields() {
        let charactersCount = 0
        document.querySelectorAll('.textElement')?.forEach((el) => {
            const editableField = el.querySelector('.editable')
            if (editableField) {
                if (editableField.textContent) {
                    charactersCount += editableField.textContent.length
                }
            }
        })
        return charactersCount >= 10
    }

    hidePlaceholder(editor: HTMLElement) {
        const elements = editor.querySelectorAll('.textElement')
        for (let i = 0; i < elements.length; i++) {
            console.log(elements.length)
            if (elements.length - 1 !== i) {
                elements[i].classList.add('before:hidden')
            } else {
                const elem = elements[i].querySelector('.editable') as HTMLElement
                if (elem) {
                    if (elem.textContent?.length === 0) {
                        elements[i].classList.remove('before:hidden')
                    }
                }
            }
        }
    }

    preparePreviewBlock(editor: HTMLElement, previewEditor: HTMLElement) {
        if (previewEditor.children.length === 1) {
            let count = 0
            editor.querySelectorAll('.editorElement')?.forEach((el) => {
                if (el.classList.contains('textElement')) {
                    const textField = el.querySelector('.editable')
                    if (textField && count < 3000) {
                        if (textField.textContent) {
                            console.log(count + textField.textContent.length)
                            if (count + textField.textContent.length > 3000) {
                                return
                            } else {
                                count += textField.textContent.length
                            }
                            this.addNewField(previewEditor, textField.textContent)
                        } else {
                            this.addNewField(previewEditor)
                        }
                    }
                } else {
                    return
                }
            })
        }
    }

    addEmptyValueToEnd(editor: HTMLElement) {
        const lastChild = editor.lastElementChild
        if (lastChild) {
            const lastChildField = lastChild.querySelector('.editable')
            if (lastChildField) {
                const value = lastChildField.textContent
                if (value) {
                    this.addNewField(editor)
                }
            }
        }
    }

    parseArticle(editor: HTMLElement): ParsedArticle {
        const header = editor.querySelector('.articleHeader')
        const obj: ParsedArticle = {
            blocks: [],
        }
        if (header) {
            if (header.textContent) {
                obj.blocks = [
                    {
                        options: {
                            size: 'h1',
                        },
                        type: 'heading',
                        value: header.textContent,
                    },
                ]
            }
        }
        editor.querySelectorAll('.editorElement')?.forEach((el) => {
            if (el.classList.contains('textElement')) {
                const textField = el.querySelector('.editable')
                if (textField) {
                    if (textField.textContent) {
                        obj.blocks.push({
                            type: 'text',
                            value: textField.textContent,
                        })
                    } else {
                        obj.blocks.push({
                            type: 'delimiter',
                            value: '',
                        })
                    }
                }
            }
        })
        return obj
    }

    checkSettings() {
        const hubsInput = document.querySelector('.hubs-input') as HTMLInputElement
        const keywordsInput = document.querySelector('.keywords-input') as HTMLInputElement
        const translateAuthor = document.querySelector('.translate__author') as HTMLInputElement
        const buttonTextInput = document.querySelector('.buttonTextInput') as HTMLInputElement
        const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
        const translateLink = document.querySelector('.translate__link') as HTMLInputElement
        if (hubsInput && keywordsInput && translateAuthor && buttonTextInput && translateCheckbox && translateLink) {
            const checkHubsResult = this.checkValue(hubsInput.value, new RegExp('[A-zА-я]{5,}'))
            checkHubsResult
                ? hubsInput.classList.remove('border-[#ff8d85]')
                : hubsInput.classList.add('border-[#ff8d85]')
            const checkKeywordsResult = this.checkValue(keywordsInput.value, new RegExp('[A-zА-я]{5,}'))
            checkKeywordsResult
                ? keywordsInput.classList.remove('border-[#ff8d85]')
                : keywordsInput.classList.add('border-[#ff8d85]')
            const checkButtonTextResult = this.checkValue(buttonTextInput.value, new RegExp('[A-zА-я]{2,}'))
            checkButtonTextResult
                ? buttonTextInput.classList.remove('border-[#ff8d85]')
                : buttonTextInput.classList.add('border-[#ff8d85]')
            let checkTranslateAuthor = true
            let checkTranslateLink = true
            const checkPreviewBlock = this.checkPreviewEditor()
            const previewError = document.querySelector('.previewEditorError')
            if (previewError) {
                checkPreviewBlock
                    ? previewError.classList.remove('text-[#ff8d85]')
                    : previewError.classList.add('text-[#ff8d85]')
            }
            if (translateCheckbox.checked) {
                checkTranslateAuthor = this.checkValue(translateAuthor.value, new RegExp('[A-z]{5,}'))
                checkTranslateAuthor
                    ? translateAuthor.classList.remove('border-[#ff8d85]')
                    : translateAuthor.classList.add('border-[#ff8d85]')
                checkTranslateLink = this.checkValue(
                    translateLink.value,
                    new RegExp(
                        '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$'
                    )
                )
                checkTranslateLink
                    ? translateLink.classList.remove('border-[#ff8d85]')
                    : translateLink.classList.add('border-[#ff8d85]')
            }
            const button = document.querySelector('.submitArticle') as HTMLButtonElement
            if (button) {
                if (
                    checkHubsResult &&
                    checkKeywordsResult &&
                    checkTranslateLink &&
                    checkTranslateAuthor &&
                    checkButtonTextResult &&
                    checkPreviewBlock
                ) {
                    if (button) {
                        button.disabled = false
                        return true
                    }
                } else {
                    button.disabled = true
                    return false
                }
            }
        }
    }

    checkValue(value: string, regExp: RegExp): boolean {
        if (value) {
            const result = value.match(regExp)
            if (result) {
                return true
            }
        }
        return false
    }

    checkPreviewEditor() {
        const editor = document.querySelector('.textPreviewEditor')
        if (editor) {
            let count = 0
            editor.querySelectorAll('.editable')?.forEach((el) => {
                if (el) {
                    if (el.textContent) {
                        count += el.textContent.length
                    }
                }
            })
            return count > 40 && count < 3000
        }
    }

    removeStartDragClass() {
        document.querySelectorAll('.startDrag')?.forEach((el) => {
            el.classList.remove('startDrag')
        })
        document.querySelectorAll('.drag')?.forEach((el) => {
            el.classList.remove('cursor-grabbing')
        })
    }

    changeDragIconState(el: HTMLElement) {
        const value = el.textContent
        const parent = el.parentElement
        if (value) {
            parent?.querySelector('.drag')?.classList.remove('hidden')
        } else {
            parent?.querySelector('.drag')?.classList.add('hidden')
        }
    }
    showAuthFail() {
        const main = document.querySelector('main') as HTMLElement
        if (main) {
            main.innerHTML = ''
            const pageWrapper = document.createElement('div')
            pageWrapper.className = 'sm:container mx-auto'
            pageWrapper.innerHTML = authErrorPage({ words: getWords(Dictionary.errorPage, this.pageModel.lang) })
            const mainPageBtn = pageWrapper.querySelector('button') as HTMLButtonElement
            mainPageBtn.onclick = () => {
                this.emit<string>('GOTO', location.origin)
            }
            main.append(pageWrapper)
        }
    }

    emit<T>(event: ItemViewEventsName, arg?: T, articleData?: NewArticleData) {
        return super.emit(event, arg, articleData)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T, articleData: NewArticleData) => void) {
        return super.on(event, callback)
    }
}
