import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import textEditor from '@/templates/textEditor.hbs'
import newField from '@/templates/textEditorNewField.hbs'
import { Flows, Paths, Sandbox } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'

type ItemViewEventsName = 'GOTO'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
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
        document.querySelectorAll('.editable')?.forEach((el) => {
            this.addListeners(el as HTMLElement)
        })
    }

    addListeners(el: HTMLElement) {
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
        })
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = el as HTMLElement
                const value = target.textContent
                const parent = target.parentElement
                const listOfElements = document.querySelectorAll('.textElement')
                if (value === '' && parent && parent.classList.contains('textElement') && listOfElements.length !== 1) {
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
    addNewField() {
        const el = document.querySelector('.focused') as HTMLElement
        if (el) {
            const template = document.createElement('template')
            template.innerHTML = newField({})
            el.after(template.content)
            const newElem = document.querySelector('.new') as HTMLElement
            if (newElem) {
                const newElemField = newElem.querySelector('.editable') as HTMLElement
                if (newElemField) {
                    newElem.classList.remove('new')
                    this.addListeners(newElemField)
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

    hidePlaceholder() {
        const elements = document.querySelectorAll('.textElement')
        for (let i = 0; i < elements.length; i++) {
            if (elements.length - 1 !== i) {
                elements[i].classList.add('before:hidden')
            } else {
                elements[i].classList.remove('before:hidden')
            }
        }
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }
}