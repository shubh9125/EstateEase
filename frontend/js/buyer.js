const buyerUser = requireLogin();

if (buyerUser) {
    document.getElementById("info").innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px;">
            <div>
                <h2 style="margin: 0;">Welcome, ${buyerUser.fname || "Buyer"}</h2>
                <p class="small" style="margin: 5px 0;">Role: ${buyerUser.role} • Verified: ${buyerUser.isVerified ? "Yes" : "No"}</p>
            </div>
        </div>
    `;
}

async function loadMyInbox() {
    const box = document.getElementById("inbox");
    box.innerHTML = "<div>Loading messages...</div>";

    try {
        const res = await api("/bookings/user/inbox");
        const list = res.bookings || [];

        box.innerHTML = "";

        list.forEach(r => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.marginBottom = "15px";
            div.innerHTML = `
                <h4 style="margin: 0;">${r.propertyId?.title || "Property Inquiry"}</h4>
                <div class="small" style="margin: 5px 0;">Seller: ${r.propertyId?.ownerId?.fname || "N/A"}</div>
                <div class="small">Contact: ${r.propertyId?.ownerId?.email || "N/A"} • ${r.propertyId?.ownerId?.phone || ""}</div>
                
                <div style="margin-top: 10px; padding: 12px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #d1d5db;">
                    <strong>Your Message:</strong><br>
                    <p style="margin-top: 5px; font-style: italic; font-size: 14px;">"${r.message || "No message."}"</p>
                    <div class="small" style="margin-top: 5px;">Status: <strong>${r.status.toUpperCase()}</strong></div>
                </div>
                
                ${r.sellerReply ? `
                <div style="margin-top: 10px; padding: 12px; background: #eff6ff; border-radius: 10px; border-left: 4px solid #3b82f6;">
                    <strong>Seller's Reply:</strong><br>
                    <p style="margin-top: 5px; font-style: italic; font-size: 14px;">"${r.sellerReply}"</p>
                </div>

                <div style="margin-top: 10px;">
                    <textarea id="reply-${r._id}" placeholder="Type your follow-up message..." style="width: 100%; min-height: 60px; margin-bottom: 5px;">${r.buyerReply || ""}</textarea>
                    <button class="primary small" onclick="sendFollowUp('${r._id}')">Send Reply to Seller</button>
                </div>
                ` : ""}
            `;
            box.appendChild(div);
        });

        if (!list.length) {
            box.innerHTML = `<div class="card">No messages sent yet.</div>`;
        }
    } catch (e) {
        box.innerHTML = `<div class="card" style="color: red;">${e.message}</div>`;
    }
}

async function sendFollowUp(id) {
    const text = document.getElementById(`reply-${id}`).value.trim();
    if (!text) return alert("Please type a message");

    try {
        await api(`/bookings/${id}/follow-up`, "PATCH", { buyerReply: text });
        alert("Reply sent to seller!");
        loadMyInbox();
    } catch (e) {
        alert(e.message);
    }
}

loadMyInbox();

function goBrowse() {
    window.location.href = "index.html";
}