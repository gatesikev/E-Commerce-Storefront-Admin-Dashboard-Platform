# Full-Stack E-Commerce Platform & Admin Dashboard

A production-grade E-Commerce solution featuring a customer-facing storefront and a secure administrative dashboard. This project implements advanced React patterns, including Role-Based Access Control (RBAC), strict schema validation, and efficient server-state management.

**Live Demo:** [View Live Site](https://e-commerce-storefront-admin-dashboa-eight.vercel.app/)

---

## 🚀 Key Features

### **Storefront (Shopper Experience)**
* **Dynamic Catalog:** Responsive grid displaying products fetched from a centralized API.
* **Shopping Cart:** Persistent global state for adding/removing items and managing quantities.
* **Secure Checkout:** Multi-step checkout process with real-time validation for shipping and payment.
* **User Profiles:** Order history tracking for authenticated shoppers.

### **Admin Dashboard (Management Experience)**
* **Inventory Control:** Full CRUD operations for products (Add, Edit, Delete).
* **Order Management:** Global view of all customer orders with the ability to update fulfillment status (Pending, Shipped, etc.).
* **Category Management:** Dynamic creation and modification of product categories.
* **Restricted Access:** Exclusive dashboard access for admin accounts using specialized route guards.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite) + TypeScript
* **Styling:** Tailwind CSS
* **State Management:** Context API (Auth/Cart) & TanStack Query (Server State)
* **Form Handling:** React Hook Form + Zod (Strict Validation)
* **Networking:** Axios (v1.14.0 - Security Compliant)
* **Routing:** React Router v6 (Protected Routes)

---

## 🔐 Administrative Credentials

To test the administrative features (Inventory & Order Management), use the following credentials:

| Role  | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@admin.com` | `admin123` |

*Note: Standard users can register via the Sign-Up page to access shopper-specific features like checkout and order history.*

---

## 🏗️ Architectural Highlights

### **1. Role-Based Authentication (RBAC)**
Implemented using a global `AuthContext` to manage user sessions. Access is controlled via specialized route wrappers:
* `<UserRoute>`: Ensures only authenticated shoppers can reach checkout.
* `<AdminRoute>`: Redirects non-admin users away from sensitive management views.

### **2. Performance Optimization**
Used **TanStack Query** for:
* Caching product catalogs and categories to reduce API overhead.
* Automatic cache invalidation (refetching) after Admin updates or product deletions.
* Managing loading and error states across the UI.

### **3. Strict Form Validation**
Leveraged **Zod** schemas to enforce business rules:
* Descriptions must be $\ge 20$ characters.
* Prices must be positive; Stock must be non-negative integers.
* Phone numbers are strictly validated via Regex: `/^\d{10}$/`.

---

## 💻 Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[gatesikev]/[E-Commerce-Storefront-Admin-Dashboard-Platform].git
    cd [E-Commerce-Storefront-Admin-Dashboard-Platform]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

---

## 📄 License
This project was developed as part of a technical assignment to demonstrate proficiency in React, TypeScript, and API integration.