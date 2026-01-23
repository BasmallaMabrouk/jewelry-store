import { db, auth } from "./CDNFirebase.js";
import { 
    collection, getDocs, deleteDoc, doc, getDoc, 
    addDoc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- المتغيرات العامة للتحكم في الواجهة ---
const contentArea = document.getElementById("content-area");
const sectionTitle = document.getElementById("section-title");
const mainAddBtn = document.getElementById("mainActionBtn"); // تأكدي أن الـ ID مطابق للـ HTML

// --- 1. دالة التنقل الرئيسية (Navigation) ---
window.showSection = async function(section, btnElement) {
    contentArea.innerHTML = "<p style='text-align:center; padding:20px;'>Loading...</p>";
    
    // تحديث شكل الـ sidebar
    document.querySelectorAll('.side-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

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
                    <td><img src="${p.images?.[0] || p.image || ''}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;"></td>
                    <td>${p.title}</td>
                    <td>$${p.price}</td>
                    <td>
                        <button class="edit-btn" onclick="openEditModal('${docSnap.id}')" style="background:#4A90E2; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; margin-right:5px;"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-btn" onclick="deleteProduct('${docSnap.id}')" style="background:#E74C3C; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        contentArea.innerHTML = tableHTML;
    } catch (e) { 
        console.error(e);
        contentArea.innerHTML = "<p>Error loading products.</p>";
    }
}

function openAddProductModal() {
    const form = document.getElementById("productForm");
    if(form) form.reset();
    document.getElementById("pId").value = ""; // تفريغ الـ ID المخفي
    document.getElementById("modalTitle").innerText = "Add New Product";
    document.getElementById("productModal").style.display = "block";
}

window.openEditModal = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
            const p = docSnap.data();
            // ربط البيانات بالـ Inputs بناءً على الـ IDs في الـ HTML الخاص بكِ
            document.getElementById("pId").value = id;
            document.getElementById("pTitle").value = p.title || "";
            document.getElementById("pCategory").value = p.category || "";
            document.getElementById("pPrice").value = p.price || "";
            document.getElementById("pStock").value = p.stock_quantity || p.stock || "";
            document.getElementById("pImage1").value = p.images?.[0] || p.image || "";
            document.getElementById("pDesc").value = p.description || "";
            
            document.getElementById("modalTitle").innerText = "Edit Product";
            document.getElementById("productModal").style.display = "block";
        }
    } catch (e) { alert("Error fetching product details"); }
};

window.deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
        await deleteDoc(doc(db, "products", id));
        renderProducts();
    }
};

// معالج فورم المنتجات (إضافة أو تعديل)
document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("pId").value;
    const productData = {
        title: document.getElementById("pTitle").value,
        category: document.getElementById("pCategory").value,
        price: Number(document.getElementById("pPrice").value),
        stock_quantity: Number(document.getElementById("pStock").value),
        description: document.getElementById("pDesc").value,
        images: [document.getElementById("pImage1").value].filter(url => url !== ""),
    };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), productData);
            alert("Product updated successfully!");
        } else {
            await addDoc(collection(db, "products"), productData);
            alert("Product added successfully!");
        }
        document.getElementById("productModal").style.display = "none";
        renderProducts();
    } catch (e) { alert("Error saving product: " + e.message); }
};

// --- 3. إدارة التصنيفات (Categories) ---
async function renderCategories() {
    const querySnapshot = await getDocs(collection(db, "categories"));
    let html = `<div class="cat-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">`;
    
    querySnapshot.forEach((docSnap) => {
        const cat = docSnap.data();
        html += `
            <div class="cat-card" style="background: white; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #D6C5A9;">
                <img src="${cat.image}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;">
                <h4>${cat.name}</h4>
                <button onclick="deleteCategory('${docSnap.id}')" style="color: #a33b3b; border: none; background: none; cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-trash"></i></button>
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
    try {
        await addDoc(collection(db, "categories"), catData);
        document.getElementById("categoryModal").style.display = "none";
        renderCategories();
    } catch (e) { alert("Error adding category"); }
};

window.deleteCategory = async (id) => {
    if (confirm("Delete this category?")) {
        await deleteDoc(doc(db, "categories", id));
        renderCategories();
    }
};

// --- 4. عرض الطلبات (Orders) ---
async function renderOrders() {
    try {
        // جلب الطلبات (تأكدي أن الحقل في الـ Checkout هو 'timestamp' للترتيب)
        const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
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
                    <td>$${o.totalAmount}</td>
                    <td><span class="status-badge" style="padding: 5px 12px; border-radius: 20px; background: #D6C5A9; color: #705C49;">${o.status || 'Pending'}</span></td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        contentArea.innerHTML = tableSnapshot.empty ? "<p>No orders found.</p>" : tableHTML;
    } catch (e) { 
        console.error(e);
        contentArea.innerHTML = "<p>Error loading orders. Make sure 'timestamp' exists in your database.</p>";
    }
}

// --- 5. التحقق من صلاحية الأدمن عند الدخول ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                const adminNameEl = document.getElementById("adminName");
                if(adminNameEl) adminNameEl.innerText = "Admin: " + (userDoc.data().displayName || "User");
                showSection('products'); // البداية بالمنتجات
            } else { 
                window.location.href = "login.html"; 
            }
        } catch (e) { window.location.href = "login.html"; }
    } else { 
        window.location.href = "login.html"; 
    }
});

// دوال إغلاق المودال
window.closeModals = () => {
    document.getElementById("productModal").style.display = "none";
    document.getElementById("categoryModal").style.display = "none";
};