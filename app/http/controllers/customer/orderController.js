const Order = require('../../../models/order');

function orderController(params) {
    return {
        async index(req, res) {
            const orders = await Order.find({
                customerId: req.user._id
            }, null, {
                sort: {
                    'createdAt': -1
                }
            });
            res.render('customer/orders', {
                orders
            });
        },
        store(req, res) {
            const addresses = req.user.addresses;
            if (addresses.length === 0) {
                req.flash('error', 'no address found');
                return res.redirect('/cart');
            }

            const defAddress = addresses.filter(add => add['default'] === true);
            let defaultAddress = null;
            if (addresses.length > 1) {
                if (defAddress.length !== 1) {
                    req.flash('error', 'select default address');
                    return res.redirect('/cart');
                }
                defaultAddress = defAddress[0];
            }
            defaultAddress = addresses[0];

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                address: {
                    address: defaultAddress.address,
                    locality: defaultAddress.locality,
                },
                contact: defaultAddress.contact,
                amount: req.session.cart.totalPrice
            });

            // console.log(order);
            order.save().then(result => {
                delete req.session.cart;
                req.flash('success', 'Order placed successfully');
                return res.redirect('/orders')

            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart')
            });
        }
    }
}

module.exports = orderController;