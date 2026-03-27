const adminUser = requireLogin();

if (adminUser) {
    if (adminUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
    document.getElementById("adminName").textContent = `Welcome, ${adminUser.fname || "Admin"}`;
    document.getElementById("adminRole").textContent = `Role: ${adminUser.role}`;
}

async function loadStats() {
    try {
        const data = await api("/admin/stats");
        
        const fields = [
            'totalUsers', 'verifiedUsers', 'blockedUsers',
            'totalProperties', 'verifiedProperties', 'blockedProperties', 'pendingProperties',
            'bookings', 'payments', 'frauds'
        ];

        fields.forEach(field => {
            const el = document.getElementById(`stat-${field}`);
            if (el) {
                el.textContent = data[field] !== undefined ? data[field] : 0;
            }
        });
    } catch (e) {
        console.error("Failed to load stats:", e);
    }
}

async function loadProperties() {
    const container = document.getElementById("property-list-container");
    container.innerHTML = "<div>Loading properties...</div>";

    try {
        const properties = await api("/admin/all/properties");
        if (properties.length === 0) {
            container.innerHTML = "<div>No properties found.</div>";
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Owner</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        properties.forEach(p => {
            const firstImg = p.images && p.images.length > 0 ? p.images[0] : '';
            const imgUrl = firstImg ? (firstImg.startsWith('http') ? firstImg : `http://localhost:5000${firstImg.startsWith('/') ? '' : '/'}${firstImg}`) : 'https://placehold.co/40x40?text=P';
            
            html += `
                <tr>
                    <td><img src="${imgUrl}" alt="property" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
                    <td>${p.title}</td>
                    <td>${p.ownerId ? p.ownerId.fname : 'N/A'}</td>
                    <td>₹${p.price}</td>
                    <td>
                        <span style="color: ${p.isVerified ? 'green' : 'orange'}">${p.isVerified ? 'Verified' : 'Pending'}</span>
                        ${p.flaggedAsFraud ? ' | <span style="color: red">Flagged</span>' : ''}
                    </td>
                    <td>
                        <button class="action-btn ${p.isVerified ? 'btn-unverify' : 'btn-verify'}" onclick="togglePropertyVerify('${p._id}', ${p.isVerified})">
                            ${p.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button class="action-btn ${p.flaggedAsFraud ? 'btn-unflag' : 'btn-flag'}" onclick="togglePropertyFlag('${p._id}', ${p.flaggedAsFraud})">
                            ${p.flaggedAsFraud ? 'Unflag' : 'Flag Fraud'}
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div id="api-error">${e.message}</div>`;
    }
}

async function loadUsers() {
    const container = document.getElementById("user-list-container");
    container.innerHTML = "<div>Loading users...</div>";

    try {
        const users = await api("/admin/all/users");
        if (users.length === 0) {
            container.innerHTML = "<div>No users found.</div>";
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(u => {
            html += `
                <tr>
                    <td>${u.fname}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <span style="color: ${u.isVerified ? 'green' : 'orange'}">${u.isVerified ? 'Verified' : 'Pending'}</span>
                        ${u.isBlocked ? ' | <span style="color: red">Blocked</span>' : ''}
                    </td>
                    <td>
                        <button class="action-btn ${u.isVerified ? 'btn-unverify' : 'btn-verify'}" onclick="toggleUserVerify('${u._id}', ${u.isVerified})">
                            ${u.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button class="action-btn ${u.isBlocked ? 'btn-unblock' : 'btn-block'}" onclick="toggleUserBlock('${u._id}', ${u.isBlocked})">
                            ${u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div id="user-api-error">${e.message}</div>`;
    }
}

async function toggleUserVerify(id, currentStatus) {
    try {
        await api(`/admin/verify/user/${id}`, "PATCH", { isVerified: !currentStatus });
        loadUsers();
        loadStats();
    } catch (e) {
        alert(e.message);
    }
}

async function toggleUserBlock(id, currentStatus) {
    try {
        await api(`/admin/block/user/${id}`, "PATCH", { isBlocked: !currentStatus });
        loadUsers();
        loadStats();
    } catch (e) {
        alert(e.message);
    }
}

async function togglePropertyVerify(id, currentStatus) {
    try {
        await api(`/admin/verify/property/${id}`, "PATCH", { isVerified: !currentStatus });
        loadProperties();
        loadStats();
    } catch (e) {
        alert(e.message);
    }
}

async function togglePropertyFlag(id, currentStatus) {
    try {
        await api(`/admin/flag/property/${id}`, "PATCH", { flaggedAsFraud: !currentStatus });
        loadProperties();
        loadStats();
    } catch (e) {
        alert(e.message);
    }
}

// Initial load
loadProperties();
loadUsers();