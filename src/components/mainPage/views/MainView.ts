import { PopupSettings } from '@/utils/popupSettings'
import EventEmitter from 'events'
import type { PageModel } from '../model/PageModel'
import headerTemplate from '@/templates/header.hbs'
import sidebarUserMenuTemplate from '@/templates/sidebarUserMenu.hbs'
import { Flows, Paths } from 'types/enums'
import dictionary from '@/utils/dictionary'
import { DropdownMenu } from '@/utils/dropdownMenu'
import footerTemplate from '@/templates/footer.hbs'
import { DropdownMenuElements, HeaderElements, rootModel, SidebarUserMenuElements } from 'types/interfaces'
import emptyAvatar from '@/assets/icons/avatar.svg'
import preloader from '@/templates/preloader.html'

type ItemViewEventsName = 'GOTO' | 'SIGN_OUT' | 'PAGE_BUILD'

export type MainViewInstance = InstanceType<typeof MainView>

export class MainView extends EventEmitter {
    private model: PageModel
    private mainPageContainer: HTMLElement
    private footerEl: HTMLElement

    constructor(model: PageModel) {
        super()
        this.model = model
        this.mainPageContainer = document.createElement('main')
        this.mainPageContainer.classList.add('main', 'sm:mt-3', 'mb-10')
        this.footerEl = this.createFooter()
        this.showPreloader()
        this.model.on('404', () => {
            this.show404page()
        })
        this.model.on('AUTH_LOADED', () => {
            this.buildPage()
            this.emit('PAGE_BUILD')
        })
    }

    emit<T>(event: ItemViewEventsName, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: ItemViewEventsName, callback: (arg: T) => void) {
        return super.on(event, callback)
    }

    buildPage() {
        const dropdownMenu = new DropdownMenu(this.model)
        const popupSettings = new PopupSettings(this.model)
        const headerEl = this.createHeader()
        const dropdownMenuEl = dropdownMenu.create()
        const popupSettingsEl = popupSettings.create()
        const sidebarUserMenuEl = this.createSidebarUserMenu()
        this.render(headerEl)
        this.addListeners({
            header: headerEl,
            dropdownMenu: dropdownMenuEl,
            popupSettings: popupSettingsEl,
            sidebarUserMenu: sidebarUserMenuEl,
        })
    }

