# FlowPay

**Business Payments on Flow**

Accept payments on Flow in seconds. Create links, get paid in crypto, automate your revenue.

## Features

- 🔗 Create payment links instantly
- 💰 Accept FLOW and USDC.e payments
- 📊 Track all transactions in merchant dashboard
- ✉️ Automated email receipts
- 🔐 Secure wallet authentication

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Blockchain:** Flow (Cadence), FCL SDK
- **Auth:** thirdweb
- **Database:** Supabase
- **Email:** Resend
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Flow wallet (for testnet)
- Supabase account
- Resend API key
- thirdweb client ID

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
flowpay/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Merchant dashboard
│   ├── pay/[id]/          # Checkout pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── forms/            # Form components
│   └── checkout/         # Checkout components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── flow-config.ts    # Flow FCL configuration
│   ├── flow-transactions.ts  # Flow transaction helpers
│   ├── resend.ts         # Email service
│   └── utils.ts          # General utilities
└── public/               # Static assets
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Links Table
```sql
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES users(id),
  product_name TEXT NOT NULL,
  description TEXT,
  amount TEXT NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('FLOW', 'USDC')),
  redirect_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES payment_links(id),
  payer_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  token TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paid_at TIMESTAMP DEFAULT NOW()
);
```

## Development Roadmap

- [x] Phase 1: Foundation setup
- [ ] Phase 2: Authentication & Dashboard
- [ ] Phase 3: Payment link creation
- [ ] Phase 4: Checkout & payment flow
- [ ] Phase 5: Receipts & polish

## Contributing

This is a hackathon project. Contributions welcome!

## License

MIT

---

**Built on Flow** 🌊

