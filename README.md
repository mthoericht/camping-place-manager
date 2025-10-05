# Camping Place Manager

A modern camping place management application built with Next.js, React, TypeScript, MongoDB, and Prisma.

## Features

- 🏕️ **Camping Place Management**: Add, edit, and manage camping places
- 🎒 **Camping Items Management**: Manage camping equipment and items inventory
- 📅 **Booking System**: Handle customer bookings and reservations
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🗄️ **Database**: MongoDB with Prisma ORM for data management
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **ORM**: Prisma
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mthoericht/camping-place-manager.git
cd camping-place-manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. Update the `DATABASE_URL` in `.env.local` with your MongoDB connection string:

```
DATABASE_URL="mongodb://localhost:27017/camping-place-manager"
```

5. Generate Prisma client:

```bash
npm run db:generate
```

6. Push the database schema:

```bash
npm run db:push
```

7. Start MongoDB service:

```bash
npm run mongo:start
```

8. Start the development server:

```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### CampingPlace

- `id`: Unique identifier
- `name`: Name of the camping place
- `description`: Description of the place
- `location`: Location/address
- `capacity`: Maximum number of guests
- `price`: Price per night
- `amenities`: Array of available amenities
- `images`: Array of image URLs
- `isActive`: Whether the place is available for booking
- `createdAt`/`updatedAt`: Timestamps

### CampingItem

- `id`: Unique identifier
- `name`: Name of the camping item
- `category`: Item category (Tent, Van, Trailer, Pavillon/Awning, etc.)
- `size`: Size in square meters
- `description`: Description of the item
- `isActive`: Whether the item is available for booking
- `createdAt`/`updatedAt`: Timestamps

### Booking

- `id`: Unique identifier
- `campingPlaceId`: Reference to camping place
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `customerPhone`: Customer's phone (optional)
- `startDate`/`endDate`: Booking dates
- `guests`: Number of guests
- `totalPrice`: Total booking price
- `status`: Booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `notes`: Additional notes
- `createdAt`/`updatedAt`: Timestamps

### BookingItem

- `id`: Unique identifier
- `bookingId`: Reference to booking
- `campingItemId`: Reference to camping item
- `quantity`: Number of items booked
- `createdAt`/`updatedAt`: Timestamps

## Camping Items Management

The camping items management system allows you to maintain an inventory of camping equipment and items that can be rented out to customers.

### Features

- **Add Items**: Create new camping items with name, category, size, and description
- **Edit Items**: Update existing item details and availability status
- **Delete Items**: Remove items from inventory with confirmation
- **View Details**: Detailed view of individual camping items
- **Category Management**: Predefined categories including Tent, Van, Trailer, Pavillon/Awning
- **Status Tracking**: Mark items as active/inactive for availability

### Available Categories

- Tent
- Van
- Trailer
- Pavillon/Awning

### Navigation

Access camping items management through:
- Main navigation bar: "Camping Items"
- Homepage dashboard: "Manage Items" card
- Direct URL: `/camping-items`

## Available Scripts

### Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Database Management

- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open Prisma Studio

### MongoDB Management

- `npm run mongo:start`: Start MongoDB service
- `npm run mongo:stop`: Stop MongoDB service
- `npm run mongo:status`: Check MongoDB service status

## Quick Start Guide

1. **Clone and install:**

   ```bash
   git clone https://github.com/mthoericht/camping-place-manager.git
   cd camping-place-manager
   npm install
   ```

2. **Set up environment:**

   ```bash
   # Create .env.local with your MongoDB connection
   echo 'DATABASE_URL="mongodb://localhost:27017/camping-place-manager"' > .env.local
   ```

3. **Start services:**

   ```bash
   npm run mongo:start    # Start MongoDB
   npm run db:push        # Sync database schema
   npm run dev           # Start development server
   ```

4. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create your first camping place
   - Add camping items to your inventory
   - Make a test booking
   - View analytics dashboard

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── camping-items/ # Camping items API endpoints
│   │   ├── camping-places/# Camping places API endpoints
│   │   └── bookings/      # Bookings API endpoints
│   ├── camping-items/     # Camping items management pages
│   ├── camping-places/    # Camping places pages
│   ├── bookings/          # Bookings pages
│   ├── analytics/         # Analytics dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── CampingItemForm.tsx# Camping item form component
│   ├── CampingPlaceForm.tsx# Camping place form component
│   └── BookingForm.tsx    # Booking form component
└── lib/                   # Utility functions
    └── prisma.ts          # Prisma client setup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
