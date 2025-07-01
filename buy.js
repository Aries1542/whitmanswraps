document.addEventListener('DOMContentLoaded', function () {
    const colorSelect = document.getElementById('color');
    const checkoutValue = document.getElementById('checkout-value');
    const colorToValue = {
        black: '61d9aa4d-7b96-4cb1-b2ec-aa9e3a49b227',
        teal: 'dc5f993d-f657-45c4-ab9a-835253132196',
    }

    colorSelect.addEventListener('change', function () {
        checkoutValue.value=colorToValue[colorSelect.value];
    });
});