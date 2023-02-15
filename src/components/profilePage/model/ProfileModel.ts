import { UserData } from 'types/types'
import EventEmitter from 'events'
export type ProfileModelInstance = InstanceType<typeof ProfileModel>

type ProfileModelEventsName = 'USER_INFO_LOADED'

export class ProfileModel extends EventEmitter {
    private _userInfo: UserData | undefined
    constructor() {
        super()
    }

    set setUserInfo(info: UserData | undefined) {
        this._userInfo = info
        this.emit('USER_INFO_LOADED')
    }

    get userInfo() {
        return this._userInfo
    }
}
