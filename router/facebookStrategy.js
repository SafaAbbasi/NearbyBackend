const router = require('express').Router();
const passport = require('passport');

require('../configurations/strategy-facebook')

const signToken = require('../configurations/signToken');

router.get('/token',
    passport.authenticate('facebook-token', { session: false }),
    (req, res) => {

        let token = signToken.sign(req.user);
        res.status(200).json({ text: "Success", token })

    }
)

module.exports = router