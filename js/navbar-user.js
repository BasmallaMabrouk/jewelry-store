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

        name = data.displayName || "Admin";

        role = data.role || "user";

    }



    if (role === 'admin') {

      

        navAuth.innerHTML = `

            <div class="admin-dropdown">

                <span class="admin-name">Hi Admin ${name} <i class="fa-solid fa-chevron-down"></i></span>

                <div class="dropdown-content">

                    <a href="AdminDashboard.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a>

                    <a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Log Out</a>

                </div>

            </div>`;

        navRegister.innerHTML = ""; 

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

}







updateNavbar();



auth.onAuthStateChanged(() => {

    updateNavbar();

});

ووو