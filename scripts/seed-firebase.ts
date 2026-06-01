import "dotenv/config";
import { firebaseSeed } from "../src/lib/firebase-store";

firebaseSeed()
  .then(() => {
    console.log("Firebase seed selesai. Admin dan dummy data sudah masuk Firestore.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
