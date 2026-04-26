const sellerUser = requireLogin();

if (sellerUser) {
    document.getElementById("info").innerHTML = `
        <h2 style="margin: 0;">Welcome, ${sellerUser.fname || "Seller"}</h2>
        <p class="small" style="margin: 5px 0;">Role: ${sellerUser.role} • Verified: ${sellerUser.isVerified ? "Yes" : "No"}</p>
    `;
}

async function addProperty() {
    const msg = document.getElementById("msg");

    try {
        const title = document.getElementById("title").value.trim();
        const type = document.getElementById("type").value;
        const propertyType = document.getElementById("propertyType").value;
        const description = document.getElementById("description").value.trim();
        const price = parseFloat(document.getElementById("price").value);
        const city = document.getElementById("city").value.trim();
        const address = document.getElementById("address").value.trim();
        const lat = document.getElementById("lat").value;
        const lng = document.getElementById("lng").value;

        if (!title || !description || !price || !city || !address) {
            msg.innerText = "Please fill all required fields";
            msg.style.color = "red";
            return;
        }

        const body = {
            title,
            type,
            propertyType,
            description,
            price,
            city,
            address,
            lat,
            lng,
            images: []
        };

        const data = await api("/properties", "POST", body);
        const propertyId = data.property._id;

        const fileInput = document.getElementById("images");
        if (fileInput && fileInput.files.length > 0) {
            msg.innerText = "Uploading images...";
            console.log(`[Property Creation] Uploading ${fileInput.files.length} images...`);
            const formData = new FormData();

            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append("images", fileInput.files[i]);
                console.log(`[Property Creation] Image ${i + 1}: ${fileInput.files[i].name}`);
            }

            try {
                await uploadImages(propertyId, formData);
                console.log(`[Property Creation] All images uploaded successfully`);
            } catch (uploadErr) {
                console.error(`[Property Creation] Image upload failed:`, uploadErr);
                msg.innerText = `Property created but image upload failed: ${uploadErr.message}`;
                msg.style.color = "orange";
            }
        }

        if (data.property.flaggedAsFraud) {
            msg.innerText = `Property submitted and flagged for review. Reason: ${data.property.fraudReason || "Suspicious pattern detected"}`;
            msg.style.color = "orange";
        } else {
            msg.innerText = "Property added successfully!";
            msg.style.color = "green";
        }

        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("price").value = "";
        document.getElementById("city").value = "";
        document.getElementById("address").value = "";
        document.getElementById("lat").value = "";
        document.getElementById("lng").value = "";
        if (typeof sellerMarker !== 'undefined' && sellerMarker) {
            sellerMap.removeLayer(sellerMarker);
            sellerMarker = null;
        }
        document.getElementById("coordMsg").innerText = "Click on the map to set property location";
        if (fileInput) fileInput.value = "";

        loadMine();
    } catch (e) {
        msg.innerText = e.message;
        msg.style.color = "red";
    }
}

async function uploadImages(propertyId, formData) {
    const token = localStorage.getItem("token");

    console.log(`[Upload] Starting image upload for property: ${propertyId}`);

    const res = await fetch(`${API_BASE}/properties/${propertyId}/upload`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        body: formData
    });

    const data = await res.json();
    
    console.log(`[Upload] Response status: ${res.status}`);
    console.log(`[Upload] Response data:`, data);
    
    if (!res.ok) {
        throw new Error(data.message || data.error || "Image upload failed");
    }
    
    console.log(`[Upload] Success! Property now has ${data.property.images.length} images`);
    return data;
}

