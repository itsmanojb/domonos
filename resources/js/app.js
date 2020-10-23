import axios from 'axios';
import Noty from 'noty';
import {
  initAdmin
} from './admin';
let socket = io();

/**
 * FUNCITONALITY: Header menu activities
 * Toggle side-drawer (left/right)
 */

const overlay = document.getElementById('ovly');
const hamburger = document.getElementById('hamMenu');
const leftDrawer = document.getElementById('drawerLeft');
const locationBtns = document.querySelectorAll('.locationPickerBtn');
const rightDrawer = document.getElementById('drawerRight');
const headerMenu = document.getElementById('headerMenu');

const addNewAddressBtn = document.getElementById('addNewAddressBtn');
const addressListView = document.getElementById('locationListUI');
const newAddressView = document.getElementById('addnewAddressUI');

if (addNewAddressBtn) {
  addNewAddressBtn.addEventListener('click', (e) => {
    addressListView.classList.add('d-none');
    newAddressView.classList.remove('d-none');
  })
}

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

locationBtns.forEach(locationBtn => {
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
      addressListView.classList.remove('d-none');
    }
  });
});


/**
 * FUNCITONALITY: Show/ Hide Alert Popup
 */

const alertUI = document.querySelector('#alertUI');
const okBtn = document.getElementById('alertOKBtn');

function showAlert(text, btnText = 'OK', title = 'Oops...') {
  document.getElementById('alertTitle').innerText = title;
  document.getElementById('alertText').innerText = text;
  document.getElementById('alertOKBtn').innerText = btnText;
  alertUI.classList.add('shown')
}

function closeAlert() {
  document.getElementById('alertTitle').innerText = '';
  document.getElementById('alertText').innerText = '';
  alertUI.classList.remove('shown');
}

okBtn.addEventListener('click', (e) => {
  closeAlert()
})

/**
 * FUNCITONALITY: Show Toast Message
 */

function showToast(type, text, timeout = 2000, layout = 'bottomRight') {
  new Noty({
    type,
    text,
    timeout,
    layout,
    progressBar: false,
  }).show()
}

/**
 * FUNCITONALITY: Show Order Tracking
 * Finds all the buttons with .track-btn, and adds click event-listener
 * Shows tracking details and fetches order details by API call
 * Calls populateOrderDetails() for order rendering
 */

let currentOrderId = '';
let currentOrder = null;

const orderTrackingUI = document.getElementById('orderTracking');
const trackBtns = document.querySelectorAll('.track-btn');
const currentOrderDetailsUI = document.getElementById('currentOrderDetailsUI');

trackBtns.forEach(trackBtn => {
  trackBtn.addEventListener('click', () => {

    document.body.classList.add('noscroll');
    overlay.classList.add('shown');
    orderTrackingUI.classList.add('opened');
    headerMenu.classList.add('inactive');

    const orderId = trackBtn.dataset.id;
    currentOrderId = orderId;
    socket.emit('join', `order_${currentOrderId}`)
    axios.get(`/order/${orderId}`).then(res => {

      const order = res.data.order;
      currentOrder = order;
      const wrapper = populateOrderDetails(order, true);
      currentOrderDetailsUI.appendChild(wrapper);

      // setTimeout(() => {
      document.getElementById('trackOrderLoader').classList.add('d-none');
      document.getElementById('trackOrderDetails').classList.remove('d-none');
      // }, 500);

    });

  });
});


/**
 * FUNCTIONALITY: Show Order Details
 * Finds all the buttons with .order-detail-btn, and adds click event-listener
 * Show order details in right drawer
 */

const orderDetailBtns = document.querySelectorAll('.order-detail-btn');
const orderDetailsUI = document.getElementById('orderDetailsUI');

orderDetailBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.add('noscroll');
    overlay.classList.add('shown');
    rightDrawer.classList.add('opened');
    hamburger.classList.add('inactive');
    addressListView.classList.add('d-none');
    orderDetailsUI.classList.remove('d-none');

    // show order details
    const order = JSON.parse(btn.closest('.order-card').dataset.order);
    const wrapper = populateOrderDetails(order, false);
    orderDetailsUI.appendChild(wrapper);
    orderDetailsUI.classList.remove('d-none');

  });
});

