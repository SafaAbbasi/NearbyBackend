
const JWT = require('jsonwebtoken');

module.exports.sign = (user) => {
    return JWT.sign({
        iss: 'Nearby',
        sub: user.id,
    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 })
}
