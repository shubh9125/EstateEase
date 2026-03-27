function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('propertyId');
    window.location.href = 'login.html';
}

function requireLogin() {
    const user = getUser();
    const token = localStorage.getItem('token');
    if (!user || !token) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}
