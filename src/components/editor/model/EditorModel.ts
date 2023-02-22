import { BlocksType, ParsedData } from './../../../types/types'
import EventEmitter from 'events'
import { Flows, Paths } from 'types/enums'
import { URLParams } from 'types/interfaces'
import { ParsedQuery } from 'query-string'

type EditorModelEventsName = 'CHANGE_PAGE' | '404' | 'ARTICLE_SAVED'
export type EditorModelInstance = InstanceType<typeof EditorModel>

export class EditorModel extends EventEmitter {
    public search: ParsedQuery<string> = {}

    constructor() {
        super()
    }

    saveArticleToLocalStorage(obj: ParsedData) {
        if (obj) {
            return new Promise((resolve) => {
                const openRequest = indexedDB.open('localSavedArticle', 1)
                openRequest.onupgradeneeded = function () {
                    const db = openRequest.result
                    if (!db.objectStoreNames.contains('article')) {
                        db.createObjectStore('article')
                    }
                }
                openRequest.onsuccess = function () {
                    console.log(openRequest.result)
                    const db = openRequest.result
                    const transaction = db.transaction('article', 'readwrite')
                    const article = transaction.objectStore('article')
                    const request = article.put(obj, 0)
                    request.onsuccess = () => {
                        console.log('data base updated')
                        resolve(true)
                    }
                    request.onerror = (e) => {
                        console.log(e)
                    }
                }
                openRequest.onerror = (e) => {
                    console.log(e)
                }
            })
        }
    }

    updateTimeLocalSaved() {
        this.emit('ARTICLE_SAVED', Date.now())
    }

    async getSavedArticle(): Promise<ParsedData | null> {
        return new Promise((resolve) => {
            const openRequest = indexedDB.open('localSavedArticle', 1)
            openRequest.onupgradeneeded = function () {
                console.log('upgrade')
                const db = openRequest.result
                if (!db.objectStoreNames.contains('article')) {
                    db.createObjectStore('article')
                    resolve(null)
                    return
                }
            }
            openRequest.onsuccess = function () {
                const db = openRequest.result
                const transaction = db.transaction('article', 'readwrite')
                const article = transaction.objectStore('article')
                const request = article.get(0)
                request.onsuccess = () => {
                    resolve(request.result)
                }
                request.onerror = () => {
                    console.log('indexedDB empty')
                    resolve(null)
                }
            }
            openRequest.onerror = () => {
                console.log('open indexedDB error')
                resolve(null)
            }
        })
    }

    async deleteArticle() {
        return new Promise((resolve) => {
            const openRequest = indexedDB.open('localSavedArticle', 2)
            openRequest.onsuccess = function () {
                const db = openRequest.result
                const transaction = db.transaction('article', 'readwrite')
                const article = transaction.objectStore('article')
                const request = article.delete(0)
                request.onsuccess = () => {
                    resolve(request.result)
                }
                request.onerror = () => {
                    console.log('delete error')
                    resolve(null)
                }
            }
            openRequest.onerror = () => {
                console.log('open indexedDB error')
                resolve(null)
            }
        })
    }

    on<T>(event: EditorModelEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    emit<T>(event: EditorModelEventsName, arg?: T) {
        return super.emit(event, arg)
    }
}
