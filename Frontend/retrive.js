// AWS Configuration - loaded from environment variables
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fromCity = document.getElementById('fromCity').value.trim();
    const toCity = document.getElementById('toCity').value.trim();
    const resultsDiv = document.getElementById('journeyResults');

    if (!fromCity || !toCity) {
        alert('Please enter both cities');
        return;
    }

    resultsDiv.innerHTML = '<p>Loading journeys...</p>';

    // Query DynamoDB for journeys
    dynamodb.scan({
        TableName: 'CargoJourneys',
        FilterExpression: 'fromCity = :from AND toCity = :to',
        ExpressionAttributeValues: {
            ':from': fromCity,
            ':to': toCity
        }
    }, function (err, data) {
        if (err) {
            console.error('Error fetching journeys:', err);
            resultsDiv.innerHTML = '<p>Error loading journeys. Please try again.</p>';
            return;
        }

        if (data.Items.length === 0) {
            resultsDiv.innerHTML = '<p>No journeys found for this route.</p>';
            return;
        }

        let html = '<div class="journeys-list">';
        data.Items.forEach(journey => {
            html += `
                <div class="journey-card">
                    <h3>${journey.fromCity} → ${journey.toCity}</h3>
                    <p>Weight: ${journey.weight} kg</p>
                    <p>${journey.description}</p>
                    <img src="${journey.imageUrl}" alt="Journey image" style="max-width: 200px;">
                    <a href="bid.html?journeyId=${journey.journeyId}" class="bid-btn">Place Bid</a>
                </div>
            `;
        });
        html += '</div>';
        resultsDiv.innerHTML = html;
    });
});
// ⚠️ IMPORTANT SECURITY NOTE:
// AWS credentials are loaded from environment variables
// Never hardcode credentials in source code

AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fromCity = document.getElementById('fromCity').value.trim();
    const toCity = document.getElementById('toCity').value.trim();
    const resultsDiv = document.getElementById('journeyResults');
    resultsDiv.innerHTML = '';

    if (!fromCity || !toCity) {
        resultsDiv.innerHTML = '<p>Please enter both From City and To City.</p>';
        return;
    }

    searchTruckJourneys(fromCity, toCity);
});

function searchTruckJourneys(fromCity, toCity) {
    const params = {
        TableName: 'truckjourney',
        FilterExpression: 'FromCity = :from AND ToCity = :to',
        ExpressionAttributeValues: {
            ':from': fromCity,
            ':to': toCity
        }
    };

    dynamodb.scan(params, function (err, data) {
        const resultsDiv = document.getElementById('journeyResults');
        if (err) {
            console.error("Error scanning DynamoDB:", err);
            resultsDiv.innerHTML = '<p>Failed to retrieve journeys. Please try again later.</p>';
        } else if (data.Items.length === 0) {
            resultsDiv.innerHTML = '<p>No journeys found for the selected cities.</p>';
        } else {
            displayJourneys(data.Items);
        }
    });
}

function displayJourneys(journeys) {
    const resultsDiv = document.getElementById('journeyResults');
    resultsDiv.innerHTML = '';

    journeys.forEach(journey => {
        const journeyDiv = document.createElement('div');
        journeyDiv.classList.add('journey-item');

        journeyDiv.innerHTML = `
            <h3>Journey from ${journey.FromCity} to ${journey.ToCity}</h3>
            <p><strong>Truck Type:</strong> ${journey.TruckType}</p>
            <p><strong>Departure Date:</strong> ${journey.DepartureDate}</p>
            <img src="${journey.TruckImageURL}" alt="Truck Image" class="truck-img"/>
            <button class="btn btn-book" data-journey-id="${journey.Journeyid}">Book Now</button>
            <button class="btn btn-contact">Contact Driver</button>
        `;

        resultsDiv.appendChild(journeyDiv);
    });

    document.querySelectorAll('.btn-book').forEach(button => {
        button.addEventListener('click', function () {
            const journeyId = this.getAttribute('data-journey-id');
            window.location.href = `bid.html?journeyId=${journeyId}`;
        });
    });
}
