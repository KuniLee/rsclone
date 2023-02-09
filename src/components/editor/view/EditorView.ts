import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import textEditor from '@/templates/textEditor.hbs'
import newField from '@/templates/textEditorNewField.hbs'
import { Flows, Paths, Sandbox } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { Sortable } from '@shopify/draggable'
import { SortableEventNames } from '@shopify/draggable'
import { parsedArticle } from 'types/types'

type ItemViewEventsName = 'GOTO' | 'ARTICLE_PARSED'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance
    private isGlobalListener: boolean

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
        this.isGlobalListener = false
        this.pageModel.on('CHANGE_PAGE', () => {
            if (this.pageModel.path[0] === Paths.Sandbox && this.pageModel.path[1] === Sandbox.New) {
                this.buildPage()
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
        if (previewEditor) {
            previewEditor.querySelectorAll('.editable')?.forEach((el) => {
                this.addTextInputListeners(el as HTMLElement, previewEditor)
            })
            previewEditor.querySelectorAll('.textElement')?.forEach((el) => {
                this.addTextElementListeners(el as HTMLElement, previewEditor)
            })
            this.addDrag(previewEditor)
        }
        document.querySelector('.isTranslate')?.addEventListener('change', () => {
            const translateBlock = document.querySelector('.translate-info')
            if (translateBlock) {
                translateBlock.classList.toggle('hidden')
            }
        })
        document.querySelector('.toSettings')?.addEventListener('click', (e) => {
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
                mouse: 100,
                drag: 100,
                touch: 100,
            },
        })
        sortable.on('drag:stopped', () => {
            this.hidePlaceholder(list)
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
            document.addEventListener('click', (e) => {
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
            e.preventDefault()
            const event = e as KeyboardEvent
            const item = editor.querySelector('.focused')
            if (event.key !== 'Enter' && item) {
                const eventD = new KeyboardEvent('input', {
                    key: event.key,
                })
                el.dispatchEvent(eventD)
            }
            if (event.key === 'Enter') {
                this.addNewField(editor)
            }
        })
        el.addEventListener('input', (e) => {
            e.preventDefault()
            const event = e as KeyboardEvent
            const target = el as HTMLElement
            if (event.key !== undefined) {
                target.textContent += event.key
                const sel = window.getSelection()
                if (sel) {
                    sel.selectAllChildren(el)
                    sel.collapseToEnd()
                }
            }
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
        })
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = el as HTMLElement
                const value = target.textContent
                const parent = target.parentElement
                const listOfElements = editor.querySelectorAll('.textElement')
                if (value === '' && parent && parent.classList.contains('textElement') && listOfElements.length !== 1) {
                    this.deleteElement(parent, editor)
                }
            }
        })
        el.addEventListener('focus', (e) => {
            const target = el as HTMLElement
            const parent = target.parentElement
            if (parent) {
                parent.classList.add('focused')
            }
        })
        el.addEventListener('blur', (e) => {
            const target = el as HTMLElement
            const parent = target.parentElement
            if (parent) {
                parent.classList.remove('focused')
            }
        })
    }

    addTextElementListeners(textElement: HTMLElement, editor: HTMLElement) {
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
    addNewField(editor: HTMLElement) {
        const el = editor.querySelector('.focused') as HTMLElement
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
        const textElements = document.querySelectorAll('.textElement')?.forEach((el) => {
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

    parseArticle() {
        const header = document.querySelector('.articleHeader')
        const obj: parsedArticle = {}
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
        document.querySelectorAll('.editorElement')?.forEach((el) => {
            if (el.classList.contains('textElement')) {
                const textField = el.querySelector('.editable')
                if (textField) {
                    if (textField.textContent) {
                        obj.blocks?.push({
                            type: 'text',
                            value: textField.textContent,
                        })
                    } else {
                        obj.blocks?.push({
                            type: 'delimiter',
                        })
                    }
                }
            }
        })
        this.emit('ARTICLE_PARSED', undefined, obj)
    }

    emit<T>(event: ItemViewEventsName, arg?: T, parsedArticle?: parsedArticle) {
        return super.emit(event, arg, parsedArticle)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T, parsedArticle: parsedArticle) => void) {
        return super.on(event, callback)
    }
}
