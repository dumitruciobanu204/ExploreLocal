async function searchByRegion() {
    const region = document.getElementById("regionSearch").value;

    if (region === '') {
        alert('Please enter a region.');
        return;
    }

    // console.log(`${region}`);

    fetch(`/localbusiness/${region}`)
        .then(res => res.json())
        .then(data => {

            console.log(data);
            
            renderResultsInHTML(data);
        });
}


function renderResultsInHTML(data) {
    const nbBusiness = data.length;

    var html = `<p><b>${nbBusiness}</b> result(s)</p>`;

    if (nbBusiness > 0) {
        html += '<ul>';
        data.forEach(business => {
            html += '<p>Name: ' + business.name + '</p>';
            html += '<p>Type: ' + business.type + '</p>';
            html += '<p>Longitude: ' + business.lon + '</p>';
            html += '<p>Latitude: ' + business.lat + '</p>';
            html += '<p>Description: ' + business.description + '</p>';
            html += `<p>Recommendations: <span id="recommendCount_${business.name}">${business.recommendations}</span></p>`;
            html += `<button onclick="recommendBusiness('${business.name}'); return false;">Recommend</button>`;

            html += `<button onclick="reviewBusiness('${business.name}'); return false;">Review</button>`;
                            
            html += '<hr>';
        });
        html += '</ul>';
    }    

    document.getElementById("searchResults").innerHTML = html;
    document.getElementById('searchResults').style.display = 'block';

    renderResultsOnMap(data);
}

async function recommendBusiness(name) {
    try {
        const response = await fetch(`/localbusiness/${name}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: name })
        });

        const data = await response.json();

        if (data.success) {
            const recommendCountElement = document.getElementById(`recommendCount_${name}`);
            if (recommendCountElement) {
                const currentCount = parseInt(recommendCountElement.innerText, 10);
                recommendCountElement.innerText = currentCount + 1;
            }
        } else {
            console.error('Recommendation failed:', data.error);
        }
        
    } catch (error) {
        console.error(error);
    }

    return false;
}

function reviewBusiness(name) {
    const reviewTextBox = prompt('Enter your review for ' + name);
    
    if (reviewTextBox !== null) {
        submitReview(name, reviewTextBox);
    }
}

async function submitReview(name, review) {
    try {
        const loggedInUserSpan = document.getElementById('loggedInUserName');
        const userId = loggedInUserSpan ? loggedInUserSpan.innerText : null;

        if (!userId) {
            console.error('User ID not found.');
            alert('Login to add a review');
            return;
        }

        const data = {
            business_name: name,
            user_name: userId,
            review: review
        };

        const response = await fetch(`/localbusiness/${name}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Log in to add a review.');
            } else {
                throw new Error('Error adding review');
            }
        } else {
            const result = await response.json();
            alert(`Review for ${name} added successfully`)
            // console.log('Review added successfully', result.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to add review. ' + error.message);
    }
}

