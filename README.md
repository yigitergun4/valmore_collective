# Valmoré Collective - E-commerce Website

A modern, full-featured e-commerce website for Valmoré Collective, a curated fashion clothing store.

## Features

- 🏠 **Homepage** with hero section and featured products
- 🛍️ **Product Listing** with search, filter, and sort functionality
- 📦 **Product Detail Pages** with image gallery, size/color selection, and add to cart
- 🛒 **Shopping Cart** with quantity management and persistent storage
- 💳 **Checkout** with form validation and order confirmation
- 📱 **Responsive Design** - works seamlessly on all devices
- 🎨 **Modern UI/UX** - clean, elegant design with smooth animations

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Context API** - State management for shopping cart

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd valmore_collective
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Project Structure

```
valmore_collective/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Footer component
│   └── ProductCard.tsx    # Product card component
├── contexts/              # React contexts
│   └── CartContext.tsx    # Shopping cart state management
├── lib/                   # Utility functions
│   └── products.ts        # Product data and functions
└── types/                 # TypeScript type definitions
    └── index.ts           # Product and cart types
```

## Features in Detail

### Shopping Cart

- Add products to cart with size and color selection
- Update quantities
- Remove items
- Persistent storage using localStorage
- Cart total calculation

### Product Management

- Product listing with search functionality
- Category filtering
- Sort by name, price (low to high, high to low)
- Product detail pages with image gallery
- Size and color variants

### Checkout Process

- Shipping information form
- Payment information form
- Form validation
- Order confirmation

## Customization

### Adding Products

Edit `lib/products.ts` to add or modify products. Each product should have:

- id, name, description
- price, images, category
- sizes, colors, inStock status
- optional featured flag

### Styling

The project uses Tailwind CSS. Modify the classes in components to change the design. The main color scheme is gray/black, but you can easily customize it.

## Future Enhancements

- User authentication
- Product reviews and ratings
- Wishlist functionality
- Order history
- Payment gateway integration
- Admin dashboard
- Product inventory management
- Email notifications

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please contact info@valmorecollective.com
