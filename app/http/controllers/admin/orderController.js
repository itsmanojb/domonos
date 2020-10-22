const order = require('../../../models/order');
const Order = require('../../../models/order');

function orderController(params) {
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

                    if (req.xhr) {
                        return res.status(200).json(orders);
                    }

                    return res.render('admin/orders', {
                        orders
                    });
                });
        }
    }
}

module.exports = orderController;