    private addListeners({ header, dropdownMenu, popupSettings, sidebarUserMenu }: HeaderElements) {
        const navLinksEl = header.querySelectorAll('.nav__link')
        const burgerEl = header.querySelector('.burger')
        const headerFlowsEl = header.querySelector('.header__flows')
        const overlayEl = this.createOverlay()
        const headerLinksEl = header.querySelectorAll('.header__link')
        const userIconEl = header.querySelector('.user-img')
        const userDesktopIconEl = header.querySelector('.user-img-desktop')
        const dropdownMenuWrapperEl = header.querySelector('.drop-down-menu')
        const sidebarUserMenuEl = header.querySelector('.sidebar')

        headerLinksEl.forEach((linkEl) => {
            if (linkEl instanceof HTMLAnchorElement) {
                linkEl.addEventListener('click', (ev) => {
                    ev.preventDefault()
                    this.emit<string>('GOTO', linkEl.href)
                    this.removeActiveLink(navLinksEl)
                })
            }
        })

        if (userDesktopIconEl) {
            userDesktopIconEl.addEventListener('click', () => {
                this.toggleDropdownMenu({ header, dropdownMenu, popupSettings, overlay: overlayEl, navLinksEl })
            })
        }

        document.addEventListener(
            'click',
            (ev) => {
                const element = ev.target
                const dropDownMenuEl = header.querySelector('.drop-down-menu')
                const popupEl = header.querySelector('.popup')
                if (
                    dropDownMenuEl &&
                    element instanceof HTMLElement &&
                    dropDownMenuEl.classList.contains('drop-down-menu_active') &&
                    (!element.closest('.drop-down-menu_active') ||
                        element.classList.contains('username') ||
                        element.classList.contains('user-avatar') ||
                        element.closest('.link')) &&
                    !element.classList.contains('user-img-desktop')
                ) {
                    this.closeDropdownMenu(dropDownMenuEl, dropdownMenu)
                }
                if (
                    headerFlowsEl &&
                    headerFlowsEl.classList.contains('header__flows_active') &&
                    element instanceof HTMLElement &&
                    (element.classList.contains('nav__link') || element.classList.contains('overlay'))
                ) {
                    this.closeFlowsSidebar(headerFlowsEl, overlayEl, header)
                }
                if (popupEl && element instanceof HTMLElement && !element.closest('.popup__inner')) {
                    this.closePopup(popupSettings, overlayEl)
                }
                if (
                    sidebarUserMenuEl &&
                    sidebarUserMenuEl.classList.contains('sidebar_active') &&
                    element instanceof HTMLElement &&
                    (!element.closest('.sidebar__inner') ||
                        element.classList.contains('username') ||
                        element.classList.contains('user-avatar') ||
                        element.closest('.link'))
                ) {
                    this.closeUserMenuSidebar(sidebarUserMenuEl, sidebarUserMenu, overlayEl)
                }
            },
            true
        )

        navLinksEl.forEach((navLink) => {
            navLink.addEventListener('click', (ev) => {
                const element = ev.target
                if (element instanceof HTMLAnchorElement) {
                    this.setActiveLink(navLinksEl, element)
                }
            })
        })

        if (burgerEl) {
            burgerEl.addEventListener('click', () => {
                if (headerFlowsEl) this.openFlowsSidebar(headerFlowsEl, overlayEl, header)
            })
        }

        if (userIconEl) {
            userIconEl.addEventListener('click', () => {
                this.openSidebarUserMenu({ header, sidebarUserMenu, overlay: overlayEl, popupSettings, navLinksEl })
            })
        }

        window.addEventListener('resize', () => {
            if (headerFlowsEl && window.innerWidth > 768 && headerFlowsEl.classList.contains('header__flows_active')) {
                this.closeFlowsSidebar(headerFlowsEl, overlayEl, header)
            }
            if (
                dropdownMenuWrapperEl &&
                window.innerWidth > 768 &&
                dropdownMenuWrapperEl.classList.contains('drop-down-menu_active')
            ) {
                this.closeDropdownMenu(dropdownMenuWrapperEl, dropdownMenu)
            }
            if (
                sidebarUserMenuEl &&
                sidebarUserMenuEl.classList.contains('sidebar_active') &&
                window.innerWidth > 768
            ) {
                this.closeUserMenuSidebar(sidebarUserMenuEl, sidebarUserMenu, overlayEl)
            }
        })
    }

    show404page() {
        this.mainPageContainer.innerText = '404'
    }

    private openSidebarUserMenu({
        header,
        sidebarUserMenu,
        overlay,
        popupSettings,
        navLinksEl,
    }: SidebarUserMenuElements) {
        const sidebarWrapperEl = header.querySelector('.sidebar')
        const visualSettingsEl = sidebarUserMenu.querySelector('.visual-settings')
        if (sidebarWrapperEl) {
            sidebarWrapperEl.append(sidebarUserMenu, overlay)
            sidebarWrapperEl.classList.add('sidebar_active')
            this.addUserProfileLinksListeners(sidebarWrapperEl, navLinksEl)
            const sidebarInnerContainerEl = sidebarWrapperEl.querySelector('.sidebar__inner')
            if (sidebarInnerContainerEl) {
                Array.from(sidebarInnerContainerEl.children).forEach((sidebarChildEl) => {
                    if (sidebarChildEl instanceof HTMLAnchorElement) {
                        sidebarChildEl.addEventListener('click', (ev) => {
                            ev.preventDefault()
                            this.emit<string>('GOTO', sidebarChildEl.href)
                            this.removeActiveLink(navLinksEl)
                        })
                    }
                })
            }
        }
        document.body.classList.add('overflow-hidden')
        if (visualSettingsEl) this.openPopup(header, visualSettingsEl, popupSettings, overlay)
        this.OnExitClick(sidebarUserMenu)
    }

