import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import textEditor from '@/templates/textEditor.hbs'
import newField from '@/templates/textEditorNewField.hbs'
import { Paths, Sandbox } from 'types/enums'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { DragEvent, Plugins, Sortable } from '@shopify/draggable'
import { SortableEventNames } from '@shopify/draggable'
import { BlocksType, NewArticleData, ParsedArticle, ParsedPreviewArticle } from 'types/types'
import authErrorPage from '@/templates/authError.hbs'
import Dictionary, { getWords } from '@/utils/dictionary'
import { EditorBlocks } from '@/utils/editorPopupWithBlocks'
import headingBlockTemplate from '@/templates/textEditorHeaderTemplate.hbs'
import quoteBlockTemplate from '@/templates/textEditorQuoteTemplate.hbs'
import emptyParagraph from '@/templates/paragraph.hbs'
import { list } from 'postcss'

type ItemViewEventsName = 'GOTO' | 'ARTICLE_PARSED'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance
    private isGlobalListener: boolean
    private previewEditorBuilded: boolean
    private blocksPopup: EditorBlocks

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
        this.isGlobalListener = false
        this.previewEditorBuilded = false
        this.blocksPopup = new EditorBlocks()
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
            main.innerHTML = textEditor({
                userName: this.pageModel.user.displayName,
                userAvatar: this.pageModel.user.properties.avatar
                    ? this.pageModel.user.properties.avatar
                    : require('@/assets/icons/avatar.svg'),
            })
        }
        const popupMenu = document.querySelector('.menu') as HTMLElement
        if (popupMenu) {
            popupMenu.innerHTML = ''
            const arrayWithBlocks = Array.from(this.blocksPopup.getListOfElements())
            arrayWithBlocks.forEach((el) => {
                popupMenu.append(el)
            })
            this.addEventListenersToPopup(popupMenu)
        }
        this.addGlobalEventListener()
        const editor = document.querySelector('.textEditor') as HTMLElement
        const previewEditor = document.querySelector('.textPreviewEditor') as HTMLElement
        if (editor) {
            editor.querySelectorAll('.editable')?.forEach((el) => {
                this.addTextInputListeners(el as HTMLElement, editor)
            })
            editor.querySelectorAll('.editorElement')?.forEach((el) => {
                this.addTextElementListeners(el as HTMLElement, editor)
            })
            this.addDrag(editor)
        }
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
            const array = [keywordsInput, translateAuthor, translateCheckbox, translateLink, buttonText].map((el) => {
                if (el) {
                    const element = el as HTMLElement
                    element.addEventListener('input', () => {
                        if (keywordsInput && translateAuthor && translateCheckbox && translateLink) {
                            this.checkSettings()
                        }
                    })
                }
            })
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
                if (keywordsInput && buttonText && translateCheckbox && translateLink && translateAuthor) {
                    submitButton.disabled = true
                    const parseMainEditorResult = this.parseArticle(editor)
                    const parsedPreviewResult = this.parseArticle(previewEditor)
                    const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
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
                        title: String(parseMainEditorResult.blocks[0].value),
                        keywords: parsedKeywords,
                        lang: lang,
                        preview: preview,
                        userId: this.pageModel.user.uid,
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
        const dropZone = document.querySelector('.dropZone') as HTMLElement
        if (dropZone) {
            this.addDropZoneEvents(dropZone)
        }
        const dropZoneText = document.querySelector('.load-image-preview-text') as HTMLElement
        if (dropZoneText) {
            this.addDropZoneEvents(dropZoneText)
        }
    }

    addDrag(list: HTMLElement) {
        const sortable = new Sortable<SortableEventNames | 'drag:stopped'>(list, {
            draggable: '.editorElement',
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
                const menu = document.querySelector('.menu') as HTMLElement
                if (menu) {
                    menu.hidden = true
                }
            })
        }
    }

    addTextInputListeners(el: HTMLElement, editor: HTMLElement) {
        const parent = el.parentNode as HTMLElement
        el.addEventListener('keypress', (e) => {
            const event = e as KeyboardEvent
            const value = el.textContent
            if (event.key === 'Enter') {
                e.preventDefault()
                if (!el.closest('.quoteElement')) {
                    this.addNewField(editor)
                }
                if (el.closest('.quoteElement')) {
                    const listParagraphs = el.parentElement as HTMLElement
                    const item = el.closest('.quoteElement') as HTMLElement
                    if (value) {
                        this.addNewParagraph(el)
                    } else {
                        if (listParagraphs) {
                            if (listParagraphs.children.length !== 2) {
                                this.deleteElement(el, editor)
                            } else {
                                if (item) {
                                    this.deleteElement(item, editor)
                                }
                            }
                        }
                        this.addNewField(editor)
                    }
                }
            }
        })
        el.addEventListener('input', (e) => {
            const event = e as KeyboardEvent
            const target = el as HTMLElement
            const value = target.textContent
            if (parent) {
                const menu = document.querySelector('.menu') as HTMLElement
                if (value) {
                    parent.classList.add('before:hidden')
                    const rect = el.getBoundingClientRect()
                    const parentRect = editor.getBoundingClientRect()
                    const elComputedStyles = getComputedStyle(el)
                    parent?.querySelector('.plus')?.classList.remove('plusOpen')
                    if (value.length === 1 && value === '/' && menu && el.closest('.textElement')) {
                        menu.style.top = `${rect.top - parentRect.top + parseInt(elComputedStyles.height)}px`
                        parent.classList.add('focusedItem')
                        menu.hidden = false
                    } else {
                        menu.hidden = true
                        parent.classList.remove('focusedItem')
                    }
                } else {
                    document.querySelectorAll('.plusOpen')?.forEach((el) => {
                        el.classList.remove('plusOpen')
                    })
                    parent?.querySelector('.plus')?.classList.add('plusOpen')
                    if (menu) {
                        menu.hidden = true
                        parent.classList.remove('focusedItem')
                    }
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
            if (parent && parent.classList.contains('textElement')) {
                this.changeDragIconState(el)
            }
        })
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = el as HTMLElement
                const value = target.textContent
                const parent = target.closest('.editorElement') as HTMLElement
                const listOfElements = editor.querySelectorAll('.editorElement')
                if (value === '' && parent) {
                    if (
                        parent.classList.contains('editorElement') &&
                        listOfElements.length !== 1 &&
                        !parent.classList.contains('quoteElement')
                    ) {
                        this.deleteElement(parent, editor)
                        e.preventDefault()
                    }
                    if (parent.classList.contains('quoteElement')) {
                        const listParagraphs = el.parentElement as HTMLElement
                        e.preventDefault()
                        if (listParagraphs) {
                            if (listParagraphs.children.length !== 2) {
                                const elContainer = el.parentElement
                                if (elContainer) {
                                    const listOfElements: Array<HTMLElement> = Array.from(
                                        elContainer.querySelectorAll('.editable')
                                    )
                                    const indexOf = listOfElements.indexOf(el)
                                    if (indexOf) {
                                        listOfElements[indexOf - 1]?.focus()
                                    }
                                    this.deleteElement(el, editor, false)
                                }
                            } else {
                                this.deleteElement(parent, editor)
                                if (listOfElements.length === 1) {
                                    this.addNewField(editor)
                                }
                            }
                        }
                    }
                }
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setTimeout(() => {
                    const listOfEditors: Array<HTMLElement> = Array.from(editor.querySelectorAll('.editable'))
                    const currentItemIndex = listOfEditors.indexOf(el)
                    if (currentItemIndex !== -1) {
                        const selection = window.getSelection()
                        if (selection) {
                            const range = selection.getRangeAt(0).startOffset
                            if (range === 0) {
                                if (e.key === 'ArrowUp') {
                                    if (listOfEditors[currentItemIndex - 1] !== undefined) {
                                        listOfEditors[currentItemIndex - 1].focus()
                                    }
                                } else {
                                    console.log(listOfEditors[currentItemIndex + 1])
                                    if (listOfEditors[currentItemIndex + 1] !== undefined) {
                                        listOfEditors[currentItemIndex + 1].focus()
                                    }
                                }
                            }
                            if (e.key === 'ArrowDown') {
                                if (el.textContent) {
                                    if (el.textContent.length === range) {
                                        if (listOfEditors[currentItemIndex + 1] !== undefined) {
                                            listOfEditors[currentItemIndex + 1].focus()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }, 0)
            }
        })
        el.addEventListener('focus', (e) => {
            const target = el as HTMLElement
            const parent = target.closest('.editorElement')
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(target)
            range.collapse(false)
            if (target.textContent === '') {
                if (target.textContent.length) {
                    console.log(parent?.querySelector('.plus'))
                    parent?.querySelector('.plus')?.classList.remove('plusOpen')
                } else {
                    document.querySelectorAll('.plusOpen')?.forEach((el) => {
                        el.classList.remove('plusOpen')
                    })
                    parent?.querySelector('.plus')?.classList.add('plusOpen')
                }
            }
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
            const parent = target.closest('.editorElement')
            parent?.querySelector('.plus')?.classList.remove('plusOpen')
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
            const plusBlock = el.querySelector('.plus')
            if (plusBlock) {
                const menu = document.querySelector('.menu') as HTMLElement
                const parent = el.closest('.editorElement')
                if (menu && parent) {
                    plusBlock.classList.add('plusOpen')
                    parent.classList.add('focused')
                    const rect = el.getBoundingClientRect()
                    const parentRect = editor.getBoundingClientRect()
                    const elComputedStyles = getComputedStyle(el)
                    menu.style.top = `${rect.top - parentRect.top + parseInt(elComputedStyles.height)}px`
                    menu.hidden = false
                    parent.classList.add('focusedItem')
                    e.stopImmediatePropagation()
                }
            }
        })
        textElement.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            e.preventDefault()
            if (editor.querySelectorAll('.editorElement')?.length !== 1) {
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
                    if (value) {
                        const dragIcon = newElem.querySelector('.drag')
                        dragIcon?.classList.remove('hidden')
                    }
                }
                const newElemField = newElem.querySelector('.editable') as HTMLElement
                if (newElemField) {
                    newElem.classList.remove('new')
                    if (value) {
                        newElemField.textContent = value
                    }
                    this.addEventListenersForNewElement(newElem, newElemField, editor)
                    newElemField.focus()
                }
            }
        }
        this.hidePlaceholder(editor)
    }

    addEventListenersForNewElement(element: HTMLElement, editable: HTMLElement, editor: HTMLElement) {
        this.addTextInputListeners(editable, editor)
        this.addTextElementListeners(element, editor)
    }
    deleteElement(element: HTMLElement, editor: HTMLElement, focusLastElement = true) {
        const listOfElements: Array<HTMLElement> = Array.from(editor.querySelectorAll('.editorElement'))
        const indexOfElement = listOfElements.indexOf(element)
        element.remove()
        if (editor) {
            const lastChild = editor.lastElementChild as HTMLElement
            const lastChildInputFields = lastChild.querySelectorAll('.editable')
            const last = lastChildInputFields[lastChildInputFields.length - 1] as HTMLElement
            if (lastChild && last) {
                if (last.textContent === '') {
                    lastChild.classList.remove('before:hidden')
                }
                if (focusLastElement) {
                    if (indexOfElement) {
                        const elementToFocus = listOfElements[indexOfElement - 1]?.querySelector(
                            '.editable'
                        ) as HTMLElement
                        elementToFocus?.focus()
                    } else {
                        const elementToFocus = listOfElements[indexOfElement + 1]?.querySelector(
                            '.editable'
                        ) as HTMLElement
                        elementToFocus?.focus()
                    }
                }
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
        document.querySelectorAll('.editorElement')?.forEach((el) => {
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
        const elements = editor.querySelectorAll('.editorElement')
        for (let i = 0; i < elements.length; i++) {
            if (elements.length - 1 !== i) {
                if (elements[i].classList.contains('textElement')) {
                    elements[i].classList.add('before:hidden')
                }
            } else {
                if (elements[i].classList.contains('textElement')) {
                    const elem = elements[i].querySelector('.editable') as HTMLElement
                    if (elem) {
                        if (elem.textContent?.length === 0) {
                            elements[i].classList.remove('before:hidden')
                        }
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

    addNewParagraph(el: HTMLElement) {
        const template = document.createElement('template')
        template.innerHTML = emptyParagraph({})
        el.after(template.content)
        const newField = document.querySelector('.new') as HTMLElement
        const editor = document.querySelector('.textEditor') as HTMLElement
        if (newField && editor) {
            newField.classList.remove('new')
            this.addTextInputListeners(newField, editor)
            newField.focus()
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
                        type: 'title',
                        value: header.textContent,
                    },
                ]
            }
        }
        editor.querySelectorAll('.editorElement')?.forEach((el) => {
            const element = el as HTMLElement
            const textField = el.querySelector('.editable')
            if (el.classList.contains('textElement')) {
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
            if (el.classList.contains('headerElement')) {
                if (textField) {
                    const type = element.dataset.type
                    if (textField.textContent) {
                        obj.blocks.push({
                            type: 'heading',
                            mod: type,
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
            if (el.classList.contains('quoteElement')) {
                const quoteInputs: Array<BlocksType> = []
                const quoteElements = el.querySelectorAll('.editable')?.forEach((el) => {
                    quoteInputs.push({
                        type: 'text',
                        value: el.textContent ?? '',
                    })
                })
                obj.blocks.push({
                    type: 'quotes',
                    value: quoteInputs,
                })
            }
        })
        console.log(obj)
        return obj
    }

    checkSettings() {
        const keywordsInput = document.querySelector('.keywords-input') as HTMLInputElement
        const translateAuthor = document.querySelector('.translate__author') as HTMLInputElement
        const buttonTextInput = document.querySelector('.buttonTextInput') as HTMLInputElement
        const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
        const translateLink = document.querySelector('.translate__link') as HTMLInputElement
        if (keywordsInput && translateAuthor && buttonTextInput && translateCheckbox && translateLink) {
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

    addDropZoneEvents(el: HTMLElement) {
        el.addEventListener('dragenter', (e) => {
            e.preventDefault()
        })
        el.addEventListener('dragleave', (e) => {
            e.preventDefault()
            const target = e.target as HTMLElement
            if (target) {
                const parent = target.parentElement
                if (parent && parent.classList.contains('previewImageBlock')) {
                    parent.classList.add('border-color-gray-separator')
                    parent.classList.remove('border-color-button')
                }
            }
        })
        el.addEventListener('dragover', (e) => {
            e.preventDefault()
            const target = e.target as HTMLElement
            if (target) {
                const parent = target.parentElement
                if (parent && parent.classList.contains('previewImageBlock')) {
                    parent.classList.remove('border-color-gray-separator')
                    parent.classList.add('border-color-button')
                }
            }
        })
        el.addEventListener('drop', (e) => {
            e.preventDefault()
            const event = e as DragEventInit
            const dt = event.dataTransfer
            if (dt) {
                const inputFile = document.querySelector('.image-preview') as HTMLInputElement
                if (inputFile) {
                    const event = new Event('change', { bubbles: true })
                    inputFile.files = dt.files
                    inputFile.dispatchEvent(event)
                }
            }
        })
    }

    addEventListenersToPopup(popup: HTMLElement) {
        const popupButtons = Array.from(popup.children)
        popupButtons.forEach((el) => {
            const element = el as HTMLElement
            element.addEventListener('click', () => {
                const item = document.querySelector('.focusedItem')
                const editor = document.querySelector('.textEditor') as HTMLElement
                if (item && editor) {
                    const template = document.createElement('template')
                    console.log(element)
                    switch (element.dataset.type) {
                        case 'heading':
                            template.innerHTML = headingBlockTemplate({})
                            break
                        case 'quote':
                            template.innerHTML = quoteBlockTemplate({})
                            break
                    }
                    item.replaceWith(template.content)
                    const newItem = document.querySelector('.new') as HTMLElement
                    if (element.dataset.type === 'heading') {
                        if (newItem) {
                            newItem.querySelectorAll('.heading')?.forEach((el) => {
                                const element = el as HTMLElement
                                element.addEventListener('click', (e) => {
                                    const parent = newItem.closest('.editorElement') as HTMLElement
                                    if (parent) {
                                        if (element.dataset.name) {
                                            parent.dataset.type = element.dataset.name
                                        }
                                    }
                                })
                            })
                        }
                    }
                    const newItemField = newItem.querySelector('.editable') as HTMLElement
                    if (editor && newItem && newItemField) {
                        newItem.classList.remove('new')
                        this.addTextElementListeners(newItem, editor)
                        this.addTextInputListeners(newItemField, editor)
                        newItemField.focus()
                        setTimeout(() => this.addNewField(editor))
                    }
                }
            })
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T, articleData?: NewArticleData) {
        return super.emit(event, arg, articleData)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T, articleData: NewArticleData) => void) {
        return super.on(event, callback)
    }
}
