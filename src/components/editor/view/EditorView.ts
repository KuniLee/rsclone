import EventEmitter from 'events'
import type { EditorModel } from '../model/EditorModel'
import textEditor from '@/templates/textEditor.hbs'
import newField from '@/templates/textEditorNewField.hbs'
import { Flows, Paths, Sandbox } from 'types/enums'
import { PageModelInstance } from '@/components/mainPage/model/PageModel'
import { Plugins, Sortable } from '@shopify/draggable'
import { SortableEventNames } from '@shopify/draggable'
import 'select-pure'
import { BlocksType, NewArticleData, ParsedArticle, ParsedPreviewArticle } from 'types/types'
import authErrorPage from '@/templates/authError.hbs'
import Dictionary, { getWords, language } from '@/utils/dictionary'
import { EditorBlocks } from '@/utils/editorPopupWithBlocks'
import headingBlockTemplate from '@/templates/textEditorHeaderTemplate.hbs'
import quoteBlockTemplate from '@/templates/textEditorQuoteTemplate.hbs'
import emptyParagraph from '@/templates/paragraph.hbs'
import imageBlockTemplate from '@/templates/textEditorImageTemplate.hbs'
import { SelectPure } from 'select-pure/lib/components'
import dictionary from '@/utils/dictionary'

type ItemViewEventsName = 'GOTO' | 'ARTICLE_PARSED'

export type EditorViewInstance = InstanceType<typeof EditorView>

export class EditorView extends EventEmitter {
    private editorModel: EditorModel
    private pageModel: PageModelInstance
    private isGlobalListener: boolean
    private previewEditorBuilded: boolean
    private blocksPopup: EditorBlocks
    private dictionary: Record<string, language>
    private lang: 'ru' | 'en'

