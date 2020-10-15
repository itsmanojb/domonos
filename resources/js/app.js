import axios from 'axios';
import Noty from 'noty';

const overlay = document.getElementById('ovly');
const hamburger = document.getElementById('hamMenu');
const leftDrawer = document.getElementById('drawerLeft');
const locationBtn = document.getElementById('locationPickerBtn');
const rightDrawer = document.getElementById('drawerRight');
const headerMenu = document.getElementById('headerMenu');

hamburger.addEventListener('click', () => {
  if (leftDrawer.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    leftDrawer.classList.remove("opened");
    headerMenu.classList.remove('inactive');
  } else {
    document.body.classList.add('noscroll');
    overlay.classList.add('shown');
    leftDrawer.classList.add('opened');
    headerMenu.classList.add('inactive');
  }
});

overlay.addEventListener('click', () => {
  if (rightDrawer.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    rightDrawer.classList.remove('opened');
    hamburger.classList.remove('inactive');
  }
  if (leftDrawer.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    leftDrawer.classList.remove("opened");
    headerMenu.classList.remove('inactive');
  }
});

locationBtn.addEventListener('click', () => {
  if (rightDrawer.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    rightDrawer.classList.remove('opened');
    hamburger.classList.remove('inactive');
  } else {
    document.body.classList.add('noscroll');
    overlay.classList.add('shown');
    rightDrawer.classList.add('opened');
    hamburger.classList.add('inactive');
  }
});

const alertUI = document.querySelector('#alertUI');
const okBtn = document.getElementById('alertOKBtn');

function showAlert(text, title = 'Oops...') {
  document.getElementById('alertTitle').innerText = title;
  document.getElementById('alertText').innerText = text;
  alertUI.classList.add('shown')
}

okBtn.addEventListener('click', (e) => {
  closeAlert()
})

function closeAlert() {
  document.getElementById('alertTitle').innerText = '';
  document.getElementById('alertText').innerText = '';
  alertUI.classList.remove('shown');
}

const addtoCartBtn = document.querySelectorAll('.addToCart');
const cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza) {
  axios.post('/update-cart', pizza).then((res) => {
    cartCounter.innerText = res.data.totalQty;
    new Noty({
      type: 'success',
      text: 'Item added to cart',
      timeout: 2000,
      progressBar: false,
      layout: 'bottomRight',

    }).show()
  }).catch((err) => {
    new Noty({
      type: 'error',
      text: 'Something went wrong',
      timeout: 2000,
      progressBar: false,
      layout: 'bottomRight',

    }).show()
  })
}

addtoCartBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const size = btn.closest(".menu-details").getElementsByClassName('size-select')[0];
    const selectedSize = size.options[size.selectedIndex].value;
    const crust = btn.closest(".menu-details").getElementsByClassName('crust-select')[0];
    const selectedCrust = crust.options[crust.selectedIndex].value;

    const item = JSON.parse(btn.dataset.item);

    const crustIndex = item.options.crusts.indexOf(selectedCrust);
    const price = item.options.prices.filter(p => p.size === selectedSize)[0];
    const itemPrice = price.crusts[crustIndex];
    const extra = price.extraCheese;

    console.log(item, itemPrice, extra);
    // updateCart(item);
  })
});

document.addEventListener('DOMContentLoaded', function () {

  const sections = document.querySelectorAll(".scrollspy-section");
  const menu_links = document.querySelectorAll(".scrollspy-link a");

  const makeActive = (link) => menu_links[link].classList.add("active");
  const removeActive = (link) => menu_links[link].classList.remove("active");
  const removeAllActive = () => [...Array(sections.length).keys()].forEach((link) => removeActive(link));

  const affix = document.getElementById("cartPreview");
  const offset = 110;

  const sectionMargin = 200;
  let currentActive = 0;

  window.addEventListener("scroll", () => {

    const current = sections.length - [...sections].reverse().findIndex((section) => window.scrollY >= section.offsetTop - sectionMargin) - 1
    if (current !== currentActive) {
      removeAllActive();
      currentActive = current;
      makeActive(current);
    }

    if (affix) {
      const sticky = affix.offsetTop;
      if (window.pageYOffset > sticky - offset) {
        affix.classList.add("fixed");
      } else {
        affix.classList.remove("fixed");
      }
    }

  });
}, false);