document.addEventListener('DOMContentLoaded', function () {
    const addToCartButton = document.getElementById('add-to-cart');
    const clearCartButton = document.getElementById('clear-cart-btn');
    const checkoutButton = document.getElementById('checkout-btn');
    const expressShippingCheckbox = document.getElementById('express-shipping-checkbox');
    const cart = document.getElementById('cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const itemSelect = document.getElementById('item');
    const quantityInput = document.getElementById('quantity');
    const idToName = {
        "wrp-blk": "Black Wraps",
        "wrp-tl": "Teal Wraps",
    };
    const lineItems = [];

    addToCartButton.addEventListener('click', function (event) {
        event.preventDefault();
        const itemId = itemSelect.value;
        const quantity = parseInt(quantityInput.value);
        const found = lineItems.find(item => item.itemId === itemId)
        if (!found) {
            lineItems.push({ itemId, quantity });
        } else {
            found.quantity += quantity;
        }
        updateCart();
    });

    clearCartButton.addEventListener('click', function () {
        lineItems.length = 0;
        updateCart();
    });

    expressShippingCheckbox.addEventListener('change', function () {
        updateCart();
    });

    function updateCart() {
        console.log(lineItems);
        if (lineItems.length === 0) {
            cart.style.display = "none";
        } else {
            cart.style.display = "block";
        }
        cartItems.innerHTML = '';
        for (const item of lineItems) {
            if (item.quantity > 0) {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                
                const itemInfo = document.createElement('span');
                itemInfo.classList.add('item-info');
                itemInfo.textContent = `${item.quantity} x ${idToName[item.itemId]}`;
                
                const itemControls = document.createElement('div');
                itemControls.classList.add('item-controls');
                
                const increaseBtn = document.createElement('button');
                increaseBtn.classList.add('quantity-btn', 'increase-btn');
                increaseBtn.innerHTML = '▲';
                increaseBtn.addEventListener('click', () => {
                    item.quantity++;
                    updateCart();
                });
                
                const decreaseBtn = document.createElement('button');
                decreaseBtn.classList.add('quantity-btn', 'decrease-btn');
                if (item.quantity === 1) {
                    decreaseBtn.classList.add('disabled');
                }
                decreaseBtn.innerHTML = '▼';
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity--;
                        updateCart();
                    }
                });
                
                const removeBtn = document.createElement('button');
                removeBtn.classList.add('quantity-btn', 'remove-btn');
                removeBtn.innerHTML = '✕';
                removeBtn.addEventListener('click', () => {
                    const index = lineItems.indexOf(item);
                    if (index > -1) {
                        lineItems.splice(index, 1);
                        updateCart();
                    }
                });
                
                itemControls.appendChild(increaseBtn);
                itemControls.appendChild(decreaseBtn);
                itemControls.appendChild(removeBtn);
                
                cartItem.appendChild(itemInfo);
                cartItem.appendChild(itemControls);
                cartItems.appendChild(cartItem);
            }
        }
        const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * 59.00, 0);
        const expressShippingCost = expressShippingCheckbox.checked ? 9.00 : 0;
        const total = subtotal + expressShippingCost;
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    checkoutButton.addEventListener('click', async function (e) {
        e.preventDefault();

        // Create a copy of lineItems for checkout
        const checkoutLineItems = [...lineItems];
        
        // Add express shipping if checkbox is checked
        if (expressShippingCheckbox.checked) {
            checkoutLineItems.push({ itemId: "exp-ship", quantity: 1 });
        }

        const response = await fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lineItems: checkoutLineItems })
        })
        
        if (!response.ok) {
            console.error('Network response was not ok:', response.statusText, "\n", response);
            return;
        }
        const token = (await response.json()).token;

        const form = document.createElement('form') 
        Object.assign(form, {
            method: 'POST',
            action: 'https://test.authorize.net/payment/payment',
            style: 'display:none;'
        });
        const input = document.createElement('input');
        Object.assign(input, {
            type: 'hidden',
            name: 'token',
            value: token
        });
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });

    updateCart();
});