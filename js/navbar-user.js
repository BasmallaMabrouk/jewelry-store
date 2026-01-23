
import { auth, db } from "./CDNFirebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function updateNavbar() {
    const navAuth = document.getElementById("nav-auth");
    const navRegister = document.getElementById("nav-register");

    const user = auth.currentUser;


    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let name = "User";
        let role = "user";

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

        navAuth.innerHTML = `<span>Hi ${name}</span>`;
        navRegister.innerHTML = `<a href="#" id="logoutBtn">Log Out</a>`;
    }


    document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        localStorage.removeItem("userRole");
        window.location.href = "Home.html";
    });
}




updateNavbar();

auth.onAuthStateChanged(() => {
    updateNavbar();
});
