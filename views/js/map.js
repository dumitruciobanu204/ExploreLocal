const map = L.map('map', {
    zoomControl: false
}).setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

function renderResultsOnMap(data) {
    const businessLatLngs = [];

    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    data.forEach(business => {
        const marker = L.marker([business.lat, business.lon])
            .bindPopup(
                `<p><b>Name:</b> ${business.name}</p>` +
                `<p><b>Description:</b> ${business.description}</p>`
            )
            .addTo(map);

        businessLatLngs.push(marker.getLatLng());
    });

    if (businessLatLngs.length > 0) {
        const bounds = L.latLngBounds(businessLatLngs);
        map.fitBounds(bounds);
    }
}

function clearMarkers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

map.on('click', function (e) {
    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(`<button onclick="openAddBusinessForm(${e.latlng.lat}, ${e.latlng.lng})">Add Local Business</button>`)
        .openOn(map);
});

function openAddBusinessForm(latitude, longitude) {
    document.getElementById('addBusinessForm').style.display = 'block';

    document.getElementById('latitude').value = latitude;
    document.getElementById('longitude').value = longitude;
}

function cancelSearch() {
    clearMarkers();
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('regionSearch').value = '';
}