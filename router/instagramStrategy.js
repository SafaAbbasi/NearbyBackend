const passport = require('passport');
const router = require('express').Router();
require('../configurations/strategy-instagram')

router.get('/token',
    passport.authenticate('instagram-token', { session: false }),
    (req, res) => {
        console.log(req.user);
    }
)