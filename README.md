# Inventory Hub - Smart Inventory & Order Management System

Welcome to **Inventory Hub**, a comprehensive, modern, and highly responsive web application built to streamline inventory tracking, order management, and overall business operations.

##  Overview
Inventory Hub is designed to help businesses manage their products, track inventory levels, monitor orders, and log user activities in real-time. With a beautiful light-themed UI, smooth animations, and robust functionality, it ensures a seamless user experience across all devices.

---

##  Technology Stack
- **Frontend Framework:** Next.js (App Router, React 19)
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS (v4), Global CSS Variables
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Authentication:** NextAuth.js (v5) + bcryptjs
- **Database:** MongoDB with Mongoose
- **Notifications & Alerts:** React Hot Toast, SweetAlert2
- **Date Formatting:** date-fns

---

##  Features Implemented

Here are the key features that have been successfully developed and integrated into the system:

### 1. Robust Authentication & Security
- Secure User Registration and Login.
- Password hashing using `bcryptjs`.
- Session management and route protection via **NextAuth v5**.

### 2. Comprehensive DashboardOverview
- Real-time data aggregation (Total Products, Total Orders, etc.).
- Intuitive metrics display.
- **Activity Logging:** Automated tracking of user actions (e.g., adding a product, updating an order) directly visible on the dashboard.

### 3. Product Management (`/products`)
- Full CRUD (Create, Read, Update, Delete) operations for inventory items.
- Dynamic data tables for viewing products safely.
- Categorization and stock tracking per product.

### 4. Category Management (`/categories`)
- Ability to organize products effectively.
- Add, edit, and delete product categories.

### 5. Order Management (`/orders`)
- Track incoming and outgoing orders seamlessly.
- Manage order statuses and link orders directly to existing inventory.

### 6. Restock Management (`/restock`)
- Keep track of low-inventory parameters.
- Handle restocking logs to ensure items never run out of stock unexpectedly.

### 7. Premium UI/UX & Responsive Design
- **Fully Responsive:** Beautiful layouts that adapt seamlessly to mobile, tablet, and desktop viewports.
- **Sidebar Navigation:** Collapsible hamburger menu on mobile for a clean experience.
- **Micro-Animations:** Fluid transitions and component mounting animations powered by Framer Motion.
- **Modern Aesthetics:** Clean, light-themed interface utilizing Lato fonts.
- **Interactive Feedback:** Action confirmations and error handling handled gracefully by SweetAlert2 and Hot Toast.

---

##  Future Roadmap (Upcoming Features)

While the core of Inventory Hub is fully functional, here is what can be done in the future to scale the application to the next level:

- [ ] **Role-Based Access Control (RBAC):** Introduce distinct roles (Admin, Manager, Staff) with granular permissions.
- [ ] **Data Exporting (PDF/Excel):** Allow users to export product lists, inventory reports, and order histories.
- [ ] **Advanced Analytics & Charts:** Integrate charting libraries (e.g., Recharts) for visual sales trends, profit margins, and inventory value over time.
- [ ] **Low Stock Alerts:** Automated email or SMS notifications when product stock falls below a predefined threshold.
- [ ] **Multi-Warehouse Support:** Ability to track and transfer inventory across different physical store or warehouse locations.
- [ ] **Point of Sale (POS) Integration:** A dedicated POS interface for quick in-person checkout and barcode scanning support.
- [ ] **Supplier Management:** Track suppliers, generate purchase orders, and manage vendor relationships.

---

##  Getting Started (Local Development)

To run the project locally on your machine:

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your MongoDB URI, NextAuth secret, etc.
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

