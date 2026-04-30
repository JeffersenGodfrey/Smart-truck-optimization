document.addEventListener('DOMContentLoaded', function() {
    // User login redirect
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            window.location.href = 'user-dashboard.html'; // Redirect to user dashboard
        });
    }

    // Driver login redirect
    const driverLoginForm = document.getElementById('driverLoginForm');
    if (driverLoginForm) {
        driverLoginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            window.location.href = 'driver-dashboard.html'; // Redirect to driver dashboard
        });
    }
});