/**
 * FUNCTIONALITY: Generate Order Details
 * Populates order details markup for both Orders details page (right drawer) and
 * Order tracking page (left drawer)
 * @param  {} order: the whole order 
 * @param  {} trackView: true for order-tracking view
 */

function populateOrderDetails(order, trackView) {

  // console.log(order);
  const id = order._id.toString();
  const items = Object.values(order.items);
  const totalItems = items.length;
  const orderItemsTitle = [];

  const wrapper = document.createElement('div');
  wrapper.className = 'order-details-wrapper';
  const orderInfo = document.createElement('div')
  orderInfo.className = 'order-info';
  const orderId = document.createElement('span');
  const fId = id.substring(0, 3) + id.toString().substring(id.length - 2, id.length);
  orderId.innerText = 'Order Id: ' + fId;
  orderInfo.appendChild(orderId);
  const orderDate = document.createElement('p');
  orderDate.innerText = `Order Placed on ${getFormattedDate(order.createdAt)} for Amount of ₹${order.amount}`;
  orderInfo.appendChild(orderDate);

  const orderAddress = document.createElement('div')
  orderAddress.className = 'order-address';
  const address = document.createElement('p');
  address.innerText = order.address.locality ? order.address.address + ', ' + order.address.locality : order.address.address;
  orderAddress.appendChild(address);
  const orderItems = document.createElement('div')
  orderItems.className = 'order-items';
  orderItems.setAttribute('id', 'trackOrderItemsList')

  let itemsHtml = '';
  items.map(cartitem => {
    if (Array.isArray(cartitem)) {
      cartitem.map(items => {
        const item = items.item;
        itemsHtml += `
          <div class="order-item">
          <div class="order-item-image">
            <span class="ftype ${item.foodType}"></span>
            <img src="${item.image}" alt="">
            </div>
            <div class="order-item-details">
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <div class="order-stats">
            <span>Qty. ${items.qty}</span>
            <span>₹ ${item.price * items.qty}</span>
            </div>
            </div>
        </div>
      `;
        orderItemsTitle.push(item.name);
      })
    } else {
      const item = cartitem.item;
      itemsHtml += `
      <div class="order-item">
      <div class="order-item-image">
        <span class="ftype ${item.foodType}"></span>
        <img src="${item.image}" alt="">
        </div>
        <div class="order-item-details">
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <div class="order-stats">
        <span>Qty. ${cartitem.qty}</span>
        <span>₹ ${item.price * cartitem.qty}</span>
        </div>
        </div>
    </div>
    `;
      orderItemsTitle.push(item.name);
    }
  })

  orderItems.innerHTML = itemsHtml;

  if (trackView) {
    document.getElementById('trackOrderTitle').innerHTML = orderItemsTitle.join(', ');
    document.getElementById('trackOrderMeta').innerHTML = `${totalItems} Items <strong>₹${order.amount}</strong> `;

    updateOrderStatus(order.status);
  }

  wrapper.append(orderInfo)
  wrapper.append(orderAddress)
  wrapper.append(orderItems);

  return wrapper;
}

function updateOrderStatus(status) {

  const delivered = document.querySelector('#trackOrderDetails .delivered');
  const tracker = document.querySelector('#trackOrderDetails .location-tracking');

  delivered.classList.add('d-none');
  tracker.classList.add('d-none');

  const steps = document.querySelectorAll('.step');
  steps.forEach((step, i) => {
    if (i !== 0) {
      step.classList.remove('completed');
    }
  })

  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');
  // const step5 = document.getElementById('step5');


  if (status === 'order_placed') {
    delivered.classList.add('d-none');
    tracker.classList.remove('d-none');
  }
  if (status === 'confirmed') {
    delivered.classList.add('d-none');
    tracker.classList.remove('d-none');
  }
  if (status === 'preparing') {
    delivered.classList.add('d-none');
    tracker.classList.remove('d-none');
    step2.classList.add('completed');
  }
  if (status === 'dispatched') {
    delivered.classList.add('d-none');
    tracker.classList.remove('d-none');
    step2.classList.add('completed');
    step3.classList.add('completed');
  }
  if (status === 'delivered') {
    delivered.classList.remove('d-none');
    tracker.classList.add('d-none');
    step2.classList.add('completed');
    step3.classList.add('completed');
    step4.classList.add('completed');
  }
  if (status === 'completed') {
    delivered.classList.remove('d-none');
    tracker.classList.add('d-none');
    step2.classList.add('completed');
    step3.classList.add('completed');
    step4.classList.add('completed');
    // step5.classList.add('completed');
  }

}

