import { auth, db } from "./CDNFirebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. دالة التسجيل (Register)
export async function registerUser(email, password, name) {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: name,
            email: email,
            role: "user" 
        });

        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "Home.html";
    } catch (error) {
        console.error(error);
        alert("خطأ في التسجيل: " + error.message);
    }
}

// 2. دالة تسجيل الدخول (Login)
export async function loginUser(email, password) {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // نجيب بياناته عشان نعرف هو أدمن ولا مستخدم
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            localStorage.setItem("userRole", userData.role);

            if (userData.role == "admin") {
                alert("Welcome Admin!");
                window.location.href = "Home.html"; 
            } else {
                alert("Login Successful!");

                window.location.href = "Home.html";
               
            }
        }
    } catch (error) {
        console.error(error);
        alert("خطأ في الدخول: " + error.message);
    }
}