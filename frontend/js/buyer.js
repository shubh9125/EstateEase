const buyerUser = requireLogin();

if (buyerUser) {
    document.getElementById("info").innerHTML = `
        <h2 style="margin: 0;">Welcome, ${buyerUser.fname || "Buyer"}</h2>
        <p class="small" style="margin: 5px 0;">Role: ${buyerUser.role} • Verified: ${buyerUser.isVerified ? "Yes" : "No"}</p>
    `;
}

function goBrowse() {
    window.location.href = "index.html";
}