    constructor(editorModel: EditorModel, pageModel: PageModelInstance) {
        super()
        this.editorModel = editorModel
        this.pageModel = pageModel
        this.isGlobalListener = false
        this.previewEditorBuilded = false
        this.dictionary = dictionary.EditorPage
        this.lang = this.pageModel.lang
        this.blocksPopup = new EditorBlocks(this.lang)
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
        console.log(this.pageModel.user)
        const main = document.querySelector('main')
        const flows = Object.keys(Flows)
            .filter((el) => el !== 'All')
            .map((el) => el.toLowerCase())
        if (main) {
            main.innerHTML = textEditor({
                userName: this.pageModel.user.displayName,
                userAvatar: this.pageModel.user.properties.avatar
                    ? this.pageModel.user.properties.avatar
                    : require('@/assets/icons/avatar.svg'),
                flows,
                neverPublish: this.dictionary.NeverPublish[this.lang],
                title: this.dictionary.Title[this.lang],
                menuCall: this.dictionary.MenuCall[this.lang],
                delete: this.dictionary.Delete[this.lang],
                toSettings: this.dictionary.ToSettings[this.lang],
                postSettings: this.dictionary.PostSettings[this.lang],
                language: this.dictionary.Language[this.lang],
                languageButtonRu: this.dictionary.LanguageRu[this.lang],
                languageButtonEn: this.dictionary.LanguageEn[this.lang],
                flowsInput: this.dictionary.Flows[this.lang],
                flowsHint: this.dictionary.FlowsHint[this.lang],
                keywords: this.dictionary.Keywords[this.lang],
                keywordsHint: this.dictionary.KeywordsHint[this.lang],
                translation: this.dictionary.Translation[this.lang],
                translationCheckText: this.dictionary.TranslationCheckboxText[this.lang],
                translationAuthor: this.dictionary.TranslationAuthor[this.lang],
                translationAuthorHint: this.dictionary.TranslationAuthorHint[this.lang],
                translationLink: this.dictionary.TranslationLink[this.lang],
                translationLinkHint: this.dictionary.TranslationLinkHint[this.lang],
                difficult: this.dictionary.Difficult[this.lang],
                difficultNone: this.dictionary.DifficultNone[this.lang],
                difficultEasy: this.dictionary.DifficultEasy[this.lang],
                difficultMedium: this.dictionary.DifficultMedium[this.lang],
                difficultHard: this.dictionary.DifficultHard[this.lang],
                previewHeader: this.dictionary.PreviewHeader[this.lang],
                addCover: this.dictionary.AddCover[this.lang],
                coverInfo: this.dictionary.CoverInfo[this.lang],
                uploadCover: this.dictionary.UploadCoverButton[this.lang],
                previewTextPlaceholder: this.dictionary.PreviewTextPlaceholder[this.lang],
                previewHint: this.dictionary.PreviewHint[this.lang],
                readMoreText: this.dictionary.ReadMoreText[this.lang],
                readMoreTextPlaceholder: this.dictionary.ReadMoreTextPlaceholder[this.lang],
                backToPublication: this.dictionary.BackToPublication[this.lang],
                sendArticle: this.dictionary.SendArticle[this.lang],
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
            const selectPure = document.querySelector('select-pure') as SelectPure
            if (selectPure) {
                selectPure.addEventListener('change', (e) => {
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
                    const title = String(parseMainEditorResult.blocks[0].value)
                    parseMainEditorResult.blocks.shift()
                    const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
                    const parsedKeywords = keywordsInput.value ? keywordsInput.value.split(', ') : []
                    const lang = (document.querySelector("input[name='lang']:checked") as HTMLInputElement)?.value
                    const image = document.querySelector('.preview-image') as HTMLImageElement
                    const selectFlowInput = document.querySelector('select-pure') as SelectPure
                    const imageSrc = image ? image.getAttribute('src') : ''
                    const objectPosition = image.style.objectPosition?.split(' ')
                    console.log(objectPosition)
                    const imageSrcResult = imageSrc ?? ''
                    const textButtonValue = buttonText.value
                    const preview: ParsedPreviewArticle = {
                        image: imageSrcResult,
                        nextBtnText: textButtonValue,
                        imagePosition: objectPosition,
                        previewBlocks: parsedPreviewResult.blocks,
                    }
                    const result: NewArticleData = {
                        blocks: parseMainEditorResult.blocks,
                        title: title,
                        keywords: parsedKeywords,
                        flows: selectFlowInput.values,
                        lang: lang,
                        preview: preview,
                        userId: this.pageModel.user.uid,
                        translateAuthor: translateAuthor.value,
                        translateLink: translateLink.value,
                        isTranslate: translateCheckbox.checked,
                    }
                    console.log(result)
                    // this.emit('ARTICLE_PARSED', undefined, result)
                }
            })
            this.toggleEditorView()
        })
        document.querySelector('.backToEditor')?.addEventListener('click', (e) => {
            e.preventDefault()
            this.toggleEditorView()
        })
        const previewImage = document.querySelector('.preview-image') as HTMLImageElement
        const previewControls = document.querySelector('.preview-image-controls') as HTMLElement
        const deletePreview = document.querySelector('.delete-preview-btn') as HTMLElement
        const changePosition = document.querySelector('.change-position-preview-btn') as HTMLElement
        const savePosition = document.querySelector('.save-position') as HTMLElement
        const textPreview = document.querySelector('.load-image-preview-text')
        const previewImageInput = document.querySelector('.image-preview') as HTMLInputElement
        const previewImageBlock = document.querySelector('.previewImageBlock') as HTMLElement
        deletePreview?.addEventListener('click', (e) => {
            e.preventDefault()
            if (previewImage) {
                previewImage.classList.add('hidden')
                previewImage.src = ''
                delete previewImage.dataset.objectX
                delete previewImage.dataset.objectY
                previewImage.style.removeProperty('object-position')
                previewControls.hidden = true
                if (previewImageInput) {
                    previewImageInput.value = ''
                }
                if (textPreview) {
                    textPreview.classList.remove('hidden')
                }
            }
        })
        changePosition?.addEventListener('click', (e) => {
            e.preventDefault()
            if (savePosition && changePosition && deletePreview) {
                changePosition.hidden = true
                deletePreview.hidden = true
                savePosition.hidden = false
                previewImageBlock?.addEventListener('pointerdown', () => {
                    if (!savePosition.hidden) {
                        previewImageBlock.classList.add('cursor-move')
                        document.body.addEventListener('pointermove', this.changePreviewPosition)
                    }
                })
                previewImageBlock?.addEventListener('pointerup', () => {
                    previewImageBlock.classList.remove('cursor-move')
                    document.body.removeEventListener('pointermove', this.changePreviewPosition)
                })
                previewImageBlock?.addEventListener('pointerleave', () => {
                    previewImageBlock.classList.remove('cursor-move')
                    document.body.removeEventListener('pointermove', this.changePreviewPosition)
                })
            }
        })
        savePosition?.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const [objectX, objectY] = previewImage.style.objectPosition.split(' ')
            previewImage.dataset.objectX = objectX
            previewImage.dataset.objectY = objectY
            if (savePosition && changePosition && deletePreview) {
                changePosition.hidden = false
                deletePreview.hidden = false
                savePosition.hidden = true
            }
        })
        savePosition?.addEventListener('pointermove', (e) => {
            e.stopPropagation()
        })
        previewImageInput?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            if (target) {
                if (target.files) {
                    if (!target.files.length) {
                        return
                    } else {
                        const coverMessage = document.querySelector('.add-cover-message') as HTMLElement
                        const coverErrorMessage = document.querySelector('.preview-error-cover') as HTMLElement
                        if (target.files[0].size > 1048576) {
                            if (coverMessage && coverErrorMessage) {
                                coverMessage.hidden = true
                                coverErrorMessage.hidden = false
                            }
                            return
                        }
                        if (coverMessage && coverErrorMessage) {
                            coverMessage.hidden = false
                            coverErrorMessage.hidden = true
                        }
                        const fileTypes = ['jpg', 'jpeg', 'png', 'gif']
                        const extension = target.files[0].name.split('.').pop()?.toLowerCase()
                        if (extension && fileTypes.includes(extension)) {
                            const fileReader = new FileReader()
                            fileReader.readAsDataURL(target.files[0])
                            fileReader.onload = () => {
                                if (previewImage && previewControls) {
                                    if (typeof fileReader.result === 'string') {
                                        previewImage.src = fileReader.result
                                        previewImage.classList.remove('hidden')
                                        previewControls.hidden = false
                                        if (textPreview) {
                                            textPreview.classList.add('hidden')
                                        }
                                    }
                                }
                            }
                        } else {
                            alert('wrong type of file')
                        }
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
            mirror: {
                constrainDimensions: true,
            },
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
            const menu = document.querySelector('.menu') as HTMLElement
            document.addEventListener('click', (el) => {
                const modalOptionsList = document.querySelectorAll('.options__drop-menu')
                modalOptionsList.forEach((el) => {
                    const element = el as HTMLElement
                    if (element.classList.contains('open')) {
                        element.hidden = true
                        element.classList.remove('open')
                    }
                })
                if (menu) {
                    menu.hidden = true
                    document.querySelectorAll('.focused')?.forEach((el) => el.classList.remove('focused'))
                }
            })

            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (menu && !menu.hidden) {
                        const menuItemActive = menu.querySelector('.activeMenu') as HTMLButtonElement
                        if (menuItemActive) {
                            menuItemActive.click()
                        }
                    }
                }
            })
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    if (menu && !menu.hidden) {
                        this.navigateInMenu(e.key)
                    }
                }
            })
        }
    }

    addTextInputListeners(el: HTMLElement, editor: HTMLElement) {
        const parent = el.parentNode as HTMLElement
        const menu = document.querySelector('.menu') as HTMLElement
        el.addEventListener('keypress', (e) => {
            const event = e as KeyboardEvent
            const value = el.textContent
            if (event.key === 'Enter') {
                e.preventDefault()
                if (menu && menu.hidden) {
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
            }
        })
        el.addEventListener('input', (e) => {
            const event = e as KeyboardEvent
            const target = el as HTMLElement
            const value = target.textContent
            if (parent) {
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
                if (menu && !menu.hidden) {
                    e.preventDefault()
                }
                setTimeout(() => {
                    const listOfEditors: Array<HTMLElement> = Array.from(editor.querySelectorAll('.editable'))
                    const currentItemIndex = listOfEditors.indexOf(el)
                    if (menu && menu.hidden) {
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
                    }
                }, 0)
            }
        })
        el.addEventListener('focus', (e) => {
            document.querySelectorAll('.focused')?.forEach((el) => el.classList.remove('focused'))
            document.querySelectorAll('.focusedItem')?.forEach((el) => el.classList.remove('focusedItem'))
            document.querySelectorAll('.plusOpen')?.forEach((el) => el.classList.remove('plusOpen'))
            const target = el as HTMLElement
            const parent = target.closest('.editorElement')
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(target)
            range.collapse(false)
            if (target.textContent === '') {
                if (target.textContent.length) {
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
    }

    addTextElementListeners(textElement: HTMLElement, editor: HTMLElement) {
        'input change'.split(' ').forEach((eventName) => {
            textElement.querySelector('.image-block__textarea')?.addEventListener(eventName, (e) => {
                const target = e.target as HTMLElement
                target.style.height = 22 + 'px'
                target.style.height = target.scrollHeight + 'px'
            })
        })
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
            document.querySelectorAll('.focused')?.forEach((el) => el.classList.remove('focused'))
            document.querySelectorAll('.focusedItem')?.forEach((el) => el.classList.remove('focusedItem'))
            el.closest('.editorElement')?.classList.add('focused')
            el.closest('.editorElement')?.classList.add('focusedItem')
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
            const plusBlock = el.closest('.plus')
            if (plusBlock) {
                const menu = document.querySelector('.menu') as HTMLElement
                const parent = el.closest('.editorElement')
                if (menu && parent) {
                    plusBlock.classList.add('plusOpen')
                    parent.classList.add('focused')
                    parent.classList.add('focusedItem')
                    const rect = el.getBoundingClientRect()
                    const parentRect = editor.getBoundingClientRect()
                    const elComputedStyles = getComputedStyle(el)
                    menu.style.top = `${rect.top - parentRect.top + parseInt(elComputedStyles.height)}px`
                    menu.hidden = false
                    e.stopImmediatePropagation()
                }
            }
            if (el.closest('.imageContainer') && !textElement.classList.contains('image-added')) {
                const inputField = textElement.querySelector('.image-elem__input') as HTMLInputElement
                const event = new MouseEvent('click', { bubbles: false })
                inputField?.dispatchEvent(event)
                inputField?.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement
                    if (target) {
                        if (target.files) {
                            if (!target.files.length) {
                                return
                            } else {
                                const fileTypes = ['jpg', 'jpeg', 'png', 'gif']
                                const extension = target.files[0].name.split('.').pop()?.toLowerCase()
                                if (extension && fileTypes.includes(extension)) {
                                    const fileReader = new FileReader()
                                    fileReader.readAsDataURL(target.files[0])
                                    fileReader.onload = () => {
                                        const imgElement = textElement.querySelector('.image') as HTMLImageElement
                                        const figureElem = textElement.querySelector('.imageFigureTag') as HTMLElement
                                        const placeholder = textElement.querySelector(
                                            '.imageElementPlaceholder'
                                        ) as HTMLElement
                                        if (imgElement && placeholder && figureElem) {
                                            placeholder.hidden = true
                                            if (typeof fileReader.result === 'string') {
                                                imgElement.src = fileReader.result
                                                figureElem.hidden = false
                                                textElement.classList.add('image-added')
                                            }
                                        }
                                    }
                                } else {
                                    alert('wrong type of file')
                                }
                            }
                        }
                    }
                })
            }
        })
        textElement.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            e.preventDefault()
            if (editor.querySelectorAll('.editorElement')?.length !== 1) {
                this.deleteElement(textElement, editor)
            }
        })
        textElement.querySelector('.choseAnotherImage')?.addEventListener('click', (e) => {
            e.preventDefault()
            const inputField = textElement.querySelector('.image-elem__input') as HTMLInputElement
            const event = new MouseEvent('click', { bubbles: false })
            inputField?.dispatchEvent(event)
        })
    }
    addNewField(editor: HTMLElement, value?: string) {
        let el: Element | null = editor.querySelector('.focused') as HTMLElement
        el = el ? el : editor.lastElementChild
        if (el) {
            const template = document.createElement('template')
            template.innerHTML = newField({
                menuCall: this.dictionary.MenuCall[this.lang],
                delete: this.dictionary.Delete[this.lang],
            })
            el.after(template.content)
            const newElem = editor.querySelector('.new') as HTMLElement
            if (newElem) {
                if (editor.classList.contains('textPreviewEditor')) {
                    newElem.dataset.isEmpty = 'Введите текст'
                    if (value) {
                        const dragIcon = newElem.querySelector('.drag')
                        dragIcon?.classList.remove('hidden')
                    }
                    newElem.querySelector('.plus')?.remove()
                }
                const newElemField = newElem.querySelector('.editable') as HTMLElement
                if (newElemField) {
                    newElem.classList.remove('new')
                    if (value) {
                        newElemField.textContent = value
                    }
                    this.addEventListenersForNewElement(newElem, newElemField, editor)
                    document.querySelectorAll('.focused')?.forEach((el) => {
                        el.classList.remove('focused')
                    })
                    document.querySelectorAll('.focusedItem')?.forEach((el) => {
                        el.classList.remove('focusedItem')
                    })
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
                        if (!editor.classList.contains('textPreviewEditor')) {
                            obj.blocks.push({
                                type: 'text',
                                value: '',
                            })
                        }
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
                            type: 'text',
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
            if (el.classList.contains('imageElement')) {
                const image = el.querySelector('.image') as HTMLImageElement
                const figcaption = el.querySelector('.image-block__textarea') as HTMLTextAreaElement
                if (image && figcaption) {
                    if (image.src) {
                        obj.blocks.push({
                            type: 'image',
                            imageSrc: image.src,
                            value: figcaption.value,
                        })
                    }
                }
            }
        })
        return obj
    }

    checkSettings() {
        const keywordsInput = document.querySelector('.keywords-input') as HTMLInputElement
        const translateAuthor = document.querySelector('.translate__author') as HTMLInputElement
        const buttonTextInput = document.querySelector('.buttonTextInput') as HTMLInputElement
        const translateCheckbox = document.querySelector('.isTranslate-checkbox') as HTMLInputElement
        const translateLink = document.querySelector('.translate__link') as HTMLInputElement
        const selectFlowInput = document.querySelector('select-pure') as SelectPure
        if (
            keywordsInput &&
            translateAuthor &&
            buttonTextInput &&
            translateCheckbox &&
            translateLink &&
            selectFlowInput
        ) {
            const checkFlowsResult = selectFlowInput.values.length > 0
            const flowsError = document.querySelector('.flows-error')
            if (flowsError) {
                checkFlowsResult
                    ? flowsError.classList.remove('text-[#ff8d85]')
                    : flowsError.classList.add('text-[#ff8d85]')
            }
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

    navigateInMenu(key: string) {
        const menuElements = Array.from(document.querySelectorAll('.menuElement'))
        const currentItem = document.querySelector('.activeMenu')
        if (!currentItem) {
            if (menuElements.length) {
                menuElements[0].classList.add('activeMenu')
            }
        } else {
            const currentIndex = menuElements.indexOf(currentItem)
            if (key === 'ArrowUp') {
                if (!menuElements[currentIndex - 1]) {
                    menuElements.at(-1)?.classList.add('activeMenu')
                } else {
                    menuElements[currentIndex - 1].classList.add('activeMenu')
                }
            }
            if (key === 'ArrowDown') {
                if (!menuElements[currentIndex + 1]) {
                    menuElements[0].classList.add('activeMenu')
                } else {
                    menuElements[currentIndex + 1].classList.add('activeMenu')
                }
            }
            currentItem.classList.remove('activeMenu')
        }
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
                    switch (element.dataset.type) {
                        case 'heading':
                            template.innerHTML = headingBlockTemplate({
                                heading: this.dictionary.Heading[this.lang],
                                delete: this.dictionary.Delete[this.lang],
                                heading1: this.dictionary.Heading1[this.lang],
                                heading2: this.dictionary.Heading2[this.lang],
                                heading3: this.dictionary.Heading3[this.lang],
                            })
                            break
                        case 'quote':
                            template.innerHTML = quoteBlockTemplate({
                                delete: this.dictionary.Delete[this.lang],
                                quote: this.dictionary.Quote[this.lang],
                            })
                            break
                        case 'image':
                            template.innerHTML = imageBlockTemplate({
                                addImageText: this.dictionary.AddImageText[this.lang],
                                figcaptionText: this.dictionary.AddFigcaptionText[this.lang],
                                delete: this.dictionary.Delete[this.lang],
                                uploadAnother: this.dictionary.LoadAnotherImage[this.lang],
                            })
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
                    if (newItem) {
                        const newItemField = newItem.querySelector('.editable') as HTMLElement
                        if (editor && newItem) {
                            newItem.classList.remove('new')
                            this.addNewField(editor)
                            if (newItemField) {
                                this.addTextInputListeners(newItemField, editor)
                                setTimeout(() => {
                                    newItemField.focus()
                                }, 0)
                            }
                            this.addTextElementListeners(newItem, editor)
                        }
                    }
                }
            })
        })
    }

    async changePreviewPosition(event: PointerEvent) {
        const previewImage = document.querySelector('.preview-image') as HTMLElement
        const previewBlock = document.querySelector('.previewImageBlock') as HTMLElement
        if (previewImage && previewBlock) {
            const previewBlockStyles = getComputedStyle(previewBlock)
            const rect = previewBlock.getBoundingClientRect()
            const previewBlockHeight = parseFloat(previewBlockStyles.height)
            const previewBlockWidth = parseFloat(previewBlockStyles.width)
            const clickCoordinateX = event.clientX
            const clickCoordinateY = event.clientY
            let coordinateX = ((clickCoordinateX - rect.left) / previewBlockWidth) * 100
            let coordinateY = ((clickCoordinateY - rect.top) / previewBlockHeight) * 100
            if (coordinateX < 0) {
                coordinateX = 0
            }
            if (coordinateX > 100) {
                coordinateX = 0
            }
            if (coordinateY < 0) {
                coordinateY = 0
            }
            if (coordinateY > 100) {
                coordinateY = 100
            }
            await new Promise((r) => requestAnimationFrame(r))
            previewImage.style.objectPosition = `${coordinateX}% ${coordinateY}%`
        }
    }

    emit<T>(event: ItemViewEventsName, arg?: T, articleData?: NewArticleData) {
        return super.emit(event, arg, articleData)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T, articleData: NewArticleData) => void) {
        return super.on(event, callback)
    }
}
