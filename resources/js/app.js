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

const sizeSelect = document.querySelectorAll('.size-select');
const crustSelect = document.querySelectorAll('.crust-select');

sizeSelect.forEach(select => {
  select.addEventListener('change', (e) => {
    const size = e.target.value;
    const item = JSON.parse(select.closest(".menu-card").dataset.item);
    const crusts = item.options.prices.filter(p => p.size === size)[0].crusts;
    const crust = select.closest(".menu-selector").getElementsByClassName('crust-select')[0];
    const crustOptions = crust.getElementsByTagName("option");
    for (let i = 0; i < crustOptions.length; i++) {
      crustOptions[i].disabled = crusts[i] === 0 ? true : false
    }
    crust.selectedIndex = 0;
    const prices = item.options.prices.filter(p => p.size === size)[0].crusts;
    const price = prices[0];
    const priceSpan = select.closest(".menu-card").querySelector('.menu-price span');
    priceSpan.innerText = price ? `₹ ${price}` : ''
  })
});

crustSelect.forEach(select => {
  select.addEventListener('change', (e) => {
    const crust = e.target.value;
    const item = JSON.parse(select.closest(".menu-card").dataset.item);
    const sizeSelector = select.closest(".menu-selector").getElementsByClassName('size-select')[0];
    const size = sizeSelector.options[sizeSelector.selectedIndex].value;
    const prices = item.options.prices.filter(p => p.size === size)[0].crusts;
    const crustIndex = item.options.crusts.indexOf(crust);
    const price = prices[crustIndex];
    const priceSpan = select.closest(".menu-card").querySelector('.menu-price span');
    priceSpan.innerText = price ? `₹ ${price}` : ''
  })
});

const addtoCartBtn = document.querySelectorAll('.addToCart');
const cartCounter = document.querySelector('#cartCounter')

function updateCart(item) {
  axios.post('/update-cart', item)
    .then((res) => {

      cartCounter.innerText = res.data.cart.totalQty;
      populateCart(res.data.cart);

      new Noty({
        type: 'success',
        text: 'Item added to cart',
        timeout: 2000,
        progressBar: false,
        layout: 'bottomRight',

      }).show()
    }).catch((err) => {
      console.log(err);
      new Noty({
        type: 'error',
        text: 'Something went wrong',
        timeout: 2000,
        progressBar: false,
        layout: 'bottomRight',

      }).show()
    })
}

function populateCart(data) {

  let items = '';

  for (let pizza of Object.values(data.items)) {
    items += `
    <div class="item">
      <figure>
          <img src="${pizza.item.image}" alt="">
      </figure>
      <div class="details">
          <h2>${pizza.item.name}</h2>
          <p>${pizza.item.description}</p>
          <div class="more">
              <span>${pizza.item.size}</span>
              <span>${pizza.item.crust}</span>
          </div>
      </div>`;

    if (pizza.item.extra) {
      items += `
        <div class="custom">
            <span>Your Customization</span>
            <p> <strong>Added topping:</strong> Extra Cheese</p>
        </div>`;
    }

    items += `
      <div class="price-q">
        <div class="quantity-control">
          <button type="button" class="less"><span class="material-icons">${pizza.qty === 1 ? 'delete_outline' : 'remove'}</span></button>
          <p>${pizza.qty}</p>
          <button type="button" class="more"><span class="material-icons">add</span></button>
        </div>
        <h5>&#8377; ${pizza.item.price * pizza.qty}</h5>
      </div>`;

    items += `</div>`;

  }

  if (!document.getElementById('sideCartItems')) {
    const container = document.getElementById('cartPreview');
    container.getElementsByClassName('empty')[0].remove();
    const sideCart = document.createElement('div');
    sideCart.classList.add('side-cart');
    const addedItems = document.createElement('div');
    addedItems.classList.add('added-items');
    addedItems.setAttribute('id', 'sideCartItems');

    addedItems.innerHTML = items;

    const cta = document.createElement('div');
    cta.classList.add('cta');
    cta.innerHTML = `<div>Subtotal <span id="sideCartSubtotal">&#8377; ${data.totalPrice}</span></div>
    <a href="/cart">Checkout</a>`;

    sideCart.appendChild(addedItems);
    sideCart.appendChild(cta);

    container.appendChild(sideCart)

  } else {
    document.getElementById('sideCartItems').innerHTML = items;
    document.getElementById('sideCartSubtotal').innerHTML = `₹ ${data.totalPrice}`;
  }
}

addtoCartBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const size = btn.closest(".menu-details").getElementsByClassName('size-select')[0];
    const selectedSize = size.options[size.selectedIndex].value;
    const crust = btn.closest(".menu-details").getElementsByClassName('crust-select')[0];
    const selectedCrust = crust.options[crust.selectedIndex].value;

    const item = JSON.parse(btn.closest(".menu-card").dataset.item);
    const crustIndex = item.options.crusts.indexOf(selectedCrust);
    const price = item.options.prices.filter(p => p.size === selectedSize)[0];
    const itemPrice = price.crusts[crustIndex];
    const extra = price.extraCheese;

    const {
      options,
      ...cartItem
    } = item;

    cartItem.price = itemPrice;
    cartItem.size = selectedSize;
    cartItem.crust = selectedCrust;
    cartItem.extra = extra;

    console.log(cartItem, extra);
    updateCart(cartItem);
  })
});

const addFirstBtn = document.querySelectorAll('.firstAdd');
addFirstBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const qController = `<div class="quantity-control inline">
    <button type="button" class="less"><span class="material-icons">delete_outline</span></button>
    <p>1</p>
    <button type="button" class="more"><span class="material-icons">add</span></button>
    </div>`;
    btn.closest('.btns').innerHTML = qController;
  })
})



const addMoreBtn = document.querySelectorAll('.addMoreBtn');
addMoreBtn.forEach(btn => {
  btn.addEventListener('click', e => {
    const lessBtn = btn.closest('.quantity-control').getElementsByClassName('less')[0];
    let count = +btn.previousElementSibling.innerText;
    const newCount = count + 1;
    const lessBtnHTML = newCount < 2 ? `<span class="material-icons">delete_outline</span>` : `<span class="material-icons">remove</span>`;
    lessBtn.innerHTML = lessBtnHTML;

    btn.previousElementSibling.innerText = `${newCount}`;
  })
})

document.addEventListener('DOMContentLoaded', function () {

  const sections = document.querySelectorAll(".scrollspy-section");
  const menu_links = document.querySelectorAll(".scrollspy-link a");

  const makeActive = (link) => menu_links[link].classList.add("active");
  const removeActive = (link) => menu_links[link].classList.remove("active");
  const removeAllActive = () => [...Array(sections.length).keys()].forEach((link) => removeActive(link));

  const sizePickers = document.querySelectorAll('.size-select');
  let event = new Event('change');
  sizePickers.forEach(picker => picker.dispatchEvent(event));

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