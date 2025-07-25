document.addEventListener('DOMContentLoaded', function() {
    const community = document.getElementById('community');
    const form = document.getElementById('subscriber-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const response = await fetch('/subscriber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            community.innerHTML = `
                <h2>Thank you for subscribing!</h2>
                <p>You will receive updates on restocks, new releases, and discounts.</p>
            `;
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    });
});
