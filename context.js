export default class Context {
    #user
    #req

    constructor(req) {
        this.#req = req
    }

    async user() {
        if (this.#user === undefined) {
            if ( ! ('user' in this.#req.session)) return null

            this.#user = await this.#req.db.findOne('UserFull', {id: this.#req.session.user.id}, {access: {read: true}})
        }

        return this.#user
    }
}
