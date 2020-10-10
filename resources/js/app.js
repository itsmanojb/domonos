import axios from 'axios';
import Noty from 'noty';

const addtoCartBtn = document.querySelectorAll('.addToCart');
const cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza) {
  axios.post('/update-cart', pizza).then((res) => {
    cartCounter.innerText = res.data.totalQty;
    new Noty({
      type: 'success',
      text: 'Item added to cart',
      timeout: 1000,
      progressBar: false
    }).show()
  }).catch((err) => {
    new Noty({
      type: 'error',
      text: 'Something went wrong',
      timeout: 1000,
      progressBar: false,
    }).show()
  })
}

addtoCartBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  })
})