/**
 * FUNCITONALITY: Toggle Order Details
 * Shows/ hides order details in order-tracking view
 */

const toggles = document.querySelectorAll('.toggle-btn');

toggles.forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    if (currentOrderDetailsUI.classList.contains('d-none')) {
      currentOrderDetailsUI.classList.remove('d-none');
      toggle.innerText = 'Hide Detail';
      const iList = document.getElementById('trackOrderItemsList');
      iList.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      currentOrderDetailsUI.classList.add('d-none')
      toggle.innerText = 'Show Detail'
    }
  })
});


/**
 * FUNCTIONALITY: API Calls for cart update
 * Update cart items by API call
 * Add to cart @param  {} item: add an item (1 qty)
 * Remove from cart @param  {} item: remove 1 qty from cart
 * Delee cart item @param  {} item: remove item
 */

function addToCart(item) {
  axios.post('/add-item', item)
    .then((res) => {

      cartCounter.innerText = res.data.cart.totalQty;
      populateCart(res.data.cart);
      showToast('success', `${item.name} added to cart`);

    }).catch((err) => {
      console.log(err);
      showToast('error', 'Something went wrong');
    })
}

async function removeItem(item) {
  try {
    const res = await axios.post('/remove-item', item);
    if (res.data.status === 'ok') {
      cartCounter.innerText = res.data.cart.totalQty;
      populateCart(res.data.cart);
      return res.data.cart;
    } else {
      showAlert('Multiple customizations of this item are added to cart. Please remove item from cart.', 'OK, GOT IT', 'Remove item from cart');
      return false;
    }
  } catch (error) {
    console.log(error);
    new Noty({
      type: 'error',
      text: 'Something went wrong',
      timeout: 2000,
      progressBar: false,
      layout: 'bottomRight',

    }).show()
    return false;
  }

}

async function deleteCartItem(item) {
  try {
    const res = await axios.post('/delete-cart-item', item);
    if (res.data.status === 'ok') {
      cartCounter.innerText = res.data.cart.totalQty;
      document.querySelector('#coPrice').innerText = res.data.cart.totalPrice;
      document.querySelector('#coPriceTotal').innerText = res.data.cart.totalPrice;
      document.querySelector('#cartItemsCounter').innerText = res.data.cart.totalQty;

      if (res.data.cart.totalQty === 0) {
        const emptyCartHtml = `<div class="empty-cart">
        <div class="content">
          <h2>YOUR CART IS EMPTY
            <small>
              Please add some items from the menu.
            </small>
          </h2>
          <p>
            <a href="/" class="btn">explore Menu</a>
          </p>
        </div>
      </div>`;
        document.querySelector('#cartPlaceholder').innerHTML = emptyCartHtml;
        document.querySelectorAll('.coPriceBox').forEach(div => div.remove())
      }

      return true;

    } else {
      showAlert('Something went wrong. Try again later.', );
      return false;
    }
  } catch (error) {
    console.log(error);
    showAlert('Something went wrong. Try again later.', );
    return false;
  }

}

/**
 * FUNCTIONALITY: Update Side Cart
 * Re-render cart list items when items of cart updated
 * @param  {} data: cart items
 */

