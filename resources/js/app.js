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
});

document.addEventListener('DOMContentLoaded', function () {

  const sections = document.querySelectorAll(".scrollspy-section");
  const menu_links = document.querySelectorAll(".scrollspy-link a");

  const makeActive = (link) => menu_links[link].classList.add("active");
  const removeActive = (link) => menu_links[link].classList.remove("active");
  const removeAllActive = () => [...Array(sections.length).keys()].forEach((link) => removeActive(link));

  const sectionMargin = 200;
  let currentActive = 0;

  window.addEventListener("scroll", () => {

    const current = sections.length - [...sections].reverse().findIndex((section) => window.scrollY >= section.offsetTop - sectionMargin) - 1
    if (current !== currentActive) {
      removeAllActive();
      currentActive = current;
      makeActive(current);
    }
  });
}, false);