    private closeUserMenuSidebar(sidebarWrapper: Element, sidebarUserMenu: HTMLElement, overlay: HTMLElement) {
        sidebarWrapper.classList.remove('sidebar_active')
        sidebarUserMenu.remove()
        overlay.remove()
        document.body.classList.remove('overflow-hidden')
    }

    private openDropdownMenu({
        header,
        dropdownMenuWrapper,
        dropdownMenu,
        popupSettings,
        overlay,
        navLinksEl,
    }: DropdownMenuElements) {
        if (dropdownMenuWrapper) {
            dropdownMenuWrapper.append(dropdownMenu)
            const dropdownMenuItemsEl = dropdownMenuWrapper.querySelector('.drop-down-menu__body')
            const visualSettingsEl = dropdownMenuWrapper.querySelector('.visual-settings')
            if (dropdownMenuItemsEl) {
                Array.from(dropdownMenuItemsEl.children).forEach((dropdownMenuChildEl) => {
                    if (dropdownMenuChildEl instanceof HTMLAnchorElement) {
                        dropdownMenuChildEl.addEventListener('click', (ev) => {
                            ev.preventDefault()
                            this.emit<string>('GOTO', dropdownMenuChildEl.href)
                            this.removeActiveLink(navLinksEl)
                        })
                    }
                })
            }
            this.addUserProfileLinksListeners(dropdownMenuWrapper, navLinksEl)
            this.OnExitClick(dropdownMenu)
            if (visualSettingsEl) this.openPopup(header, visualSettingsEl, popupSettings, overlay)
        }
    }

    private addUserProfileLinksListeners(wrapper: Element, navLinksEl: NodeListOf<Element>) {
        const profileLinksEl = [wrapper.querySelector('.link'), wrapper.querySelector('.username')]
        profileLinksEl.forEach((linkEl) => {
            if (linkEl instanceof HTMLAnchorElement) {
                linkEl.addEventListener('click', (ev) => {
                    ev.preventDefault()
                    this.emit<string>('GOTO', linkEl.href)
                    this.removeActiveLink(navLinksEl)
                })
            }
        })
    }

    private openPopup(header: HTMLElement, visualSettings: Element, popupSettings: HTMLElement, overlay: HTMLElement) {
        visualSettings.addEventListener('click', () => {
            header.append(overlay, popupSettings)
            document.body.classList.add('overflow-hidden')
            Array.from(document.getElementsByName('lang')).forEach((input) => {
                if (input instanceof HTMLInputElement && this.model.lang === input.id) {
                    input.checked = true
                }
            })
        })
        const saveSettingsBtnEl = popupSettings.querySelector('.btn-save')
        const closeBtnEl = popupSettings.querySelector('.ico_close')
        if (saveSettingsBtnEl) this.OnSaveClick(saveSettingsBtnEl)
        if (closeBtnEl) {
            closeBtnEl.addEventListener('click', () => {
                this.closePopup(popupSettings, overlay)
            })
        }
    }

    private toggleDropdownMenu({ header, dropdownMenu, popupSettings, overlay, navLinksEl }: DropdownMenuElements) {
        const dropdownMenuWrapperEl = header.querySelector('.drop-down-menu')
        if (dropdownMenuWrapperEl) {
            dropdownMenuWrapperEl.classList.toggle('drop-down-menu_active')
            if (dropdownMenuWrapperEl.classList.contains('drop-down-menu_active')) {
                this.openDropdownMenu({
                    header,
                    dropdownMenuWrapper: dropdownMenuWrapperEl,
                    dropdownMenu,
                    popupSettings,
                    overlay,
                    navLinksEl,
                })
            } else {
                this.closeDropdownMenu(dropdownMenuWrapperEl, dropdownMenu)
            }
        }
    }

    private closeDropdownMenu(dropdownMenuWrapper: Element, dropdownMenu: HTMLElement) {
        if (dropdownMenuWrapper) dropdownMenuWrapper.classList.remove('drop-down-menu_active')
        dropdownMenu.remove()
    }