function populateCart(data) {

  let items = '';
  for (let cartItem of Object.values(data.items)) {
    if (Array.isArray(cartItem)) {
      cartItem.forEach(pizza => {

        if (pizza.qty === 0) return;
        items += `
        <div class="${pizza.item.extra ? 'item' :  'item sm'}">
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

      });
    } else {

      items += `
      <div class="item">
        <figure>
            <img src="${cartItem.item.image}" alt="">
        </figure>
        <div class="details">
            <h2>${cartItem.item.name}</h2>
            <p>${cartItem.item.description}</p>
        </div>`;


      items += `
      <div class="price-q">
        <div class="quantity-control">
          <button type="button" class="less"><span class="material-icons">${cartItem.qty === 1 ? 'delete_outline' : 'remove'}</span></button>
          <p>${cartItem.qty}</p>
          <button type="button" class="more"><span class="material-icons">add</span></button>
        </div>
        <h5>&#8377; ${cartItem.item.price * cartItem.qty}</h5>
      </div>`;

      items += `</div>`;

    }

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

/**
 * FUNCITONALITY: Add/Remove cart items
 * Add items to cart from menu page item-cards
 * Update cart counter text
 */

const addtoCartBtn = document.querySelectorAll('.addToCart');
const cartCounter = document.querySelector('#cartCounter');

addtoCartBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {

    const item = JSON.parse(btn.closest(".menu-card-data").dataset.item);

    if (item.menuType === 'pizza' || item.menuType === 'pizzamania') {
      const size = btn.closest(".menu-details").getElementsByClassName('size-select')[0];
      const selectedSize = size.options[size.selectedIndex].value;
      const crust = btn.closest(".menu-details").getElementsByClassName('crust-select')[0];
      const selectedCrust = crust.options[crust.selectedIndex].value;

      const crustIndex = item.options.crusts.indexOf(selectedCrust);
      const price = item.options.prices.filter(p => p.size === selectedSize)[0];
      const itemPrice = price.crusts[crustIndex];
      const extra = 0;

      const {
        options,
        ...cartItem
      } = item;

      cartItem.price = itemPrice;
      cartItem.size = selectedSize;
      cartItem.crust = selectedCrust;
      cartItem.extra = extra;

      addToCart(cartItem);
    } else {
      addToCart(item);
    }

    // console.log(cartItem, extra);
  })
});

const addFirstBtn = document.querySelectorAll('.firstAdd');
addFirstBtn.forEach(btn => {
  const elem = btn.closest('.menu-actions');
  btn.addEventListener('click', (e) => {
    const qController = `<div class="quantity-control inline">
    <button type="button" class="less"><span class="material-icons">delete_outline</span></button>
    <p>1</p>
    <button type="button" class="more"><span class="material-icons">add</span></button>
    </div>`;
    btn.closest('.btns').innerHTML = qController;
    const moreBtn = elem.querySelector('.more');
    moreBtn.addEventListener('click', e => {

      // increase count
      const lessBtn = moreBtn.closest('.quantity-control').getElementsByClassName('less')[0];
      let count = +moreBtn.previousElementSibling.innerText;
      const newCount = count + 1;
      const lessBtnHTML = newCount < 2 ? `<span class="material-icons">delete_outline</span>` : `<span class="material-icons">remove</span>`;
      lessBtn.innerHTML = lessBtnHTML;

      moreBtn.previousElementSibling.innerText = `${newCount}`;

      // add to cart
      const item = JSON.parse(moreBtn.closest(".menu-card-data").dataset.item);
      if (item.menuType === 'pizza' || item.menuType === 'pizzamania') {
        const size = moreBtn.closest(".menu-details").getElementsByClassName('size-select')[0];
        const selectedSize = size.options[size.selectedIndex].value;
        const crust = moreBtn.closest(".menu-details").getElementsByClassName('crust-select')[0];
        const selectedCrust = crust.options[crust.selectedIndex].value;

        const crustIndex = item.options.crusts.indexOf(selectedCrust);
        const price = item.options.prices.filter(p => p.size === selectedSize)[0];
        const itemPrice = price.crusts[crustIndex];
        const extra = 0;

        const {
          options,
          ...cartItem
        } = item;

        cartItem.price = itemPrice;
        cartItem.size = selectedSize;
        cartItem.crust = selectedCrust;
        cartItem.extra = extra;

        // console.log(cartItem, extra);
        addToCart(cartItem);
      } else {
        addToCart(item);
      }
    })

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

const removeOneBtn = document.querySelectorAll('.removeOneBtn');
removeOneBtn.forEach(btn => {
  const item = JSON.parse(btn.closest(".menu-card-data").dataset.item);
  btn.addEventListener('click', e => {

    // remove from cart
    if (removeItem(item)) {
      let count = +btn.nextElementSibling.innerText;
      const newCount = count - 1;
      if (newCount > 0) {
        const lessBtnHTML = newCount < 2 ? `<span class="material-icons">delete_outline</span>` : `<span class="material-icons">remove</span>`;
        btn.innerHTML = lessBtnHTML
        btn.nextElementSibling.innerText = `${newCount}`;
      } else {
        const addBtnHtml = `<button class="btn btn-sm firstAdd addToCart">Add to Cart</button>`
        btn.closest('.btns').innerHTML = addBtnHtml;
      }

    }

  })
})

const deleteCartItemBtn = document.querySelectorAll('.deleteCartItemBtn');
deleteCartItemBtn.forEach(btn => {
  const item = JSON.parse(btn.closest(".menu-card-data").dataset.item);
  btn.addEventListener('click', e => {
    // remove from cart
    if (deleteCartItem(item)) {
      btn.closest('.cart-card').remove();
    }

  })
})

/**
 * FUNCITONALITY: Pizza Options picker
 * Select pizza size and crust type for items to be added in cart
 */

const sizeSelect = document.querySelectorAll('.size-select');
const crustSelect = document.querySelectorAll('.crust-select');

sizeSelect.forEach(select => {
  select.addEventListener('change', (e) => {
    const size = e.target.value;
    const item = JSON.parse(select.closest(".menu-card-data").dataset.item);
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
    const item = JSON.parse(select.closest(".menu-card-data").dataset.item);
    const sizeSelector = select.closest(".menu-selector").getElementsByClassName('size-select')[0];
    const size = sizeSelector.options[sizeSelector.selectedIndex].value;
    const prices = item.options.prices.filter(p => p.size === size)[0].crusts;
    const crustIndex = item.options.crusts.indexOf(crust);
    const price = prices[crustIndex];
    const priceSpan = select.closest(".menu-card").querySelector('.menu-price span');
    priceSpan.innerText = price ? `₹ ${price}` : ''
  })
});


/**
 * FUNCITONALITY: Misc events
 * Scroll and header-style related functions
 * Exectued after DOM-loaded
 */

document.addEventListener('DOMContentLoaded', function () {

  // Header style switch

  const pageurl = window.location.href.split('/').pop();
  if (pageurl !== '') {
    document.querySelector('.site__header').classList.remove('light');
    if (pageurl === 'login' || pageurl === 'register') {
      if (document.querySelector('.location-menu')) {
        document.querySelector('.location-menu').classList.add('d-none');
      }
      if (document.querySelector('.cart-menu')) {
        document.querySelector('.cart-menu').classList.add('d-none');
      }
      document.querySelector('.user-menu').classList.add('d-none');
      // document.querySelector('.hamburger').classList.add('d-none');
    } else {
      if (document.querySelector('.location-menu')) {
        document.querySelector('.location-menu').classList.remove('d-none');
      }
      if (document.querySelector('.cart-menu')) {
        document.querySelector('.cart-menu').classList.remove('d-none');
      }
      document.querySelector('.user-menu').classList.remove('d-none');
      // document.querySelector('.hamburger').classList.remove('d-none');
    }
  } else {
    document.querySelector('.site__header').classList.add('light');
  }

  // Scrollspy

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


  // Smooth-scroll to hash
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

}, false);


/**
 * FUNCITONALITY: Add, edit or remove user addresses
 */

const addressDeleteBtns = document.querySelectorAll('.deleteAddressBtn');
addressDeleteBtns.forEach(btn => {
  const address = btn.closest('.address');
  btn.addEventListener('click', e => {
    const addressIndex = btn.dataset.index;
    axios.post('/delete-address', {
      index: +addressIndex
    }).then(res => {
      address.remove();
      location.reload();
    }).catch(err => {
      console.log(err);
      showAlert('Something went wrong. Try again later.')
    })
  })
})

const addressForm = document.getElementById('addNewAddressForm');
const addressSubmitBtn = document.getElementById('addAddressSubmitBtn');

if (addressSubmitBtn) {
  addressSubmitBtn.addEventListener('click', (e) => {
    const data = Object.fromEntries(new FormData(addressForm).entries());
    const pattern = /^[\d ()+-]+$/;
    if (data.address && data.title && data.contact) {
      if (pattern.test(data.contact)) {
        axios.post('/add-address', data).then((res) => {

          addressForm.reset();
          location.reload();

        }).catch((err) => {
          showAlert('Something went wrong. Try again later.')
        })
      } else {
        new Noty({
          type: 'error',
          text: 'Invalid contact number',
          timeout: 2000,
          progressBar: false,
          layout: 'topRight',
        }).show()
      }
    } else {
      new Noty({
        type: 'error',
        text: 'Fill all required fields',
        timeout: 2000,
        progressBar: false,
        layout: 'topRight',
      }).show()
    }
  })
}

const editAddressUI = document.getElementById('editAddressUI');
const editAddressBtns = document.querySelectorAll('.editAddressBtn');

editAddressBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.add('noscroll');
    overlay.classList.add('shown');
    rightDrawer.classList.add('opened');
    hamburger.classList.add('inactive');

    addressListView.classList.add('d-none');
    editAddressUI.classList.remove('d-none');

  });

});

const addressPickers = document.querySelectorAll('.addressRadioPicker');
addressPickers.forEach(elm => {
  elm.addEventListener('click', (e) => {
    const add = elm.closest('.address-list').querySelectorAll('.address');
    add.forEach(a => a.classList.remove('selected'));
    elm.closest('.address').classList.add('selected');
  })
})

const editAddressDataBtns = document.querySelectorAll('.editAddressDataBtn');
editAddressDataBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const {
      title,
      locality,
      address,
      contact,
    } = JSON.parse(btn.dataset.address);
    document.getElementById('allAddressView').classList.add('d-none');
    document.getElementById('editAddressForm').classList.remove('d-none');

    document.getElementById('addressTitleInput').value = title;
    document.getElementById('addressLocalityInput').value = locality;
    document.getElementById('addressInput').value = address;
    document.getElementById('addressContactInput').value = contact;
  })
})

const updateAdressBtn = document.getElementById('editAddressSubmitBtn');
if (updateAdressBtn) {

  updateAdressBtn.addEventListener('click', (e) => {

    const current = document.querySelector('input[name="current_address"]:checked').value;
    const title = document.getElementById('addressTitleInput').value;
    const locality = document.getElementById('addressLocalityInput').value;
    const address = document.getElementById('addressInput').value;
    const contact = document.getElementById('addressContactInput').value;

    axios.post('/edit-address', {
      index: +current,
      address: {
        title,
        locality,
        address,
        contact,
        default: false
      }
    }).then(res => {
      location.reload();
    }).catch(err => {
      console.log(err);
      showAlert('Something went wrong. Try again later.')
    })
  });

}

const saveAdressBtn = document.getElementById('saveAddressBtn');
if (saveAdressBtn) {
  saveAdressBtn.addEventListener('click', (e) => {
    const current = document.querySelector('input[name="current_address"]:checked').value;
    axios.post('/current-address', {
      index: +current
    }).then(res => {
      location.reload();
    }).catch(err => {
      console.log(err);
      showAlert('Something went wrong. Try again later.')
    })
  });
}

const addMoreAddressBtn = document.getElementById('addMoreAddressBtn');
if (addMoreAddressBtn) {

  addMoreAddressBtn.addEventListener('click', (e) => {
    editAddressUI.classList.add('d-none');
    newAddressView.classList.remove('d-none');
  })
}

/**
 * FUNCITONALITY: Add or edit user contact number
 */

const liContactNone = document.getElementById('liContactNone');
const liContactAdd = document.getElementById('liContactAdd');

const liContact = document.getElementById('liContact');
const liContactEdit = document.getElementById('liContactEdit');
const editContactBtn = document.getElementById('contactEditBtn');

const doneContactBtn = document.getElementById('contactDoneBtn');
const doneEditContactBtn = document.getElementById('contactEditDoneBtn');

const pattern = /^[\d ()+-]+$/;

if (liContactNone) {
  liContactNone.addEventListener('click', (e) => {
    liContactAdd.classList.remove('d-none');
    liContactNone.classList.add('d-none');
  });
}

if (editContactBtn) {
  editContactBtn.addEventListener('click', (e) => {
    liContactEdit.classList.remove('d-none');
    liContact.classList.add('d-none');
  });
}

if (doneContactBtn) {
  doneContactBtn.addEventListener('click', (e) => {
    const input = document.getElementById('contactAddInput')
    const contactValue = input.value;
    if (contactValue.trim().length === 0 || !pattern.test(contactValue)) return;
    input.setAttribute('disabled', true);
    doneContactBtn.setAttribute('disabled', true);
    axios.post('/update-user', {
        contact: contactValue.trim()
      })
      .then(() => location.reload()).catch(() => {
        location.reload();
        showAlert('Failed to update');
      })
  });
}

if (doneEditContactBtn) {
  doneEditContactBtn.addEventListener('click', (e) => {
    const input = document.getElementById('contactEditInput');
    const contactValue = input.value;
    if (contactValue.trim().length === 0 || !pattern.test(contactValue)) return;
    input.setAttribute('disabled', true);
    doneEditContactBtn.setAttribute('disabled', true);
    axios.post('/update-user', {
        contact: contactValue.trim()
      })
      .then(() => location.reload()).catch(() => {
        location.reload();
        showAlert('Failed to update');
      })
  });
}


/**
 * FUNCITONALITY: Format mongoDB dates w/o library
 */

const dates = document.querySelectorAll('.datetime');
dates.forEach(date => {
  const rawdate = date.innerText;
  const formattedDate = getFormattedDate(rawdate);
  date.innerHTML = `&nbsp;${formattedDate}&nbsp;`;
})

function getFormattedDate(rawdate) {
  const d = new Date(rawdate);
  const formattedDate = d.toLocaleString('default', {
    month: 'short'
  }) + " " + d.getDate();

  return formattedDate;
}

/**
 * FUNCITONALITY: Close Drawer by overlay clicking
 */

overlay.addEventListener('click', () => {

  // hide right drawer
  if (rightDrawer.classList.contains('opened')) {

    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    rightDrawer.classList.remove('opened');
    hamburger.classList.remove('inactive');

    editAddressUI.classList.add('d-none');
    newAddressView.classList.add('d-none');
    addressListView.classList.add('d-none');
    document.getElementById('allAddressView').classList.remove('d-none');
    document.getElementById('editAddressForm').classList.add('d-none');

    orderDetailsUI.innerHTML = null;
    orderDetailsUI.classList.add('d-none');

  }

  // hide left drawer
  if (leftDrawer.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    leftDrawer.classList.remove("opened");
    headerMenu.classList.remove('inactive');
  }

  // hide oder-tracking drawer
  if (orderTrackingUI.classList.contains('opened')) {
    document.body.classList.remove('noscroll');
    overlay.classList.remove('shown');
    headerMenu.classList.remove('inactive');
    orderTrackingUI.classList.remove('opened');
    document.getElementById('trackOrderLoader').classList.remove('d-none');
    document.getElementById('trackOrderDetails').classList.add('d-none');

    currentOrderDetailsUI.innerHTML = null;
    currentOrderId = '';
    currentOrder = null;
    document.getElementById('toggleOrderDetailsBtn').innerText = 'Show Details';
    currentOrderDetailsUI.classList.add('d-none');
  }

});


/**
 * FUNCITONALITY: Get Order Status Message
 * Get formatted message for order updates
 * @param  {} status
 */

function getOrderMessage(status) {

  let msg = '';
  switch (status) {
    case 'confirmed':
      msg = 'Order has been confirmed'
      break;
    case 'preparing':
      msg = 'Update! Order is now being baked'
      break;
    case 'dispatched':
      msg = 'Order dispatched! Food is on your way'
      break;
    case 'delivered':
      msg = 'Order delivered! Enjoy your food'
      break;
    default:
      break;
  }
  return msg;
}

/**
 * FUNCITONALITY: Admin functionality
 */

initAdmin();


/**
 * FUNCITONALITY: Socket
 */

socket.on('order_updated', (data) => {
  updateOrderStatus(data.status);
  showToast('success', getOrderMessage(data.status));
})