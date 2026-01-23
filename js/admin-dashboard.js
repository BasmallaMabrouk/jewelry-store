import { db, auth } from "./CDNFirebase.js";
import { 
    collection, getDocs, deleteDoc, doc, getDoc, 
    addDoc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- المتغيرات العامة للتحكم في الواجهة ---
const contentArea = document.getElementById("content-area");
const sectionTitle = document.getElementById("section-title");
const mainAddBtn = document.querySelector(".add-new-btn");

// --- 1. دالة التنقل الرئيسية (Navigation) ---
window.showSection = async function(section) {
    contentArea.innerHTML = "<p>Loading...</p>";
    
    // تحديث شكل الـ sidebar (إزالة الـ active من الكل وإضافته للمختار)
    document.querySelectorAll('.side-btn').forEach(btn => btn.classList.remove('active'));
    // يتم تمرير الـ active عن طريق الكود في الـ HTML أو استهدافه هنا

    if (section === 'products') {
        sectionTitle.innerText = "Manage Products";
        mainAddBtn.style.display = "block";
        mainAddBtn.innerText = "+ Add New Product";
        mainAddBtn.onclick = openAddProductModal;
        renderProducts();
    } 
    else if (section === 'categories') {
        sectionTitle.innerText = "Manage Categories";
        mainAddBtn.style.display = "block";
        mainAddBtn.innerText = "+ Add New Category";
        mainAddBtn.onclick = () => document.getElementById("categoryModal").style.display = "block";
        renderCategories();
    } 
    else if (section === 'orders') {
        sectionTitle.innerText = "Customer Orders";
        mainAddBtn.style.display = "none";
        renderOrders();
    }
};

// --- 2. إدارة المنتجات (Products) ---
async function renderProducts() {
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

function openAddProductModal() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("modalTitle").innerText = "Add New Product";
    document.getElementById("productModal").style.display = "block";
}

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

window.deleteProduct = async (id) => {
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "products", id));
        renderProducts();
    }
};

// الحفظ (إضافة أو تعديل)
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
            await updateDoc(doc(db, "products", id), productData);
        } else {
            await addDoc(collection(db, "products"), productData);
        }
        document.getElementById("productModal").style.display = "none";
        renderProducts();
    } catch (e) { alert("Error saving product"); }
};

// --- 3. إدارة التصنيفات (Categories) ---
async function renderCategories() {
    const querySnapshot = await getDocs(collection(db, "categories"));
    let html = `<div class="cat-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px;">`;
    
    querySnapshot.forEach((docSnap) => {
        const cat = docSnap.data();
        html += `
            <div class="cat-card" style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 1px solid #ddd;">
                <img src="${cat.image}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;">
                <h4>${cat.name}</h4>
                <button onclick="deleteCategory('${docSnap.id}')" style="color: red; border: none; background: none; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
    contentArea.innerHTML = html + `</div>`;
}

document.getElementById("categoryForm").onsubmit = async (e) => {
    e.preventDefault();
    const catData = {
        name: document.getElementById("catName").value,
        image: document.getElementById("catImg").value
    };
    await addDoc(collection(db, "categories"), catData);
    document.getElementById("categoryModal").style.display = "none";
    renderCategories();
};

window.deleteCategory = async (id) => {
    if (confirm("Delete this category?")) {
        await deleteDoc(doc(db, "categories", id));
        renderCategories();
    }
};

// --- 4. عرض الطلبات (Orders) ---
async function renderOrders() {
    // جلب الطلبات مرتبة من الأحدث
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    let tableHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>`;

    querySnapshot.forEach((docSnap) => {
        const o = docSnap.data();
        tableHTML += `
            <tr>
                <td>#${docSnap.id.slice(0, 6)}</td>
                <td>${o.customerEmail || 'Guest'}</td>
                <td>$${o.totalAmount || o.totalPrice}</td>
                <td><span class="cat-badge">${o.status || 'Success'}</span></td>
            </tr>`;
    });
    tableHTML += `</tbody></table>`;
    contentArea.innerHTML = tableHTML;
}

// --- 5. التحقق من صلاحية الأدمن عند الدخول ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            document.getElementById("adminName").innerText = "Hi Admin " + (userDoc.data().displayName || "User");
            // ابدأ بعرض المنتجات كافتراضي
            showSection('products');
        } else { 
            window.location.href = "login.html"; 
        }
    } else { 
        window.location.href = "login.html"; 
    }
});

window.closeModal = () => {
    document.getElementById("productModal").style.display = "none";
    document.getElementById("categoryModal").style.display = "none";
};