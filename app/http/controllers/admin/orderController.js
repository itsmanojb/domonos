const Order = require('../../../models/order');

function adminOrderController() {
    return {
        index(req, res) {
            Order.find({
                    status: {
                        $ne: 'completed'
                    }
                }, null, {
                    sort: {
                        'createdAt': -1
                    }
                }).populate('customerId', '-password -addresses -createdAt -updatedAt')
                .exec((err, orders) => {

                    return res.render('admin/orders', {
                        orders
                    });
                });
        },
        getCurrentOrders(req, res) {
            Order.find({
                    status: {
                        $ne: 'completed'
                    }
                }, null, {
                    sort: {
                        'createdAt': -1
                    }
                }).populate('customerId', '-password -addresses -createdAt -updatedAt')
                .exec((err, orders) => {

                    return res.status(200).json(orders);

                });
        },
        async update(req, res) {
            const {
                orderId,
                status
            } = req.body;

            const currentStatus = (await Order.findById(orderId)).toJSON().status;
            if (
                (currentStatus === 'order_placed' && status !== 'confirmed') ||
                (currentStatus === 'confirmed' && status !== 'prepared') ||
                (currentStatus === 'prepared' && status !== 'dispatched') ||
                (currentStatus === 'dispatched' && status !== 'delivered') ||
                (currentStatus === 'delivered' && status !== 'completed')
            ) {
                req.flash('error', 'Update not allowed');
                return res.redirect('/admin/orders');
            }

            Order.updateOne({
                _id: orderId
            }, {
                status
            }, (err, data) => {
                if (err) {
                    req.flash('error', 'Something went wrong');
                }
                return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = adminOrderController;