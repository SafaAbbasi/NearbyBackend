const router = require('express').Router()
const passport = require('passport')

require('../configurations/strategy-google')

const signToken = require('../configurations/signToken')

router.get('/token',
    passport.authenticate('google-token', { session: false }),
    (req, res) => {
        const token = signToken.sign(req.user);
        res.status(200).json({ text: "Success", token })

    }
)

module.exports = router
