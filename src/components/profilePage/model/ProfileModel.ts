import EventEmitter from 'events'
export type ProfileModelInstance = InstanceType<typeof ProfileModel>

export class ProfileModel extends EventEmitter {
    constructor() {
        super()
    }
}
