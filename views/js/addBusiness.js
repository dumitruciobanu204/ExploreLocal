async function addLocalBusiness() {
    try {
        const nameInput = document.getElementById('name');
        const typeInput = document.getElementById('type');
        const countryInput = document.getElementById('country');
        const regionInput = document.getElementById('region');
        const longitudeInput = document.getElementById('longitude');
        const latitudeInput = document.getElementById('latitude');
        const descriptionInput = document.getElementById('description');
        const recommendationsInput = document.getElementById('recommendations');

        if (!nameInput.value || !typeInput.value || !countryInput.value || !regionInput.value || !longitudeInput.value || !latitudeInput.value || !descriptionInput.value || !recommendationsInput.value) {
            alert('Please fill in all fields.');
            return;
        }

        const name = nameInput.value.trim();
        const type = typeInput.value.trim();
        const country = countryInput.value.trim();
        const region = regionInput.value.trim();
        const longitude = longitudeInput.value.trim();
        const latitude = latitudeInput.value.trim();
        const description = descriptionInput.value.trim();
        const recommendations = recommendationsInput.value.trim();

        const data = {
            name,
            type,
            country,
            region,
            longitude,
            latitude,
            description,
            recommendations
        };

        const response = await fetch('http://localhost:3000/localbusiness/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // console.log(response);

        if (!response.ok) {
            if (response.status === 401) {
                alert('Log in to add a business.');
            } else {
                throw new Error('Error adding local business');
            }
        } else {
            const result = await response.json();
            map.closePopup();
            alert('Business added successfully.');
            document.getElementById('addBusinessForm').style.display = 'none';

            nameInput.value = '';
            typeInput.value = '';
            countryInput.value = '';
            regionInput.value = '';
            longitudeInput.value = '';
            latitudeInput.value = '';
            descriptionInput.value = '';
            recommendationsInput.value = '';
        }

    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to add business. ' + error.message);
    }
}
