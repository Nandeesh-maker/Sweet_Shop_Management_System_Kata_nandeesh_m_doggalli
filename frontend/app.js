// Fast Sweet Shop App
const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let shoppingCart = [];

// Simple utility functions
function showAlert(message, type = 'success') {
    alert(`[${type.toUpperCase()}] ${message}`);
}

function setLoading(loading) {
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = loading;
    });
}

// Fast API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(currentUser && { 'Authorization': `Bearer ${localStorage.getItem('token')}` }),
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        showAlert('Network error - check if server is running', 'error');
        throw error;
    }
}

// Auth functions
async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    if (!email || !password || !name) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    setLoading(true);
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });

        if (data.message === 'User registered successfully') {
            showAlert('Registration successful!');
            // Automatically login after registration and redirect to snacks page
            await login();
        } else {
            showAlert(data.error, 'error');
        }
    } catch (error) {
        showAlert('Registration failed', 'error');
    } finally {
        setLoading(false);
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Please enter email and password', 'error');
        return;
    }

    setLoading(true);
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert(`Welcome ${data.user.name}!`);
            // Redirect to snacks page after successful login
            window.location.href = 'snacks.html';
        } else {
            showAlert(data.error, 'error');
        }
    } catch (error) {
        showAlert('Login failed', 'error');
    } finally {
        setLoading(false);
    }
}

function logout() {
    currentUser = null;
    shoppingCart = [];
    localStorage.clear();
    showAlert('Logged out');
    // Redirect to login page after logout
    window.location.href = 'index.html';
}

// Sweet management
async function loadSweets() {
    try {
        const data = await apiCall('/sweets');
        displaySweets(data.data || data);
    } catch (error) {
        showAlert('Failed to load sweets', 'error');
    }
}

function displaySweets(sweets) {
    const container = document.getElementById('sweets-container');
    if (!sweets || sweets.length === 0) {
        container.innerHTML = '<div class="sweet-card text-center">No sweets found</div>';
        return;
    }

    container.innerHTML = sweets.map(sweet => `
        <div class="sweet-card">
            <h3>${sweet.name}</h3>
            <p>Category: ${sweet.category}</p>
            <p class="price">$${sweet.price}</p>
            <p>Stock: ${sweet.quantity}</p>
            <div class="flex gap-10">
                <button class="btn btn-primary" onclick="addToCart(${sweet.id}, '${sweet.name}', ${sweet.price}, ${sweet.quantity})" 
                        ${sweet.quantity === 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
                <button class="btn btn-success" onclick="buyNow(${sweet.id}, '${sweet.name}')" 
                        ${sweet.quantity === 0 ? 'disabled' : ''}>
                    Buy Now
                </button>
            </div>
        </div>
    `).join('');
}

async function searchSweets() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('category').value;

    const params = new URLSearchParams();
    if (search) params.append('name', search);
    if (category) params.append('category', category);

    try {
        const data = await apiCall(`/sweets/search?${params}`);
        displaySweets(data.data);
    } catch (error) {
        showAlert('Search failed', 'error');
    }
}

// Cart functions
function addToCart(sweetId, sweetName, sweetPrice, sweetQuantity) {
    if (sweetQuantity === 0) {
        showAlert('Out of stock', 'error');
        return;
    }

    const existing = shoppingCart.find(item => item.id === sweetId);
    if (existing) {
        if (existing.quantity >= sweetQuantity) {
            showAlert('Not enough stock', 'error');
            return;
        }
        existing.quantity++;
    } else {
        shoppingCart.push({ id: sweetId, name: sweetName, price: sweetPrice, quantity: 1 });
    }

    updateCartUI();
    showAlert(`${sweetName} added to cart`);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const total = document.getElementById('cart-total');

    if (shoppingCart.length === 0) {
        container.innerHTML = '<p class="text-center">Cart is empty</p>';
        total.textContent = '0.00';
        return;
    }

    container.innerHTML = shoppingCart.map(item => `
        <div class="flex justify-between items-center mb-10">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const cartTotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    total.textContent = cartTotal.toFixed(2);
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

async function checkout() {
    if (shoppingCart.length === 0) {
        showAlert('Cart is empty', 'error');
        return;
    }

    setLoading(true);
    try {
        for (const item of shoppingCart) {
            await apiCall(`/inventory/${item.id}/purchase`, {
                method: 'POST',
                body: JSON.stringify({ quantity: item.quantity })
            });
        }

        showAlert('Checkout successful!');
        shoppingCart = [];
        updateCartUI();
        toggleCart();
        await loadSweets();
    } catch (error) {
        showAlert('Checkout failed', 'error');
    } finally {
        setLoading(false);
    }
}

async function buyNow(sweetId, sweetName) {
    setLoading(true);
    try {
        await apiCall(`/inventory/${sweetId}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ quantity: 1 })
        });
        showAlert(`Purchased ${sweetName}!`);
        await loadSweets();
    } catch (error) {
        showAlert('Purchase failed', 'error');
    } finally {
        setLoading(false);
    }
}

// Admin functions
async function addSweet() {
    const name = document.getElementById('sweet-name').value;
    const category = document.getElementById('sweet-category').value;
    const price = document.getElementById('sweet-price').value;
    const quantity = document.getElementById('sweet-quantity').value;

    if (!name || !category || !price || !quantity) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    setLoading(true);
    try {
        await apiCall('/sweets', {
            method: 'POST',
            body: JSON.stringify({ name, category, price: parseFloat(price), quantity: parseInt(quantity) })
        });

        showAlert('Sweet added!');
        document.getElementById('sweet-name').value = '';
        document.getElementById('sweet-category').value = '';
        document.getElementById('sweet-price').value = '';
        document.getElementById('sweet-quantity').value = '';
        await loadSweets();
    } catch (error) {
        showAlert('Failed to add sweet', 'error');
    } finally {
        setLoading(false);
    }
}

// UI management
function updateUI() {
    const authSection = document.getElementById('auth-section');
    const userInfo = document.getElementById('user-info');
    const mainContent = document.getElementById('main-content');
    const adminSection = document.getElementById('admin-section');

    if (currentUser) {
        authSection.classList.add('hidden');
        userInfo.classList.remove('hidden');
        mainContent.classList.remove('hidden');

        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-role').textContent = currentUser.role;

        if (currentUser.role === 'admin') {
            adminSection.classList.remove('hidden');
        } else {
            adminSection.classList.add('hidden');
        }
    } else {
        authSection.classList.remove('hidden');
        userInfo.classList.add('hidden');
        mainContent.classList.add('hidden');
        adminSection.classList.add('hidden');
    }
}

// Initialize
window.onload = function() {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
        // If user is already logged in, redirect to snacks page
        window.location.href = 'snacks.html';
    }

    // Enter key support
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !document.getElementById('auth-section').classList.contains('hidden')) {
            login();
        }
    });
};
