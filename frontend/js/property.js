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
        const imageUrl = window.getPropertyImageUrl(firstImage);

        console.log("Selected property:", currentProperty);
        console.log("Images array:", imageArray);
        console.log("First image:", firstImage);
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
                    onerror="this.src='https://placehold.co/800x400?text=Image+Not+Found'"
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

        // Load Map
        if (currentProperty.location?.coordinates?.lat && currentProperty.location?.coordinates?.lng) {
            document.getElementById("mapCard").style.display = "block";
            initLeafletMap(currentProperty.location.coordinates.lat, currentProperty.location.coordinates.lng, currentProperty.title);
        } else {
            const address = `${currentProperty.location?.address || currentProperty.address || ""}, ${currentProperty.location?.city || currentProperty.city || ""}`;
            if (address && address.length > 5) {
                document.getElementById("mapCard").style.display = "block";
                initMap(address); // Fallback to old search-based map if no coords
            }
        }

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
    const propertyId = localStorage.getItem("propertyId");
    const message = document.getElementById("message").value;
    const msg = document.getElementById("bookingMsg");

    if (!message) {
        msg.innerText = "Please enter a message";
        msg.style.color = "red";
        return;
    }

    try {
        const res = await api("/bookings", "POST", { propertyId, message });
        msg.innerText = res.message;
        msg.style.color = "green";
        document.getElementById("message").value = "";
    } catch (e) {
        msg.innerText = e.message;
        msg.style.color = "red";
    }
}

function initLeafletMap(lat, lng, title) {
    const map = L.map('map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng])
        .bindPopup(title)
        .addTo(map);
}

// Google Maps Integration (using Embed API - more reliable)
function initMap(address) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const apiKey = "AIzaSyBqZQ83IZn0zl4XBGYvhO9J8YEVDW-5rsA"; // Your key here
    
    if (apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
        mapContainer.innerHTML = `
            <div style="padding: 20px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; color: #92400e;">
                <p><strong>Map setup needed:</strong> Please replace <code>YOUR_GOOGLE_MAPS_API_KEY</code> in <code>js/property.js</code> with your real Google Maps API Key to show the property's location.</p>
                <p>Current Address: <em>${address}</em></p>
            </div>
        `;
        return;
    }

    // Using Google Maps Embed API (Iframe) - much simpler and works more reliably
    const encodedAddress = encodeURIComponent(address);
    mapContainer.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            style="border:0; border-radius: 12px;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}">
        </iframe>
    `;
}

loadProperty();