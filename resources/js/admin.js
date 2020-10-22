import axios from 'axios'

export function initAdmin() {
    const orderTableBody = document.querySelector('#adminOrderTableBody');

    let orders = [];
    let markup = ''

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then((res) => {
        orders = res.data;
        markup = generateMarkup(orders);

        orderTableBody.innerHTML = markup;
    }).catch((err) => {
        console.lof(err);
    })

    function generateMarkup(orders) {
        return orders.map(order => {
            return `
            <div></div>
            `
        }).join('')
    }
}