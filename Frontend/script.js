// AWS Configuration - loaded from environment variables
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
});

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

document.getElementById("addJourneyForm").addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitButton = document.getElementById("submit");
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Uploading...';

    const fromCity = document.getElementById("fromCity").value;
    const toCity = document.getElementById("toCity").value;
    const weight = document.getElementById("weight").value;
    const description = document.getElementById("description").value;
    const imageFile = document.getElementById("imageFile").files[0];

    if (!fromCity || !toCity || !weight || !description || !imageFile) {
        alert("Please fill all fields and select an image!");
        submitButton.disabled = false;
        submitButton.innerHTML = "Submit";
        return;
    }

    // Upload image to S3
    const s3Params = {
        Bucket: 'cargo-journey-images',
        Key: 'journeys/' + new Date().getTime() + '_' + imageFile.name,
        Body: imageFile
    };

    s3.upload(s3Params, async function (err, data) {
        if (err) {
            console.error("S3 Upload error:", err);
            alert("Error uploading image!");
            submitButton.disabled = false;
            submitButton.innerHTML = "Submit";
            return;
        }

        // Save to DynamoDB
        const journeyId = 'journey_' + new Date().getTime();
        const journeyData = {
            journeyId: journeyId,
            fromCity: fromCity,
            toCity: toCity,
            weight: weight,
            description: description,
            imageUrl: data.Location,
            createdAt: new Date().toISOString()
        };

        dynamodb.put({
            TableName: 'CargoJourneys',
            Item: journeyData
        }, function (err, data) {
            if (err) {
                console.error("DynamoDB error:", err);
                alert("Error saving journey!");
            } else {
                alert("Journey added successfully!");
                document.getElementById("addJourneyForm").reset();
                submitButton.disabled = false;
                submitButton.innerHTML = "Submit";
            }
        });
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

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

document.getElementById("addJourneyForm").addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitButton = document.getElementById("submit");
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Uploading...';

    // Get form values
    const truckType = document.getElementById("truckType")?.value || "";
    const rawDate = document.getElementById("departureDate")?.value || "";
    const fromCity = document.getElementById("fromCity")?.value.trim() || "";
    const toCity = document.getElementById("toCity")?.value.trim() || "";
    const phoneNumber = document.getElementById("phoneNumber")?.value.trim() || "";
    const imageFile = document.getElementById("imageUpload")?.files[0];

    // Format date: yyyy - mm - dd
    const formattedDate = new Date(rawDate).toISOString().split('T')[0].replace(/-/g, ' - ');

    // Validate phone number format
    const phoneRegex = /^(\+91|91)?[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        alert("Please enter a valid 10-digit Indian phone number with or without +91.");
        resetButton();
        return;
    }

    if (!imageFile) {
        alert("Please upload a truck image.");
        resetButton();
        return;
    }

    // Additional image validation
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(imageFile.type)) {
        alert("Please upload a valid image file (JPEG, PNG, or GIF).");
        resetButton();
        return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxFileSize) {
        alert("Image file size must be less than 5MB.");
        resetButton();
        return;
    }

    const journeyid = Date.now().toString();

    try {
        // Using AWS ManagedUpload for better CORS handling
        const uploadParams = {
            Bucket: 'truck-images1',
            Key: `${journeyid}-${imageFile.name}`,
            Body: imageFile,
            ContentType: imageFile.type,
            Metadata: {
                'original-filename': imageFile.name
            }
        };
        

        // Create the managed upload object
        const upload = new AWS.S3.ManagedUpload({
            params: uploadParams,
            service: s3,
            queueSize: 4, // Optional: Number of concurrent uploads
            partSize: 5 * 1024 * 1024 // Optional: Part size in bytes (5MB)
        });

        // Track upload progress
        upload.on('httpUploadProgress', function(progress) {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            console.log(`Upload progress: ${percentage}%`);
            // Optional: Update UI with progress
            submitButton.innerHTML = `<span class="spinner"></span> Uploading ${percentage}%`;
        });

        // Execute the upload
        const s3UploadResult = await upload.promise();
        console.log('Image uploaded successfully!', s3UploadResult);

        const imageUrl = s3UploadResult.Location;

        // Save to DynamoDB
        const params = {
            TableName: 'truckjourney',
            Item: {
                "journeyid": journeyid, // ✅ fixed key name
                "TruckType": truckType,
                "DepartureDate": formattedDate,
                "FromCity": fromCity,
                "ToCity": toCity,
                "TruckImageURL": imageUrl,
                "PhoneNumber": phoneNumber,
                "CreatedAt": new Date().toISOString()
            }
        };
        

        await dynamodb.put(params).promise();
        console.log("Journey saved successfully!");

        // Success handling
        alert("Journey added successfully!");
        document.getElementById("addJourneyForm").reset();
        window.location.href = "driver-dashboard.html";

    } catch (error) {
        console.error("Error:", error);
        
        // More specific error handling
        if (error.code === "AccessDenied") {
            alert("Upload failed: Permission denied. Please check your AWS credentials.");
        } else if (error.code === "NetworkError") {
            alert("Upload failed: Network error. Please check your internet connection.");
        } else {
            alert("An error occurred. Please try again.");
        }
    } finally {
        resetButton();
    }

    function resetButton() {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Add Journey';
    }
});

// Helper function to format date (if needed elsewhere)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}