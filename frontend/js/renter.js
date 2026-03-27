const renterUser = requireLogin();

if (renterUser) {
    document.getElementById("info").innerHTML = `
        <h2 style="margin: 0;">Welcome, ${renterUser.fname || "Renter"}</h2>
        <p class="small" style="margin: 5px 0;">Role: ${renterUser.role} • Verified: ${renterUser.isVerified ? "Yes" : "No"}</p>
    `;
}

function goRent() {
    window.location.href = "index.html";
}