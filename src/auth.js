async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    document.getElementById('message').innerText = result.message;
    
    if (result.success) {
        window.location.href = '/';
    }
}