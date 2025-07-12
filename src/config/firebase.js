import admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://classrom-management-app-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();
export { admin, db };
