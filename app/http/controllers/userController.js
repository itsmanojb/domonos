const User = require('../../models/user');

function userController() {
    return {
        update(req, res) {

            if (req.body.email || req.body.password || req.body.role) {
                return next(new AppError('Update not allowed', 405));
            }
            const user = req.body;
            User.findByIdAndUpdate(req.user.id, user, {
                new: true
            }).then((updated) => {
                return res.json({
                    status: 'ok',
                    user: updated
                });
            }).catch((err) => {
                return res.json({
                    status: 'failed'
                });
            });
        }
    };
}

module.exports = userController;