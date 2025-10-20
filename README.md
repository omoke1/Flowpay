# FlowPay - Business Payments on Flow

A professional payment platform built on the Flow blockchain, enabling businesses to accept crypto payments with ease.

## 🚀 Features

- **Flow Blockchain Integration** - Accept USDC.e and FLOW token payments
- **Payment Links** - Create shareable payment links for products/services
- **Real-time Dashboard** - Track payments, analytics, and revenue
- **Mobile Responsive** - Works seamlessly on all devices
- **User Authentication** - Flow wallet integration with email registration
- **Notification System** - Real-time payment confirmations
- **Settings Management** - API keys, webhooks, and preferences

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Flow Client Library (FCL)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Flow blockchain, Transak integration
- **Email**: Resend API
- **Deployment**: Vercel-ready

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/omoke1/Flowpay.git
   cd flowpay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Flow Blockchain
   NEXT_PUBLIC_FLOW_NETWORK=testnet
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   
   # Transak (Optional)
   NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_api_key
   TRANSAK_API_SECRET=your_transak_secret
   NEXT_PUBLIC_TRANSAK_ENV=STAGING
   
   # Email (Optional)
   RESEND_API_KEY=your_resend_api_key
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up database**
   - Create a Supabase project
   - Run the SQL migration: `supabase-setup.sql`
   - Configure Row Level Security (RLS)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Connect Wallet** - Use Flow Port or external wallet
2. **Create Payment Link** - Set amount, description, and payment methods
3. **Share Link** - Send to customers for payments
4. **Track Payments** - Monitor in real-time dashboard
5. **Manage Settings** - Configure API keys and preferences

## 🔧 API Endpoints

- `POST /api/payment-links` - Create payment link
- `GET /api/payment-links` - List payment links
- `PATCH /api/payment-links/[id]` - Update payment link
- `DELETE /api/payment-links/[id]` - Delete payment link
- `POST /api/payments` - Record payment
- `GET /api/payments` - List payments
- `POST /api/transak/create-order` - Create Transak order
- `POST /api/transak/webhook` - Handle Transak webhooks

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **Railway**: Connect GitHub repo and set env vars
- **Render**: Connect GitHub repo and set env vars

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- API key rotation and session management
- Webhook signature verification
- Input validation and sanitization

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@flowpay.app or create an issue on GitHub.

---

Built with ❤️ for the Flow ecosystem