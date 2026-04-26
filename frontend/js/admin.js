const adminUser = requireLogin();

if (adminUser) {
    if (adminUser.role !== "admin") {
        window.location.href = "index.html";
    }
    document.getElementById("adminName").textContent = `Welcome, ${adminUser.fname || "Admin"}`;
    document.getElementById("adminRole").textContent = `Role: ${adminUser.role}`;
}

async function loadStats() {
    try {
        const data = await api("/admin/stats");

        const fields = [
            "totalUsers", "verifiedUsers", "blockedUsers",
            "totalProperties", "verifiedProperties", "blockedProperties", "pendingProperties",
            "bookings", "payments", "frauds"
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
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid #eee;">
                        <th style="padding: 10px;">Image</th>
                        <th style="padding: 10px;">Title</th>
                        <th style="padding: 10px;">Owner</th>
                        <th style="padding: 10px;">Price</th>
                        <th style="padding: 10px;">Fraud Score</th>
                        <th style="padding: 10px;">Reason</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        properties.forEach(p => {
            const firstImg = p.images && p.images.length > 0 ? p.images[0] : "";
            const imgUrl = window.getPropertyImageUrl(firstImg);

            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">
                        <img src="${imgUrl}" alt="property" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"
                             onerror="this.src='https://placehold.co/100x100?text=No+Img'">
                    </td>
                    <td style="padding: 10px;">${p.title}</td>
                    <td style="padding: 10px;">${p.ownerId ? p.ownerId.fname : "N/A"}</td>
                    <td style="padding: 10px;">₹${p.price}</td>
                    <td style="padding: 10px;">${typeof p.fraudScore === "number" ? p.fraudScore.toFixed(4) : "0.0000"}</td>
                    <td style="padding: 10px;">${p.fraudReason || "Normal"}</td>
                    <td style="padding: 10px;">
                        <span style="color: ${p.isVerified ? "green" : "orange"}">${p.isVerified ? "Verified" : "Pending"}</span>
                        ${p.flaggedAsFraud ? ' | <span style="color: red">Flagged</span>' : ""}
                        <div style="font-size: 12px; margin-top: 4px;">Review: ${p.reviewStatus || "pending"}</div>
                    </td>
                    <td style="padding: 10px;">
                        <button class="admin-btn" style="padding: 5px 10px; font-size: 12px; background: ${p.isVerified ? "#666" : "#28a745"}" onclick="togglePropertyVerify('${p._id}', ${p.isVerified})">
                            ${p.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button class="admin-btn" style="padding: 5px 10px; font-size: 12px; background: ${p.flaggedAsFraud ? "#28a745" : "#dc3545"}" onclick="togglePropertyFlag('${p._id}', ${p.flaggedAsFraud})">
                            ${p.flaggedAsFraud ? "Unflag" : "Flag Fraud"}
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
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid #eee;">
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">Role</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(u => {
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${u.fname}</td>
                    <td style="padding: 10px;">${u.email}</td>
                    <td style="padding: 10px;">${u.role}</td>
                    <td style="padding: 10px;">
                        <span style="color: ${u.isVerified ? "green" : "orange"}">${u.isVerified ? "Verified" : "Pending"}</span>
                        ${u.isBlocked ? ' | <span style="color: red">Blocked</span>' : ""}
                    </td>
                    <td style="padding: 10px;">
                        <button class="admin-btn" style="padding: 5px 10px; font-size: 12px; background: ${u.isVerified ? "#666" : "#28a745"}" onclick="toggleUserVerify('${u._id}', ${u.isVerified})">
                            ${u.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button class="admin-btn" style="padding: 5px 10px; font-size: 12px; background: ${u.isBlocked ? "#28a745" : "#dc3545"}" onclick="toggleUserBlock('${u._id}', ${u.isBlocked})">
                            ${u.isBlocked ? "Unblock" : "Block"}
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

loadStats();
loadProperties();
loadUsers();