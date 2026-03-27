function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||"").toLowerCase());
}

function isStrongPassword(password) {
    return typeof password === 'string' && password.length >= 6;
}

module.exports = {
    isEmailValid,
    isStrongPassword
};