document.addEventListener('DOMContentLoaded', function () {
    // const thumbnails = document.querySelectorAll('.thumbnail');
    // const mainImage = document.getElementById('main-product-image');
    // const mainVideo = document.getElementById('main-product-video');
    // const colorSelect = document.getElementById('color');

    const addToCartButton = document.getElementById('add-to-cart');
    const clearCartButton = document.getElementById('clear-cart-btn');
    const checkoutButton = document.getElementById('checkout-btn');
    const cart = document.getElementById('cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const colorSelect = document.getElementById('color');
    const quantityInput = document.getElementById('quantity');
    const colorToSku = {
        black: "Wrp-Blk",
        teal: "Wrp-Tl",
    };
    const skuToName = {
        "Wrp-Blk": "Black Wraps",
        "Wrp-Tl": "Teal Wraps",
    };
    const lineItems = [];

    addToCartButton.addEventListener('click', function (event) {
        event.preventDefault();
        const selectedColor = colorSelect.value;
        const quantity = parseInt(quantityInput.value);
        const found = lineItems.find(item => item.sku === colorToSku[selectedColor])
        if (!found) {
            lineItems.push({ sku: colorToSku[selectedColor], quantity: quantity });
        } else {
            found.quantity += quantity;
        }
        updateCart();
    });

    clearCartButton.addEventListener('click', function () {
        lineItems.length = 0;
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
                cartItem.textContent = `${item.quantity} x ${skuToName[item.sku]}`;
                cartItems.appendChild(cartItem);
            }
        }
        const total = lineItems.reduce((sum, item) => sum + item.quantity * 59.99, 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    checkoutButton.addEventListener('click', function (e) {
        CollectCheckout.redirectToCheckout({
            lineItems: lineItems,
            collectShippingInfo: true,
            paymentMethods: [
                {
                    type: "creditCard",
                    use3DSecure: false,
                },
                {
                    type: "check",
                },
                {
                    type: "googlePay",
                    use3DSecure: false,
                },
                {
                    type: "applePay",
                    use3DSecure: false,
                },
            ],
            successUrl: 'https://aries1542.github.io/whitmanswraps/',
            receipt: {
                showReceipt: true,
                redirectToSuccessUrl: true,
                sendToCustomer: true,
            },
        }).then((error) => {
            console.log(error);
        });
    });

    updateCart();
});