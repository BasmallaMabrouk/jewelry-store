import { db, auth } from "./CDNFirebase.js";
import { collection, getDocs, deleteDoc, doc, getDoc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// read
async function renderProducts() {
    const contentArea = document.getElementById("content-area");
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let tableHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>`;

        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            tableHTML += `
                <tr>
                    <td><img src="${p.images?.[0] || ''}" class="table-img"></td>
                    <td>${p.title}</td>
                    <td>$${p.price}</td>
                    <td>
                        <button class="edit-btn" onclick="openEditModal('${docSnap.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-btn" onclick="deleteProduct('${docSnap.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        contentArea.innerHTML = tableHTML;
    } catch (e) { console.error(e); }
}


window.closeModal = () => document.getElementById("productModal").style.display = "none";

document.querySelector(".add-new-btn").onclick = () => {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("modalTitle").innerText = "Add New Product";
    document.getElementById("productModal").style.display = "block";
};


document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("productId").value;
    const productData = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        price: Number(document.getElementById("price").value),
        stock_quantity: Number(document.getElementById("stock").value),
        description: document.getElementById("description").value,
        images: [document.getElementById("image1").value, document.getElementById("image2").value].filter(url => url !== ""),
    };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), productData); // تعديل
        } else {
            await addDoc(collection(db, "products"), productData); // إضافة
        }
        closeModal();
        renderProducts();
    } catch (e) { alert("Error saving product"); }
};

//edit
window.openEditModal = async (id) => {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
        const p = docSnap.data();
        document.getElementById("productId").value = id;
        document.getElementById("title").value = p.title;
        document.getElementById("category").value = p.category;
        document.getElementById("price").value = p.price;
        document.getElementById("stock").value = p.stock_quantity;
        document.getElementById("image1").value = p.images?.[0] || "";
        document.getElementById("image2").value = p.images?.[1] || "";
        document.getElementById("description").value = p.description || "";
        document.getElementById("modalTitle").innerText = "Edit Product";
        document.getElementById("productModal").style.display = "block";
    }
};

//delete
window.deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
        await deleteDoc(doc(db, "products", id));
        renderProducts();
    }
};


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            document.getElementById("adminName").innerText = "Hi Admin " + (userDoc.data().displayName || "Admin");
            renderProducts();
        } else { window.location.href = "index.html"; }
    } else { window.location.href = "login.html"; }
});