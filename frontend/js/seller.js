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
            images: []
        };

        const data = await api("/properties", "POST", body);
        
        // Upload images if selected
        const fileInput = document.getElementById("images");
        if (fileInput && fileInput.files.length > 0) {
            msg.innerText = "Uploading images...";
            const formData = new FormData();
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('images', fileInput.files[i]);
            }
            await uploadImages(data.property._id, formData);
        }

        msg.innerText = "Property added successfully!";
        msg.style.color = "green";

        // Clear form
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("price").value = "";
        document.getElementById("city").value = "";
        document.getElementById("address").value = "";
        if (fileInput) fileInput.value = "";

        // Refresh listings immediately
        loadMine();
    } catch (e) {
        msg.innerText = e.message;
        msg.style.color = "red";
    }
}

async function uploadImages(propertyId, formData) {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/properties/${propertyId}/upload`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        body: formData
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Image upload failed");
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
            
            const firstImg = p.images && p.images.length > 0 ? p.images[0] : '';
            const imgUrl = firstImg ? (firstImg.startsWith('http') ? firstImg : `http://localhost:5000${firstImg.startsWith('/') ? '' : '/'}${firstImg}`) : 'https://placehold.co/300x200/orange/white?text=property';

            div.innerHTML = `
                <img src="${imgUrl}" alt="property image" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h4>${p.title}</h4>
                <div class="small">₹${p.price} • ${p.location?.city || ""} • Verified: ${p.isVerified ? "Yes" : "No"}</div>
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
            formData.append('images', fileInput.files[i]);
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
                    <strong>Message:</strong><br>
                    <p style="margin-top: 5px; font-style: italic;">"${r.message || "No message provided."}"</p>
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

loadMine();
loadInbox();