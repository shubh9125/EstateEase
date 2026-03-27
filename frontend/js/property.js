let currentProperty = null;

function setNav() {
    const nav = document.getElementById("navLinks");
    const user = getUser();

    if (user) {
        nav.innerHTML = `
            <a href="index.html">Home</a>
            <a href="${user.role}.html">Dashboard</a>
            <a href="#" onclick="logout()">Logout</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

async function loadProperty() {
    setNav();

    const propertyId = localStorage.getItem("propertyId");
    const box = document.getElementById("propertyBox");
    const bookingCard = document.getElementById("bookingCard");
    const sellerInfo = document.getElementById("sellerInfo");

    if (!propertyId) {
        box.innerHTML = "<h3>No property selected.</h3>";
        return;
    }

    try {
        const res = await api("/properties");
        const list = res.properties || res;
        currentProperty = list.find(p => String(p._id || p.id) === String(propertyId));

        console.log("Selected property:", currentProperty);

        if (!currentProperty) {
            box.innerHTML = "<h3>Property not found.</h3>";
            return;
        }

        const imageArray = currentProperty.images || [];
        const firstImage = imageArray.length > 0 ? imageArray[0] : "";

        const imageUrl = firstImage
            ? (firstImage.startsWith("http") ? firstImage : `http://localhost:5000${firstImage}`)
            : "";

        console.log("Final image URL:", imageUrl);

        if (currentProperty.flaggedAsFraud) {
            box.innerHTML = `
                <div style="background: #fff5f5; border-left: 5px solid #fc8181; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: #c53030;">
                    <h3 style="margin:0;">⚠️ Warning: This property is flagged!</h3>
                    <p style="margin: 5px 0 0;">This property has been flagged by the admin as suspicious or fraudulent. Please proceed with extreme caution.</p>
                </div>
            ` + box.innerHTML;
            
            // Also show a browser alert
            setTimeout(() => {
                alert("⚠️ WARNING: This property has been flagged as FRAUD by the administration. Be careful!");
            }, 500);
        }

        box.innerHTML = `
            ${imageUrl ? `
                <img 
                    src="${imageUrl}" 
                    alt="${currentProperty.title}" 
                    style="width:100%; height:320px; object-fit:cover; border-radius:10px; margin-bottom:15px;"
                >
            ` : `<p><em>No image available</em></p>`}

            <h2>${currentProperty.title}</h2>
            <p class="small">
                ${(currentProperty.location && currentProperty.location.city) || currentProperty.city || "N/A"} 
                • 
                ${(currentProperty.location && currentProperty.location.address) || currentProperty.address || "N/A"}
            </p>
            <p>${currentProperty.description || ""}</p>
            <p><b>Price:</b> ₹${currentProperty.price || 0}</p>
        `;

        const seller = currentProperty.ownerId;
        if (seller) {
            sellerInfo.style.display = "block";
            sellerInfo.innerHTML = `
                <h3>Seller Details</h3>
                <p><strong>Name:</strong> ${seller.fname || "N/A"}</p>
                <p><strong>Email:</strong> ${seller.email || "N/A"}</p>
                <p><strong>Phone:</strong> ${seller.phone || "N/A"}</p>
            `;
        }

        const user = getUser();
        if (user && (user.role === "buyer" || user.role === "renter")) {
            bookingCard.style.display = "block";
        }
    } catch (e) {
        console.log(e);
        box.innerHTML = `<h3>${e.message}</h3>`;
    }
}

async function sendBooking() {
    const msg = document.getElementById("bookingMsg");
    const message = document.getElementById("message").value.trim();
    const user = requireLogin();

    if (!user) return;

    if (user.role !== "buyer" && user.role !== "renter") {
        msg.innerText = "Only buyer or renter can send a request.";
        return;
    }

    if (!currentProperty) {
        msg.innerText = "Property not loaded.";
        return;
    }

    try {
        const propertyId = currentProperty._id || currentProperty.id;

        const data = await api("/bookings", "POST", {
            propertyId,
            message
        });

        msg.innerText = data.message || "Request sent successfully";
        document.getElementById("message").value = "";
    } catch (e) {
        msg.innerText = e.message;
    }
}

loadProperty();