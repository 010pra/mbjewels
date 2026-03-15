// MB Jewels — admin.js (Firebase Integration)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAdb93Xt_iML-n5OsUrQOSxrz2ClkMIewM",
    authDomain: "mbjewels-e2502.firebaseapp.com",
    projectId: "mbjewels-e2502",
    storageBucket: "mbjewels-e2502.firebasestorage.app",
    messagingSenderId: "313753132085",
    appId: "1:313753132085:web:9e39d510b33e647039257c",
    measurementId: "G-9D1JMQV9JD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const seedBtn = document.getElementById('seed-btn');
const errorMsg = document.getElementById('login-error');
const addProductForm = document.getElementById('add-product-form');
const btnAddProduct = document.getElementById('btn-add-product');
const productsTbody = document.getElementById('products-tbody');

// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadProducts();
    } else {
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    errorMsg.textContent = 'Logging in...';

    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            console.error("Login Error:", error.code);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMsg.textContent = "Invalid email or password. Please check your credentials.";
            } else if (error.code === 'auth/user-not-found') {
                errorMsg.textContent = "Admin user not found. Did you create it in Firebase?";
            } else {
                errorMsg.textContent = "Login failed: " + error.message;
            }
        });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// --- SEED MOCK DATA ---
const mockProducts = [
    { name: "Lakshmi Gaja Necklace Set", price: 4850, category: "necklaces", description: "Antique-finish temple design with ruby & emerald stones. Gajalakshmi pendant with elephant motifs and pearl drops.", imageUrl: "assets/necklace.png", visible: true, createdAt: Date.now() },
    { name: "Peacock Temple Jhumkas", price: 1820, category: "earrings", description: "Intricate peacock design with antique finish, multi-coloured stones and delicate pearl drops.", imageUrl: "assets/earrings.png", visible: true, createdAt: Date.now() + 10 },
    { name: "Nakshi Temple Bangle Set", price: 3200, category: "bangles", description: "Set of 4 bangles with intricate nakshi work, Lakshmi motif and coloured stone inlays.", imageUrl: "assets/bangles.png", visible: true, createdAt: Date.now() + 20 },
    { name: "Lakshmi Chandramauli Tikka", price: 2480, category: "maangtikka", description: "Grand Lakshmi centre with peacock side motifs, ruby-emerald-pearl drops.", imageUrl: "assets/maangtikka.png", visible: true, createdAt: Date.now() + 30 }
];

seedBtn.addEventListener('click', async () => {
    if (!confirm("This will add the 4 original products to your website. Proceed?")) return;
    seedBtn.disabled = true;
    seedBtn.textContent = "Seeding...";
    try {
        for (const p of mockProducts) {
            await addDoc(collection(db, "products"), p);
        }
        alert("Mock data added! Refreshing list...");
        loadProducts();
    } catch (err) {
        alert("Failed to seed: " + err.message);
    } finally {
        seedBtn.disabled = false;
        seedBtn.textContent = "Load Mock Data";
    }
});

// --- LOAD PRODUCTS ---
async function loadProducts() {
    productsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Loading products from server...</td></tr>';
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        productsTbody.innerHTML = '';

        if (querySnapshot.empty) {
            productsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No products found. Add one above!</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const id = docSnap.id;
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><img src="${p.imageUrl}" class="tbl-img" style="object-fit:cover;"></td>
                <td style="font-weight:600;">${p.name}<br><small style="color:#888;">${p.category}</small></td>
                <td>₹${p.price}</td>
                <td><span class="badge ${p.visible ? 'active' : 'hidden'}">${p.visible ? 'Visible' : 'Hidden'}</span></td>
                <td>
                    <button class="btn-edit toggle-vis-btn" data-id="${id}" data-visible="${p.visible}">Toggle</button>
                    <button class="btn-edit delete-btn" data-id="${id}" style="color:red; border-color:red; margin-left:0.5rem;">Delete</button>
                </td>
            `;
            productsTbody.appendChild(tr);
        });

        document.querySelectorAll('.toggle-vis-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const isVis = e.target.getAttribute('data-visible') === 'true';
                e.target.textContent = '...';
                await updateDoc(doc(db, "products", id), { visible: !isVis });
                loadProducts();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    e.target.textContent = '...';
                    await deleteDoc(doc(db, "products", id));
                    loadProducts();
                }
            });
        });

    } catch (err) {
        console.error("Error loading products:", err);
        productsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load properties. Check permissions.</td></tr>';
    }
}

// --- ADD PRODUCT ---
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('prod-image').files[0];
    if (!file) return alert('Please select an image.');

    btnAddProduct.disabled = true;
    btnAddProduct.textContent = "Uploading Image...";

    const name = document.getElementById('prod-name').value;
    const price = document.getElementById('prod-price').value;
    const category = document.getElementById('prod-category').value;
    const desc = document.getElementById('prod-desc').value;
    const isVisible = document.getElementById('prod-visible').checked;

    try {
        const storageRef = ref(storage, 'products/' + Date.now() + '_' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                btnAddProduct.textContent = `Uploading... ${Math.round(progress)}%`;
            },
            (error) => {
                console.error(error);
                alert("Error uploading image: " + error.message);
                btnAddProduct.disabled = false;
                btnAddProduct.textContent = "Add Product";
            },
            async () => {
                btnAddProduct.textContent = "Saving to Database...";
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                await addDoc(collection(db, "products"), {
                    name: name,
                    price: price,
                    category: category,
                    description: desc,
                    imageUrl: downloadURL,
                    visible: isVisible,
                    createdAt: Date.now()
                });

                addProductForm.reset();
                btnAddProduct.disabled = false;
                btnAddProduct.textContent = "Add Product";
                alert("Product added successfully!");
                loadProducts();
            }
        );
    } catch (err) {
        console.error(err);
        alert("Action failed. Check Firebase settings.");
        btnAddProduct.disabled = false;
        btnAddProduct.textContent = "Add Product";
    }
});
