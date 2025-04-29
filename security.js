import bcrypt from 'bcrypt'

function getPasswordHash(password) {
    return bcrypt.hashSync(password, 10)
}

function isPasswordValid(password, hash) {
    return bcrypt.compareSync(password, hash)
}

export default {
    getPasswordHash,
    isPasswordValid,
}
