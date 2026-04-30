// Set up AWS credentials - loaded from environment variables
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_BID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BID
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

// Handle form submission for placing a bid
document.getElementById('bidForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const bidAmountKg = document.getElementById('bidAmountKg').value;
    const bidAmount = document.getElementById('bidAmount').value;
    const journeyId = new URLSearchParams(window.location.search).get('journeyId');

    if (!bidAmountKg || !bidAmount) {
        alert('Please fill in all bid details');
        return;
    }

    const bidData = {
        bidId: 'bid_' + new Date().getTime(),
        journeyId: journeyId,
        bidAmountKg: parseFloat(bidAmountKg),
        bidAmount: parseFloat(bidAmount),
        driverId: 'driver_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };

    // Save bid to DynamoDB
    dynamoDB.put({
        TableName: 'Bids',
        Item: bidData
    }, function (err, data) {
        if (err) {
            console.error('Error placing bid:', err);
            alert('Error placing bid');
        } else {
            alert('Bid placed successfully!');
            // Send notification via SNS
            sns.publish({
                Message: `New bid placed for journey ${journeyId}`,
                TopicArn: 'arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:cargo-bids'
            }, function (err, data) {
                if (err) console.log('SNS error:', err);
            });
        }
    });
});
// Set up AWS credentials
// Credentials are loaded from environment variables
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_BID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BID
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

// Handle form submission for placing a bid
document.getElementById('bidForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent form submission

    const bidAmountKg = document.getElementById('bidAmountKg').value;
    const bidAmountMoney = document.getElementById('bidAmountMoney').value;
    const userId = "USER123";  // Replace with real user identification

    if (bidAmountKg <= 0 || bidAmountMoney <= 0) {
        document.getElementById('bidResponse').innerHTML = '<p>Please enter valid bid amounts.</p>';
        return;
    }

    const journeyId = document.getElementById('truckDetails').getAttribute('data-journey-id');

    // Fetch truck details to get the driver's phone number
    const params = {
        TableName: 'TruckJourneys',
        Key: { 'JourneyID': journeyId }
    };

    dynamoDB.get(params, function (err, data) {
        if (err || !data.Item) {
            console.error("Error retrieving truck details:", err);
            document.getElementById('bidResponse').innerHTML = '<p>Error placing bid. Please try again later.</p>';
            return;
        }

        const driverPhoneNumber = data.Item.PhoneNumber;  // Get the driver's phone number
        if (!driverPhoneNumber) {
            document.getElementById('bidResponse').innerHTML = '<p>No phone number found for the driver.</p>';
            return;
        }

        // Store the bid in DynamoDB
        const bidParams = {
            TableName: 'Bids',  // Ensure you have a Bids table set up in DynamoDB
            Item: {
                'BidID': `${journeyId}_${userId}_${new Date().getTime()}`,  // Unique ID for the bid
                'JourneyID': journeyId,
                'UserID': userId,
                'BidAmountKg': bidAmountKg,
                'BidAmountMoney': bidAmountMoney,
                'Timestamp': new Date().toISOString()
            }
        };

        // Insert the bid into DynamoDB
        dynamoDB.put(bidParams, function (err, data) {
            if (err) {
                console.error("Error storing bid:", err);
                document.getElementById('bidResponse').innerHTML = '<p>Error storing bid. Please try again later.</p>';
                return;
            }

            // Send an SMS to the driver about the bid
            const message = `A bid of ${bidAmountKg} kgs and ${bidAmountMoney} currency units has been placed for your truck journey from ${data.Item.FromCity} to ${data.Item.ToCity}.`;

            const snsParams = {
                Message: message,
                PhoneNumber: `+${driverPhoneNumber}`  // Ensure phone number is in E.164 format
            };

            sns.publish(snsParams, function (err, data) {
                if (err) {
                    console.error("Error sending SMS:", err);
                    document.getElementById('bidResponse').innerHTML = '<p>Error sending notification to driver.</p>';
                } else {
                    console.log("SMS sent:", data);
                    document.getElementById('bidResponse').innerHTML = '<p>Bid placed successfully! The truck driver has been notified.</p>';
                }
            });
        });
    });
});