    private OnExitClick(dropdownMenu: HTMLElement) {
        const exit = dropdownMenu.querySelector('.exit')
        if (exit) {
            exit.addEventListener('click', (ev) => {
                ev.preventDefault()
                this.emit('SIGN_OUT')
                location.reload()
            })
        }
    }

    private OnSaveClick(saveBtn: Element) {
        saveBtn.addEventListener('click', (ev) => {
            ev.preventDefault()
            const selectedLangInput = Array.from(document.getElementsByName('lang')).find(
                (input) => input instanceof HTMLInputElement && input.checked
            )
            if (selectedLangInput) {
                localStorage.lang = selectedLangInput.id as rootModel['lang']
                location.reload()
            }
        })
    }

    private closePopup(popupSettings: HTMLElement, overlay: HTMLElement) {
        popupSettings.remove()
        overlay.remove()
        document.body.classList.remove('overflow-hidden')
    }

    private openFlowsSidebar(headerFlows: Element, sidebarOverlay: HTMLElement, header: HTMLElement) {
        headerFlows.classList.add('header__flows_active')
        headerFlows.classList.remove('hidden')
        header.appendChild(sidebarOverlay)
        document.body.classList.add('overflow-hidden')
    }

    private closeFlowsSidebar(headerFlows: Element, sidebarOverlay: HTMLElement, header: HTMLElement) {
        headerFlows.classList.remove('header__flows_active')
        headerFlows.classList.add('hidden')
        header.removeChild(sidebarOverlay)
        document.body.classList.remove('overflow-hidden')
    }

    private setActiveLink(links: NodeListOf<Element>, currentLink: HTMLElement) {
        Array.from(links).forEach((link) => {
            if (link !== currentLink) link.classList.replace('text-color-text-dark', 'text-color-text-light')
            currentLink.classList.replace('text-color-text-light', 'text-color-text-dark')
        })
    }

    private removeActiveLink(links: NodeListOf<Element>) {
        Array.from(links).forEach((link) => {
            link.classList.replace('text-color-text-dark', 'text-color-text-light')
        })
    }

    private createHeader() {
        const header = document.createElement('header')
        header.className = 'bg-color-light border-solid border-b border-color-border-header sticky top-0 header z-10'
        const flows = Object.keys(Flows).map((el) => ({
            name: dictionary.flowsNames[el as keyof typeof Flows][this.model.lang],
            link: Paths.Flows + Flows[el as keyof typeof Flows],
        }))
        flows.unshift({ name: dictionary.buttons.Feed[this.model.lang], link: Paths.Feed })
        const logo = dictionary.logo.Logo[this.model.lang]
        let currentPath = location.pathname
        if (currentPath === Flows.All) currentPath = Paths.Flows + currentPath
        header.innerHTML = headerTemplate({ flows, logo, currentPath, user: this.model.user, emptyAvatar })
        return header
    }

    private createFooter() {
        const footer = document.createElement('footer')
        footer.classList.add('footer')
        footer.innerHTML = footerTemplate({})
        return footer
    }

    private createOverlay() {
        const overlay = document.createElement('div')
        overlay.className = 'bg-color-overlay fixed top-0 bottom-0 left-0 right-0 overlay z-10'
        return overlay
    }

    private createSidebarUserMenu() {
        const sidebarWrapper = document.createElement('div')
        sidebarWrapper.className = 'fixed inset-0 sidebar__body z-20'
        const buttons = Object.keys(dictionary.buttons)
            .slice(1)
            .reduce((acc, key) => {
                return { ...acc, [key]: dictionary.buttons[key][this.model.lang] }
            }, {})
        sidebarWrapper.innerHTML = sidebarUserMenuTemplate({ buttons, user: this.model.user, emptyAvatar })
        return sidebarWrapper
    }

    private render(header: HTMLElement) {
        document.body.replaceChildren(header, this.mainPageContainer, this.footerEl)
    }

    private showPreloader() {
        document.body.innerHTML = preloader
    }
}
