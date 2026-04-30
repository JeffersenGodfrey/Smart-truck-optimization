import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ✅ Correct Firebase Configuration (load from environment variables)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

// ✅ Function to handle Google login and ensure user signup
async function handleGoogleLogin(role) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // ✅ Reference Firestore user document
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // ✅ If user is new, store their details in Firestore
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: role,  // Either "user" or "driver"
                profilePic: user.photoURL,
                createdAt: new Date()
            });
            console.log("New user registered!");
        } else {
            console.log("Existing user logged in.");
        }

        // ✅ Redirect based on role
        if (role === "user") {
            window.location.href = "user-dashboard.html";
        } else if (role === "driver") {
            window.location.href = "driver-dashboard.html";
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

// ✅ Listen to auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.email);
    } else {
        console.log("User logged out");
    }
});

// ✅ Event listeners for login buttons
document.addEventListener('DOMContentLoaded', () => {
    const userLoginBtn = document.getElementById('userLoginBtn');
    const driverLoginBtn = document.getElementById('driverLoginBtn');

    if (userLoginBtn) {
        userLoginBtn.addEventListener('click', () => handleGoogleLogin('user'));
    }

    if (driverLoginBtn) {
        driverLoginBtn.addEventListener('click', () => handleGoogleLogin('driver'));
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ✅ Correct Firebase Configuration (load from environment variables)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

// ✅ Function to handle Google login and ensure user signup
async function handleGoogleLogin(role) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // ✅ Reference Firestore user document
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // ✅ If user is new, store their details in Firestore
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: role,  // Either "user" or "driver"
                profilePic: user.photoURL,
                createdAt: new Date()
            });
            console.log("New user registered!");
        } else {
            console.log("Existing user logged in.");
        }

        // ✅ Redirect based on role
        if (role === "user") {
            window.location.href = "user-dashboard.html";
        } else if (role === "driver") {
            window.location.href = "driver-dashboard.html";
        }

    } catch (error) {
        console.error("Error during login:", error);
        alert("Login Failed: " + error.message);
    }
}

// ✅ Function to check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
    } else {
        console.log("User is signed out.");
    }
});

// ✅ Event Listeners for User & Driver Login
document.addEventListener("DOMContentLoaded", () => {
    const googleLoginUser = document.getElementById("googleLoginUser");
    const googleLoginDriver = document.getElementById("googleLoginDriver");

    if (googleLoginUser) {
        googleLoginUser.addEventListener("click", () => handleGoogleLogin("user"));
    }

    if (googleLoginDriver) {
        googleLoginDriver.addEventListener("click", () => handleGoogleLogin("driver"));
    }
});
