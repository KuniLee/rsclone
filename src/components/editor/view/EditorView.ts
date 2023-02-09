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
        document.querySelectorAll('.editable')?.forEach((el) => {
            this.addTextInputListeners(el as HTMLElement)
        })
        document.querySelectorAll('.textElement')?.forEach((el) => {
            this.addTextElementListeners(el as HTMLElement)
        })
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
        const editor = document.querySelector('.textEditor') as HTMLElement
        const sortable = new Sortable<SortableEventNames | 'drag:stopped'>(editor, {
            draggable: '.textElement',
            delay: {
                mouse: 100,
                drag: 100,
                touch: 100,
            },
        })
        sortable.on('drag:stopped', () => {
            this.hidePlaceholder()
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

    addTextInputListeners(el: HTMLElement) {
        const editor = document.querySelector('.textEditor') as HTMLElement
        el.addEventListener('keypress', (e) => {
            e.preventDefault()
            const event = e as KeyboardEvent
            const item = document.querySelector('.focused')
            if (event.key !== 'Enter' && item) {
                const eventD = new KeyboardEvent('input', {
                    key: event.key,
                })
                el.dispatchEvent(eventD)
            }
            if (event.key === 'Enter') {
                this.addNewField()
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
            this.checkArticle()
        })
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = el as HTMLElement
                const value = target.textContent
                const parent = target.parentElement
                const listOfElements = document.querySelectorAll('.textElement')
                console.log('test')
                if (value === '' && parent && parent.classList.contains('textElement') && listOfElements.length !== 1) {
                    console.log('1')
                    this.deleteElement(parent)
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

    addTextElementListeners(textElement: HTMLElement) {
        const editor = document.querySelector('.textEditor') as HTMLElement
        textElement.addEventListener('click', (e) => {
            const el = e.target as HTMLElement
            document.querySelectorAll('.open')?.forEach((el) => {
                el.classList.remove('open')
                ;(el as HTMLElement).hidden = true
            })
            if (el.closest('.options__open-btn')) {
                const dropMenu = textElement.querySelector('.options__drop-menu') as HTMLElement
                if (dropMenu) {
                    dropMenu.hidden = false
                    dropMenu.classList.add('open')
                    e.stopImmediatePropagation()
                }
            }
        })
        textElement.querySelector('.delete-btn')?.addEventListener('click', () => {
            if (document.querySelectorAll('.textElement')?.length !== 1) {
                this.deleteElement(textElement)
            }
        })
    }
    addNewField() {
        const el = document.querySelector('.focused') as HTMLElement
        if (el) {
            const template = document.createElement('template')
            template.innerHTML = newField({})
            el.after(template.content)
            const newElem = document.querySelector('.new') as HTMLElement
            console.log(newElem)
            if (newElem) {
                const newElemField = newElem.querySelector('.editable') as HTMLElement
                if (newElemField) {
                    newElem.classList.remove('new')
                    this.addTextInputListeners(newElemField)
                    this.addTextElementListeners(newElem)
                    newElemField.focus()
                }
            }
        }
        this.hidePlaceholder()
    }
    deleteElement(element: HTMLElement) {
        element.remove()
        const editor = document.querySelector('.textEditor') as HTMLElement
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

    hidePlaceholder() {
        const elements = document.querySelectorAll('.textElement')
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