async function loadMine() {
    const box = document.getElementById("mine");

    try {
        const res = await api("/properties/my");
        const list = res.properties || res;

        box.innerHTML = "";

        list.forEach(p => {
            const div = document.createElement("div");
            div.className = "card";

            const firstImg = p.images && p.images.length > 0 ? p.images[0] : "";
            const imgUrl = window.getPropertyImageUrl(firstImg);

            div.innerHTML = `
                <img src="${imgUrl}" alt="property image" 
                     style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
                     onerror="this.src='https://placehold.co/300x200?text=Property+Image'">
                <h4>${p.title}</h4>
                <div class="small">
                    ₹${p.price} • ${p.location?.city || ""} • Verified: ${p.isVerified ? "Yes" : "No"}
                    ${p.flaggedAsFraud ? ' • <span style="color:red;">Flagged</span>' : ""}
                </div>
                <div class="small" style="margin-top: 4px;">
                    Review Status: <strong>${p.reviewStatus || "pending"}</strong>
                </div>
                <div class="small" style="margin-top: 4px;">
                    Fraud Score: <strong>${typeof p.fraudScore === "number" ? p.fraudScore.toFixed(4) : "0.0000"}</strong>
                </div>
                ${p.fraudReason ? `<div class="small" style="margin-top: 4px; color: #b45309;"><strong>Reason:</strong> ${p.fraudReason}</div>` : ""}
                <div style="margin-top: 10px;">${p.description || ""}</div>
                <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                    <p class="small"><strong>Add more images:</strong></p>
                    <input type="file" class="prop-images-${p._id}" multiple accept="image/*" style="margin-top: 5px;">
                    <button class="secondary" onclick="uploadMoreImages('${p._id}')" style="margin-top: 5px; width: 100%;">Upload Images</button>
                </div>
            `;

            box.appendChild(div);
        });

        if (!list.length) {
            box.innerHTML = `<div class="card">You have no listings yet.</div>`;
        }
    } catch (e) {
        box.innerHTML = `<div class="card">${e.message}</div>`;
    }
}

async function uploadMoreImages(propertyId) {
    try {
        const fileInput = document.querySelector(`.prop-images-${propertyId}`);
        if (!fileInput || fileInput.files.length === 0) {
            alert("Please select images to upload");
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append("images", fileInput.files[i]);
        }

        await uploadImages(propertyId, formData);
        alert("Images uploaded successfully!");
        loadMine();
    } catch (e) {
        alert(e.message);
    }
}

async function loadInbox() {
    const box = document.getElementById("inbox");

    try {
        const res = await api("/bookings/seller/inbox");
        const list = res.bookings || res;

        box.innerHTML = "";

        list.forEach(r => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <h4>${r.propertyId?.title || "Property"}</h4>
                <div class="small">From: ${r.buyerOrRenterId?.fname || "User"}</div>
                <div class="small">Email: ${r.buyerOrRenterId?.email || "N/A"}</div>
                <div class="small">Phone: ${r.buyerOrRenterId?.phone || "N/A"}</div>
                <div class="small">Booking Type: ${r.bookingtype || r.bookingType || "N/A"}</div>
                <div style="margin-top: 10px; padding: 15px; background: #f9f9f9; border-radius: 12px; border-left: 4px solid var(--accent);">
                    <strong>Buyer's Message:</strong><br>
                    <p style="margin-top: 5px; font-style: italic;">"${r.message || "No message provided."}"</p>
                </div>

                ${r.buyerReply ? `
                <div style="margin-top: 10px; padding: 12px; background: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e;">
                    <strong>Buyer's Follow-up:</strong><br>
                    <p style="margin-top: 5px; font-style: italic; font-size: 14px;">"${r.buyerReply}"</p>
                </div>
                ` : ""}

                <div style="margin-top: 15px;">
                    <textarea id="reply-${r._id}" placeholder="Type your reply here..." style="width: 100%; min-height: 80px; margin-bottom: 10px;">${r.sellerReply || ""}</textarea>
                    <div style="display: flex; gap: 10px;">
                        <button class="primary small" onclick="replyToBooking('${r._id}', 'accepted')">Accept & Reply</button>
                        <button class="outline small" onclick="replyToBooking('${r._id}', 'rejected')">Reject & Reply</button>
                        <button class="secondary small" onclick="replyToBooking('${r._id}', 'pending')">Just Reply</button>
                    </div>
                    <div class="small" style="margin-top: 5px;">Status: <strong>${r.status.toUpperCase()}</strong></div>
                </div>
            `;
            box.appendChild(div);
        });

        if (!list.length) {
            box.innerHTML = `<div class="card">No requests yet.</div>`;
        }
    } catch (e) {
        box.innerHTML = `<div class="card">${e.message}</div>`;
    }
}

async function replyToBooking(id, status) {
    const replyText = document.getElementById(`reply-${id}`).value.trim();

    try {
        await api(`/bookings/${id}/reply`, "PATCH", {
            sellerReply: replyText,
            status: status
        });
        alert("Reply sent successfully!");
        loadInbox();
    } catch (e) {
        alert(e.message);
    }
}

loadMine();
loadInbox();