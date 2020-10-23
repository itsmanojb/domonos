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
            // console.log(orders);
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('customer/orders', {
                orders
            });
        },
        async currentOrders(req, res) {
            const orders = await Order.find({
                customerId: req.user._id,
                status: {
                    $ne: 'completed'
                }
            }, null, {
                sort: {
                    'createdAt': -1
                }
            });
            return res.json({
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

                Order.populate(result, {
                    path: 'customerId'
                }, (err, data) => {

                    req.flash('success', 'Order placed successfully');
                    delete req.session.cart;

                    // Emit event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('order_place', {
                        data
                    });

                    return res.redirect('/orders')

                })

            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart')
            });
        },
        async trackOrder(req, res) {
            const order = await Order.findById(req.params.id);

            if (req.user._id.toString() === order.customerId.toString()) {
                return res.json({
                    order
                })
            }

            return res.redirect('/')
        }
    }
}

module.exports = orderController;