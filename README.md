# Camping Place Manager

A modern camping place management application built with Next.js, React, TypeScript, MongoDB, and Prisma.

## Features

- 🏕️ **Camping Place Management**: Add, edit, and manage camping places
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
   - Make a test booking
   - View analytics dashboard

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── camping-places/    # Camping places pages
│   ├── bookings/          # Bookings pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
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
