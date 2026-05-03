# Electric ERP

A modern Enterprise Resource Planning (ERP) system designed for electrical inventory management, featuring tracked items, vendor balances, comprehensive reports, and a real-time dashboard.

## Features

### 📊 Dashboard
- Real-time financial overview with total sales, costs, profit, and current stock
- Recent transactions with receipt tracking
- Filterable by time range (today, 7 days, 30 days, all time)

### 📦 Inventory Management (Store)
- Create and manage electrical items with categories
- Support for two inventory modes:
  - **Tracked by IDs**: Individual item tracking (e.g., serial numbers 001, 002, 003)
  - **Bulk quantity**: Standard quantity-based tracking
- Product image support

### 🛒 Purchase Management (Buy)
- Record purchases with batch tracking
- Support for payment methods: Bank or Credit
- Supplier credit management
- Receipt tracking for audit purposes

### 💰 Sales Management (Sell)
- Sell items by ID (tracked mode) or quantity (bulk mode)
- Batch selection with remaining quantity display
- Profit calculation per sale
- Receipt tracking

### 📈 Reports
- **Item Reports**: Detailed buy/sell history per product
- **Transaction History**: All transactions with filtering
- **Finance Reports**: Balance and credit movement reports
- Filterable by product, date range, and account type

### 💳 Balance & Credit
- Track cash balance and supplier credit
- Vendor credit management with payment functionality
- Manual finance entries (in/out)
- Stock value calculation
- Net position overview (Balance + Stock - Credit)

### 🌍 Multi-language Support
- English
- Amharic (አማርኛ)

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js 5** - REST API framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

## Project Structure

```
electric-erp/
├── src/                    # Frontend Next.js application
│   ├── app/               # App Router pages
│   │   ├── dashboard/     # Financial dashboard
│   │   ├── store/         # Inventory management
│   │   ├── buy/           # Purchase management
│   │   ├── sell/          # Sales management
│   │   ├── balance/       # Balance & credit management
│   │   └── reports/       # Reports and analytics
│   ├── components/        # Reusable UI components
│   └── lib/               # Utilities, Redux store, API client, i18n
├── server/                # Backend Express API
│   ├── controllers/       # Route controllers
│   ├── routes/            # API route definitions
│   ├── db.js             # PostgreSQL connection
│   ├── schema.js         # Database schema
│   └── index.js          # Server entry point
└── public/               # Static assets
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/buy` - Record purchase
- `POST /api/products/:id/sell` - Record sale

### Finance
- `GET /api/finance/summary` - Get balance and credit summary
- `GET /api/finance/reports` - Get finance reports
- `GET /api/finance/vendor-credits` - Get supplier credits
- `POST /api/finance/entry` - Create finance entry
- `POST /api/finance/pay-credit` - Pay supplier credit

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Transactions
- `GET /api/transactions` - Get transaction history

### Reports
- `GET /api/item-reports` - Get item buy/sell reports

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/petrosasmamaw/adiss-electric-erp.git
cd electric-erp
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Configure environment variables:

Create `.env` file in the `server/` directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/electric_erp
API_PORT=4000
```

5. Create the PostgreSQL database:
```sql
CREATE DATABASE electric_erp;
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```
The API will be available at `http://localhost:4000`

2. In a new terminal, start the frontend:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

## Database Schema

The application uses the following main tables:
- **products** - Product/item definitions
- **product_batches** - Batch tracking for inventory
- **item_reports** - Detailed buy/sell records per item
- **transactions** - Transaction history
- **finance_accounts** - Balance and credit tracking
- **finance_reports** - Finance movement records
- **supplier_credits** - Vendor credit balances

## Currency

The application uses Ethiopian Birr (Rs) as the default currency.

## License

Private - All rights reserved

## Support

For issues and questions, please contact the development team.