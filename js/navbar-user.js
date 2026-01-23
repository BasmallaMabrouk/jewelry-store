import { auth, db } from "./CDNFirebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userBox = document.getElementById("userBox");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            const name = data.displayName;
            const role = data.role;

            userBox.innerHTML = `
                <span class="user-greet">
                    Hi, <b>${role === "admin" ? "Admin" : "User"} ${name} </b>
                </span>
            `;
            userBox.style.color = "#f6f0eb";
        }
    } else {
        userBox.innerHTML = `<a href="Login.html" id="loginBtn">Login</a>`;
    }
});
