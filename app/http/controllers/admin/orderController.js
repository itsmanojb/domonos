const Order = require('../../../models/order');

function adminOrderController() {
  return {
    index(req, res) {
      Order.find(
        {
          status: {
            $ne: 'completed',
          },
        },
        null,
        {
          sort: {
            createdAt: -1,
          },
        }
      )
        .populate('customerId', '-password -addresses -createdAt -updatedAt')
        .exec((err, orders) => {
          return res.render('admin/orders', {
            orders,
          });
        });
    },
    getCurrentOrders(req, res) {
      Order.find(
        {
          status: {
            $ne: 'completed',
          },
        },
        null,
        {
          sort: {
            createdAt: -1,
          },
        }
      )
        .populate('customerId', '-password -addresses -createdAt -updatedAt')
        .exec((err, orders) => {
          return res.json({
            orders,
          });
        });
    },
    getCompletedOrders(req, res) {
      Order.find(
        {
          status: 'completed',
        },
        null,
        {
          sort: {
            createdAt: -1,
          },
        }
      )
        .populate('customerId', '-password -addresses -createdAt -updatedAt')
        .exec((err, orders) => {
          return res.render('admin/all-orders', {
            orders,
          });
        });
    },
    async update(req, res) {
      const { orderId, status } = req.body;

      const currentStatus = (await Order.findById(orderId)).toJSON().status;
      if (
        (currentStatus === 'order_placed' && status !== 'confirmed') ||
        (currentStatus === 'confirmed' && status !== 'preparing') ||
        (currentStatus === 'preparing' && status !== 'dispatched') ||
        (currentStatus === 'dispatched' && status !== 'delivered') ||
        (currentStatus === 'delivered' && status !== 'completed')
      ) {
        req.flash('error', 'Update not allowed');
        return res.redirect('/admin/orders');
      }

      Order.updateOne(
        {
          _id: orderId,
        },
        {
          status,
        },
        (err, data) => {
          if (err) {
            req.flash('error', 'Something went wrong');
          }
          // Emit event
          if (status !== 'completed') {
            const eventEmitter = req.app.get('eventEmitter');
            eventEmitter.emit('order_update', {
              id: orderId,
              status,
            });
          }
          return res.redirect('/admin/orders');
        }
      );
    },
  };
}

module.exports = adminOrderController;
