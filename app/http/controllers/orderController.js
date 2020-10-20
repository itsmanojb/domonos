const Order = require('../../models/order');

function orderController(params) {
    return {
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

            console.log(order);
            order.save().then(result => {
                req.session.cart = null;
                req.flash('success', 'Order placed successfully');
                return res.redirect('/')

            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart')
            });
        }
    }
}

module.exports = orderController;