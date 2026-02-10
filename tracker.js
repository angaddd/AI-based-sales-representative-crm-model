// SIMPLE tracker.js
console.log('Tracker loaded');

// Track page view
fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        type: 'page_view',
        url: window.location.href,
        time: new Date().toISOString()
    })
});

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'button_click',
                button: e.target.textContent,
                time: new Date().toISOString()
            })
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'div_click',
                button: e.target.textContent,
                time: new Date().toISOString()
            })
        });
    }
});