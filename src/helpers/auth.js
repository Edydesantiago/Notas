const helpers = {};

helpers.isAuthenticated = (req, res, next)=>{
    if (req.isAuthenticated())
        return next();
    else {
        req.flash('error_msg', 'No authorizado');
        res.redirect('/users/signin')
    }
};

module.exports = helpers;