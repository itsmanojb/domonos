import axios from 'axios';
import {
    format,
    parseISO
} from 'date-fns';

export function initAdmin() {
    const orderTableBody = document.querySelector('#adminOrderTableBody');

    let orders = [];
    let markup = '';

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data;
        markup = generateMarkup(orders);
        orderTableBody.innerHTML = markup
    }).catch(err => {
        console.log(err)
    })

    function getOrdersMarkup(items) {
        let markup = '';
        for (let orderItem of Object.values(items)) {
            if (Array.isArray(orderItem)) {
                orderItem.forEach(item => {
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

    function generateMarkup(orders) {
        console.log(orders);
        return orders.map((order, i) => {
            return `
                <div class="tr">
                    <div>${i + 1}</div>
                    <div class="status ${order.status}">
                        <span>${order.status === 'order_placed' ? 'New': order_placed}</span>
                    </div>
                    <div>
                        ${format(parseISO(order.createdAt),  'hh:mm aa')}
                    </div>
                    <div class="order-items">
                        ${getOrdersMarkup(order.items)}
                    </div>
                    <div class="u">
                        <p>${order.customerId.name}</p>
                        <a href="tel:+${order.customerId.contact}">${order.customerId.contact}</a>
                    </div>
                    <div class="address">
                        <p>${order.address.address}
                        <small>${order.address.locality}</small>
                        </p>
                    </div>
                    <div class="act">
                        <select name="" id="">
                            <option value="confirm">Confirm</option>
                            <option value="prepared">Prepared</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            `
        }).join('')
    }
}