function renderHeader() {
    const nav = document.querySelector('header nav');
    if (!nav) return;

    const user = typeof getUser === 'function' ? getUser() : null;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const commonLinks = `
        <a href="index.html#list" onclick="setFilter('rent')">Rent</a>
        <a href="index.html#list" onclick="setFilter('sell')">Sell</a>
        <a href="index.html#list" onclick="setFilter('buy')">Buy</a>
    `;

    if (user) {
        nav.innerHTML = `
            <a href="index.html" class="${currentPage === 'index.html' ? 'active-link' : ''}">Home</a>
            ${commonLinks}
            <a href="${user.role}.html" class="${currentPage === `${user.role}.html` ? 'active-link' : ''}">Dashboard</a>
            <a href="#" onclick="logout()">Logout</a>
            <div class="user-profile-header" style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; margin-left: 10px;">
                <span style="font-size: 14px; font-weight: 500;">${user.fname}</span>
            </div>
        `;
    } else {
        nav.innerHTML = `
            <a href="index.html" class="${currentPage === 'index.html' ? 'active-link' : ''}">Home</a>
            ${commonLinks}
            <a href="login.html" class="${currentPage === 'login.html' ? 'active-link' : ''}">Login</a>
            <a href="register.html" class="${currentPage === 'register.html' ? 'active-link' : ''}">Register</a>
        `;
    }

    // Function to set filter from header
    window.setFilter = function(type) {
        localStorage.setItem('searchType', type);
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            const typeSelect = document.getElementById('type');
            if (typeSelect) {
                typeSelect.value = type;
                if (typeof load === 'function') load();
            }
        }
    };

    if (!document.getElementById('globalMenuBtn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'globalMenuBtn';
        btn.className = 'mobile-menu-btn';
        btn.textContent = '☰';
        nav.parentElement.insertBefore(btn, nav);
        btn.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }
}

document.addEventListener('DOMContentLoaded', renderHeader);
