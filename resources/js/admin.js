import axios from 'axios';
import Noty from 'noty';
import { format, parseISO } from 'date-fns';

export function initAdmin(socket) {
  const orderTableBody = document.querySelector('#adminOrderTableBody');

  let orders = [];
  let markup = '';

  if (orderTableBody) {
    axios
      .get('/admin/orders/current', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      .then((res) => {
        orders = res.data.orders;
        // console.log(orders);
        markup = generateMarkup(orders);
        orderTableBody.innerHTML = markup;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getOrdersMarkup(items) {
    let markup = '';
    for (let orderItem of Object.values(items)) {
      if (Array.isArray(orderItem)) {
        orderItem.forEach((item) => {
          markup += `
                    <div class="order-item">
                        <span class="food-type ${item.item.foodType}"></span>
                        <span class="pizza">
                            ${item.item.name}
                            <em>${item.item.size}</em> <em>${item.item.crust}</em>
                        </span>
                        <span class="qty">${item.qty}</span>
                    </div>`;
        });
      } else {
        markup += `
                <div class="order-item">
                    <span class="food-type ${orderItem.item.foodType}"></span>
                    <span class="item">${orderItem.item.name}</span>
                    <span class="qty">${orderItem.qty}</span>
                </div>`;
      }
    }
    return markup;
  }

  function getOrderOptions(status) {
    if (status === 'order_placed') {
      return `
            <option value="order_placed" selected>Placed</option>
            <option value="confirmed" >Confirmed</option>
            <option value="preparing" disabled>Preparing</option>
            <option value="dispatched" disabled>Dispatched</option>
            <option value="delivered" disabled>Delivered</option>
            <option value="completed" disabled>Completed</option>
            `;
    } else if (status === 'confirmed') {
      return `
            <option value="" selected>Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="dispatched" disabled>Dispatched</option>
            <option value="delivered" disabled>Delivered</option>
            <option value="completed" disabled>Completed</option>
            `;
    } else if (status === 'preparing') {
      return `
            <option value="" selected>Preparing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered" disabled>Delivered</option>
            <option value="completed" disabled>Completed</option>
            `;
    } else if (status === 'dispatched') {
      return `
            <option value="" selected>Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="completed" disabled>Completed</option>
            `;
    } else if (status === 'delivered') {
      return `
            <option value="" selected>Delivered</option>
            <option value="completed">Completed</option>
            `;
    } else if (status === 'completed') {
      return `<option value="" selected disabled>Completed</option>`;
    }
  }

  function generateMarkup(orders) {
    return orders
      .map((order, i) => {
        return `
                <div class="tr">
                    <div>${i + 1}</div>
                    <div class="status ${order.status}">
                        <span>${
                          order.status === 'order_placed' ? 'New' : order.status
                        }</span>
                    </div>
                    <div>
                        ${format(
                          parseISO(order.createdAt),
                          'd LLL yy, h:mm aa'
                        )}
                    </div>
                    <div class="order-items">
                        ${getOrdersMarkup(order.items)}
                    </div>
                    <div class="u">
                        <p>${order.customerId.name}</p>
                        <small>${order.customerId.contact ||
                          order.customerId.email}</small>
                    </div>
                    <div class="address">
                        <p>${order.address.address}
                        <small>${order.address.locality}</small>
                        </p>
                    </div>
                    <div class="act">
                    <form method="POST" action="/admin/order/status">
                    <input type="hidden" name="orderId" value="${order._id}" />
                        <select name="status" onchange="this.form.submit()">
                            ${getOrderOptions(order.status)}
                        </select>
                    </form>
                    </div>
                </div>
            `;
      })
      .join('');
  }

  socket.on('new_order', (order) => {
    const totalItems = Object.values(order.data.items).length;
    orders.unshift(order.data);
    markup = generateMarkup(orders);
    orderTableBody.innerHTML = markup;
    new Noty({
      type: 'success',
      text: `NEW! Order of ${totalItems} item(s) received.`,
      timeout: 3000,
      layout: 'bottomRight',
      progressBar: false,
    }).show();
  });
}
