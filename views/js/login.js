function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Login successful.');
                localStorage.setItem('sessionToken', data.token);
                localStorage.setItem('loggedInUser', username);
                document.getElementById('overlay').style.display = 'none';

                document.getElementById('login-link').style.display = 'none';
                document.getElementById('logout-link').style.display = 'inline-block';

                document.getElementById('loggedInUserName').innerText = username;
                document.getElementById('loggedUser').style.display = 'block';

            } else {
                alert('Login failed. Check your credentials and try again.');
            }
        })
        .catch(error => console.error('Error:', error));
}

let logoutInProgress = false;

function logout() {
    if (logoutInProgress) {
        return;
    }

    logoutInProgress = true;

    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Logout successful.');
                localStorage.removeItem('sessionToken');

                document.getElementById('login-link').style.display = 'inline-block';
                document.getElementById('logout-link').style.display = 'none';

                document.getElementById('loggedUser').style.display = 'none';
            } else {
                alert('Logout failed: ' + data.message);
            }

            logoutInProgress = false;
        })
        .catch(error => {
            // console.error('Logout failed:', error);
            logoutInProgress = false;
        });
}

function openOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline-block';
        // console.log('User already logged in.');

        document.getElementById('loggedUser').style.display = 'block';

        const username = localStorage.getItem('loggedInUser');
        document.getElementById('loggedInUserName').innerText = username;

    }
    
    const logoutButton = document.getElementById('logout-link');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

