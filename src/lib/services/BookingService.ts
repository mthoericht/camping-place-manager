import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

export interface Booking {
  id: string;
  campingPlaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  campingPlace?: {
    id: string;
    name: string;
    location: string;
  };
}

export interface BookingWithDetails extends Omit<Booking, 'startDate' | 'endDate'> {
  startDate: string | { $date: string };
  endDate: string | { $date: string };
  campingPlace: {
    id: string;
    name: string;
    description: string;
    location: string;
    size: number;
    price: number;
    amenities: string[];
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
  };
  bookingItems?: Array<{
    id: string;
    bookingId: string;
    campingItemId: string;
    quantity: number;
    campingItem?: {
      id: string;
      name: string;
      category: string;
      size: number;
      description: string;
    };
  }>;
}

/**
 * Service class for booking-related operations
 */
export class BookingService 
{
  /**
   * Get all bookings with camping place information
   */
  static async getBookings(): Promise<Booking[]> 
  {
    try 
    {
      const bookingsResult = await prisma.$runCommandRaw({
        find: 'bookings',
        sort: { createdAt: -1 }
      });
      
      const bookings = (bookingsResult.cursor as any)?.firstBatch || [];
      
      // Get all camping places to map them to bookings
      const placesResult = await prisma.$runCommandRaw({
        find: 'camping_places'
      });
      const campingPlaces = (placesResult.cursor as any)?.firstBatch || [];
      const placesMap = new Map(
        campingPlaces.map((place: any) => [
          MongoDbHelper.extractObjectId(place._id),
          {
            id: MongoDbHelper.extractObjectId(place._id),
            name: place.name,
            location: place.location
          }
        ])
      );
      
      // Map MongoDB _id to id and include camping place data
      const mappedBookings = bookings.map((booking: any): Booking => 
      {
        const campingPlaceId = MongoDbHelper.extractCampingPlaceId(booking);
        const campingPlace = campingPlaceId ? placesMap.get(campingPlaceId) : undefined;
        
        return {
          id: MongoDbHelper.extractObjectId(booking._id),
          campingPlaceId: campingPlaceId,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          startDate: MongoDbHelper.parseMongoDate(booking.startDate),
          endDate: MongoDbHelper.parseMongoDate(booking.endDate),
          guests: booking.guests,
          totalPrice: booking.totalPrice,
          status: booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
          notes: booking.notes,
          createdAt: MongoDbHelper.parseMongoDate(booking.createdAt),
          updatedAt: MongoDbHelper.parseMongoDate(booking.updatedAt),
          campingPlace: campingPlace as { id: string; name: string; location: string } | undefined
        };
      });
      
      return mappedBookings;
    }
    catch (error) 
    {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  /**
   * Get a single booking by ID with all related data
   */
  static async getBooking(id: string): Promise<BookingWithDetails | null> 
  {
    try 
    {
      const bookingResult = await prisma.$runCommandRaw({
        find: 'bookings',
        filter: { _id: MongoDbHelper.toObjectId(id) },
      });

      const booking = (bookingResult.cursor as any)?.firstBatch?.[0];

      if (!booking) 
      {
        return null;
      }

      // Get camping place
      const campingPlaceId = MongoDbHelper.extractCampingPlaceId(booking);
      const campingPlaceResult = await prisma.$runCommandRaw({
        find: 'camping_places',
        filter: { _id: MongoDbHelper.toObjectId(campingPlaceId) },
      });

      const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];

      // Get booking items
      const bookingItemsResult = await prisma.$runCommandRaw({
        find: 'booking_items',
        filter: { bookingId: id },
      });

      const bookingItems = (bookingItemsResult.cursor as any)?.firstBatch || [];

      let bookingItemsWithCampingItems = [];

      if (bookingItems.length > 0) 
      {
        // Get camping items for these booking items
        const campingItemIds = bookingItems.map((item: any) => 
          MongoDbHelper.extractCampingItemId(item)
        );

        const campingItemsResult = await prisma.$runCommandRaw({
          find: 'camping_items',
          filter: { _id: { $in: campingItemIds.map((id: string) => MongoDbHelper.toObjectId(id)) } },
        });

        const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];

        // Transform the data
        bookingItemsWithCampingItems = bookingItems.map((item: any) => 
        {
          const itemCampingItemId = MongoDbHelper.extractCampingItemId(item);
          
          const campingItem = campingItems.find((ci: any) => 
          {
            const ciId = MongoDbHelper.extractObjectId(ci._id);
            return ciId === itemCampingItemId;
          });

          return {
            id: MongoDbHelper.extractObjectId(item._id),
            bookingId: item.bookingId,
            campingItemId: itemCampingItemId,
            quantity: item.quantity,
            campingItem: campingItem ? {
              id: MongoDbHelper.extractObjectId(campingItem._id),
              name: campingItem.name,
              category: campingItem.category,
              size: campingItem.size,
              description: campingItem.description
            } : undefined,
          };
        });
      }

      // Construct the final booking object
      const finalBooking: BookingWithDetails = {
        id: MongoDbHelper.extractObjectId(booking._id),
        campingPlaceId: campingPlaceId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        startDate: booking.startDate,
        endDate: booking.endDate,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
        notes: booking.notes,
        createdAt: MongoDbHelper.parseMongoDate(booking.createdAt),
        updatedAt: MongoDbHelper.parseMongoDate(booking.updatedAt),
        campingPlace: campingPlace ? {
          id: MongoDbHelper.extractObjectId(campingPlace._id),
          name: campingPlace.name,
          description: campingPlace.description,
          location: campingPlace.location,
          size: campingPlace.size,
          price: campingPlace.price,
          amenities: campingPlace.amenities,
          isActive: campingPlace.isActive,
          createdAt: campingPlace.createdAt,
          updatedAt: campingPlace.updatedAt
        } : {
          id: '',
          name: '',
          description: '',
          location: '',
          size: 0,
          price: 0,
          amenities: [],
          isActive: false,
          createdAt: '',
          updatedAt: ''
        },
        bookingItems: bookingItemsWithCampingItems
      };

      return finalBooking;
    }
    catch (error) 
    {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  /**
   * Fetch booking from API endpoint (for client-side components)
   */
  static async getBookingFromAPI(id: string): Promise<BookingWithDetails | null> 
  {
    try 
    {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/${id}`,
        { cache: 'no-store' }
      );
      
      if (!response.ok) 
      {
        return null;
      }
      
      const booking = await response.json();
      
      // Transform the booking data to match the expected format
      return {
        ...booking,
        id: booking.id,
        campingPlace: {
          ...booking.campingPlace,
          id: booking.campingPlace.id,
        },
        bookingItems: booking.bookingItems || [],
      };
    }
    catch (error) 
    {
      console.error('Error fetching booking:', error);
      return null;
    }
  }
}

