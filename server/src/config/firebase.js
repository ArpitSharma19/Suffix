const admin = require('firebase-admin');

const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
};

if (
    firebaseAdminConfig.projectId &&
    firebaseAdminConfig.clientEmail &&
    firebaseAdminConfig.privateKey
) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
    });
    console.log("Firebase Admin initialized");
} else {
    console.warn(
        "Firebase Admin credentials not fully provided. Auth verification may fail."
    );
}

module.exports = admin;
