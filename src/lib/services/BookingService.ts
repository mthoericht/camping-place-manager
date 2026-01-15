import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';
import type { BookingServer, BookingWithDetails } from '@/lib/types';

// Re-export as Booking for backward compatibility
export type { BookingServer as Booking, BookingWithDetails };

/**
 * Service class for booking-related operations
 */
export class BookingService 
{
  /**
   * Get all bookings with camping place information
   */
  static async getBookings(): Promise<BookingServer[]> 
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
      const mappedBookings = bookings.map((booking: any): BookingServer => 
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
        filter: { bookingId: MongoDbHelper.toObjectId(id) },
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
            bookingId: MongoDbHelper.extractBookingId(item),
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
   * Create a new booking
   */
  static async createBooking(data: {
    campingPlaceId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    startDate: string;
    endDate: string;
    guests: number;
    notes?: string;
    campingItems?: { [key: string]: number };
  }): Promise<BookingWithDetails | null> 
  {
    try 
    {
      // Get camping place to calculate price
      const campingPlaceResult = await prisma.$runCommandRaw({
        find: 'camping_places',
        filter: { _id: MongoDbHelper.toObjectId(data.campingPlaceId) },
      });

      const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];

      if (!campingPlace) 
      {
        throw new Error('Camping place not found');
      }

      // Validate camping items size
      if (data.campingItems) 
      {
        let totalSize = 0;
        const itemIds = Object.keys(data.campingItems);
        
        if (itemIds.length > 0) 
        {
          const campingItemsResult = await prisma.$runCommandRaw({
            find: 'camping_items',
            filter: { _id: { $in: itemIds.map(id => MongoDbHelper.toObjectId(id)) } },
          });

          const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];
          
          for (const [itemId, quantity] of Object.entries(data.campingItems)) 
          {
            const item = campingItems.find((ci: any) => 
              MongoDbHelper.extractObjectId(ci._id) === itemId
            );
            if (item) 
            {
              totalSize += item.size * (quantity as number);
            }
          }

          if (totalSize > campingPlace.size) 
          {
            throw new Error(
              `Total camping items size (${totalSize} m²) exceeds camping place size (${campingPlace.size} m²)`
            );
          }
        }
      }

      // Calculate total price
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * campingPlace.price;

      // Create booking
      const insertResult = await prisma.$runCommandRaw({
        insert: 'bookings',
        documents: [{
          campingPlaceId: MongoDbHelper.toObjectId(data.campingPlaceId),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || null,
          startDate: MongoDbHelper.createMongoDate(start),
          endDate: MongoDbHelper.createMongoDate(end),
          guests: parseInt(String(data.guests)),
          totalPrice,
          status: 'PENDING',
          notes: data.notes || null,
          createdAt: MongoDbHelper.createMongoDate(),
          updatedAt: MongoDbHelper.createMongoDate(),
        }]
      });

      // Get the inserted booking ID
      const insertedIds = (insertResult as any).insertedIds || (insertResult as any).inserted;
      const insertedId = Array.isArray(insertedIds) ? insertedIds[0] : insertedIds;
      const bookingId = MongoDbHelper.extractObjectId(insertedId);

      // Create booking items if provided
      if (data.campingItems && Object.keys(data.campingItems).length > 0) 
      {
        const itemsToCreate = Object.entries(data.campingItems).map(([itemId, quantity]) => ({
          bookingId: MongoDbHelper.toObjectId(bookingId),
          campingItemId: MongoDbHelper.toObjectId(itemId),
          quantity: quantity as number,
          createdAt: MongoDbHelper.createMongoDate(),
          updatedAt: MongoDbHelper.createMongoDate(),
        }));

        await prisma.$runCommandRaw({
          insert: 'booking_items',
          documents: itemsToCreate,
        });
      }

      // Fetch the created booking with all details
      return await this.getBooking(bookingId);
    }
    catch (error) 
    {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  static async updateBooking(
    id: string,
    data: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      startDate?: string;
      endDate?: string;
      guests?: number;
      status?: string;
      notes?: string;
      campingItems?: { [key: string]: number };
    }
  ): Promise<BookingWithDetails | null> 
  {
    try 
    {
      // First, delete existing booking items
      await prisma.$runCommandRaw({
        delete: 'booking_items',
        deletes: [{ q: { bookingId: MongoDbHelper.toObjectId(id) }, limit: 0 }],
      });

      // Update the booking
      const updateData: any = {
        updatedAt: MongoDbHelper.createMongoDate(),
      };

      if (data.customerName !== undefined) updateData.customerName = data.customerName;
      if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
      if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone || null;
      if (data.startDate) updateData.startDate = MongoDbHelper.createMongoDate(new Date(data.startDate));
      if (data.endDate) updateData.endDate = MongoDbHelper.createMongoDate(new Date(data.endDate));
      if (data.guests !== undefined) updateData.guests = parseInt(String(data.guests));
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      await prisma.$runCommandRaw({
        update: 'bookings',
        updates: [{ q: { _id: MongoDbHelper.toObjectId(id) }, u: { $set: updateData } }],
      });

      // Create new booking items if provided
      if (data.campingItems && Object.keys(data.campingItems).length > 0) 
      {
        const itemsToCreate = Object.entries(data.campingItems).map(([itemId, quantity]) => ({
          bookingId: MongoDbHelper.toObjectId(id),
          campingItemId: MongoDbHelper.toObjectId(itemId),
          quantity: quantity as number,
          createdAt: MongoDbHelper.createMongoDate(),
          updatedAt: MongoDbHelper.createMongoDate(),
        }));

        await prisma.$runCommandRaw({
          insert: 'booking_items',
          documents: itemsToCreate,
        });
      }

      // Fetch the updated booking with all details
      return await this.getBooking(id);
    }
    catch (error) 
    {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(id: string): Promise<boolean> 
  {
    try 
    {
      // First delete booking items
      await prisma.$runCommandRaw({
        delete: 'booking_items',
        deletes: [{ q: { bookingId: MongoDbHelper.toObjectId(id) }, limit: 0 }],
      });

      // Then delete the booking
      const deleteResult = await prisma.$runCommandRaw({
        delete: 'bookings',
        deletes: [
          {
            q: { _id: MongoDbHelper.toObjectId(id) },
            limit: 1
          }
        ]
      });

      const deletedCount = (deleteResult as any).deletedCount || (deleteResult as any).n;
      return deletedCount > 0;
    }
    catch (error) 
    {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

