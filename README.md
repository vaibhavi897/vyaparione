# VyapariOne

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?logo=mongodb&logoColor=white)

VyapariOne is a full-stack smart retail management system designed to help small and mid-sized businesses monitor inventory, track sales, and forecast demand with data-driven insights. The project combines a modern React frontend with a secure Express and MongoDB backend to deliver a practical, recruiter-friendly solution for real-world retail operations.

## 1. Project Overview

VyapariOne provides an end-to-end inventory intelligence experience for teams managing stock, sales, and replenishment decisions. It gives users a centralized dashboard for:

- Monitoring inventory levels and low-stock items
- Recording and reviewing sales activity
- Analyzing revenue trends and product performance
- Forecasting future demand using a weighted moving average model
- Restricting sensitive operations to authorized admin users

This project is built to demonstrate strong full-stack engineering practices, clean API design, role-based authentication, and real-world business logic.

## 2. Business Motivation

Inventory mismanagement is a recurring challenge in retail and service operations. Stockouts, over-ordering, and delayed replenishment often lead to lost revenue and customer dissatisfaction. VyapariOne was inspired by solving a real problem in this space: helping teams make better inventory decisions using simple, explainable forecasting instead of relying entirely on manual judgment.

The project reflects a realistic business need similar to the challenges faced in retail, grocery, pharmacy, and service-based environments where stock visibility matters every day.

## 3. Key Features

- Secure authentication with JWT-based login
- Role-based access control for admin and staff users
- Inventory dashboard with live stock insights
- Product management with add, edit, and delete operations
- Sales tracking and revenue analytics
- Demand forecasting using a Weighted Moving Average model
- Risk classification for products nearing depletion
- Reorder recommendations for critical stock items
- Responsive and modern UI built with React and Vite

## 4. Tech Stack

| Layer       | Technologies                                               |
| ----------- | ---------------------------------------------------------- |
| Frontend    | React, Vite, React Router, Axios, Recharts, React Toastify |
| Backend     | Node.js, Express.js, JWT, bcryptjs                         |
| Database    | MongoDB with Mongoose                                      |
| Environment | dotenv                                                     |
| Tooling     | ESLint, Nodemon                                            |

## 5. System Architecture

Frontend → Backend → Database

1. The React frontend sends API requests to the Express backend.
2. The backend validates requests, enforces authentication and authorization, and performs business logic.
3. MongoDB stores users, products, and sales records.
4. Forecasting logic uses sales history from the database to generate demand insights.

## 6. Folder Structure

```text
smart-retail-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers for auth, dashboard, products, sales, forecasting
│   │   ├── database/         # Database connection setup
│   │   ├── middleware/       # JWT auth and admin-only access control
│   │   ├── models/           # Mongoose schemas for User, Product, and Sale
│   │   ├── routes/           # API route definitions
│   │   ├── seeds/            # Demo seed data for development
│   │   └── utils/            # Helper utilities such as token generation
│   ├── package.json
│   └── seed.js
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context for global state
│   │   ├── layouts/          # Shared layout wrappers
│   │   ├── pages/            # Dashboard, products, sales, forecast, login views
│   │   ├── services/         # API service modules
│   │   └── assets/           # Static assets and images
│   └── package.json
├── README.md
├── .env.example
└── LICENSE
```

## 7. Database Collections

| Collection | Purpose                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------- |
| Users      | Stores user profiles, hashed passwords, and role information (`admin` or `staff`)        |
| Products   | Stores inventory items, stock quantity, threshold, category, price, and supplier             |
| Sales      | Stores sales transactions, quantity sold, revenue value, and related product/user references |

## 8. Authentication & Authorization Flow

1. A user logs in with email and password.
2. The backend validates credentials and returns a JWT.
3. The frontend sends the token in the `Authorization` header for protected routes.
4. The backend verifies the token in the auth middleware.
5. Admin-only routes such as forecasting and product/sales management are additionally guarded by role checks.

## 9. Forecasting Module

The forecasting module uses a Weighted Moving Average (WMA) approach to estimate future demand based on recent sales history.

- Recent months are assigned higher weights
- The model calculates an expected demand value per product
- The system then estimates stock depletion time and flags risk levels
- High-risk items trigger reorder recommendations

This provides a simple yet effective forecasting layer suitable for early-stage retail intelligence systems.

## 10. API Overview

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Authenticate a user and return a JWT

### Dashboard

- `GET /api/dashboard/stats` — Retrieve inventory and sales summary metrics
- `GET /api/dashboard/analytics` — Retrieve revenue and product analytics

### Products

- `GET /api/products` — List all products
- `POST /api/products` — Create a new product (admin only)
- `PUT /api/products/:id` — Update a product (admin only)
- `DELETE /api/products/:id` — Delete a product (admin only)

### Sales

- `POST /api/sales` — Record a sale (admin only)
- `GET /api/sales` — Retrieve sales history

### Forecasting

- `GET /api/forecast` — Retrieve forecast insights and reorder recommendations (admin only)

## 11. Installation Guide

### Prerequisites

- Node.js 18 or later
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn

## 12. Project Setup

1. Clone the repository
2. Install backend dependencies
3. Install frontend dependencies
4. Create your environment file
5. Start MongoDB
6. Optionally seed the database with sample data if you want demo records
7. Run backend and frontend servers

## 13. Environment Variables

Create a `.env` file in the backend folder based on the provided example.

### Setup Instructions

1. Copy the example file: `cp .env.example .env`
2. Rename it to `.env` if your system does not already create the file
3. Replace placeholder values with your actual MongoDB URI, JWT secret, and client URL
4. Keep secrets local and never commit them to Git

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

## 14. How to Run the Project

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your actual values
# Optional: run the seed entry point if you want demo data
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically run at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 15. Sample Login Credentials

If you use the included demo seed entry point, the following sample accounts are available:

- Admin: `admin@vyaparione.com` / `admin123`
- Staff: `staff@vyaparione.com` / `staff123`

> These credentials are intended for local development and should be changed before deploying to production.

## 16. Future Roadmap

Planned enhancements include:

- AI-powered demand forecasting
- LLM-based business insights and recommendations
- RAG-based knowledge retrieval for retail operations
- Advanced forecasting models such as exponential smoothing and Prophet-style approaches
- Multi-store and multi-warehouse support
- Real-time alerts for low stock and sudden demand spikes

## 17. Security Features

- Password hashing with `bcryptjs`
- JSON Web Token authentication
- Protected API routes
- Admin-only access for sensitive operations
- CORS configuration for local frontend access

## 18. Screenshots

Screenshot placeholders will be added here as the project grows:

- Dashboard overview
- Inventory management view
- Sales analytics view
- Forecast and reorder insights

## 19. Contributing

Contributions are welcome. If you would like to improve VyapariOne, please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request with a clear description

## 20. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.