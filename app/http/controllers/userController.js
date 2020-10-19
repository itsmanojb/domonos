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
        },
        addAddress(req, res) {

            if (!req.body.title || !req.body.address || !req.body.contact) {
                return next(new AppError('Missing mandatory fields', 400));
            }

            const address = req.body;
            User.findByIdAndUpdate(req.user.id, {
                    $push: {
                        addresses: address
                    }
                }, {
                    new: true
                },
                (err, data) => {
                    if (err) {
                        return res.json({
                            status: 'failed'
                        });
                    } else {
                        return res.json({
                            status: 'ok',
                            data: data.addresses
                        });
                    }
                }
            )
        },
        deleteAddress(req, res) {

            const addresses = req.user.addresses;
            addresses.splice(req.body.index, 1);
            console.log(addresses);

            User.findByIdAndUpdate(
                req.user.id, {
                    addresses
                }, {
                    new: true
                },
                (err, data) => {
                    if (err) {
                        return res.json({
                            status: 'failed'
                        });
                    } else {
                        return res.json({
                            status: 'ok',
                            data: data.addresses
                        });
                    }
                }
            )
        }
    };
}

module.exports = userController;