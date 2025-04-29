document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth')?.addEventListener('click', event => {
        fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                login: document.getElementById('login').value,
                password: document.getElementById('password').value
            })
        })
            .then(response => {
                if (response.status == 200) location.reload()
                else response.json().then(body => alert(JSON.stringify(body)))
            })
    })

    document.getElementById('logout-link')?.addEventListener('click', event => {
        fetch('/api/logout', {method: 'POST'})
            .then(() => location.reload())
    })
})
