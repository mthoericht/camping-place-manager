import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';
import type { CampingPlaceServer } from '@/lib/types';

// Re-export as CampingPlace for backward compatibility
export type { CampingPlaceServer as CampingPlace };

/**
 * Service class for camping place-related operations
 */
export class CampingPlaceService 
{
  /**
   * Get all camping places
   */
  static async getCampingPlaces(): Promise<CampingPlaceServer[]> 
  {
    try 
    {
      const campingPlacesResult = await prisma.$runCommandRaw({
        find: 'camping_places',
        sort: { createdAt: -1 }
      });
      
      const campingPlaces = (campingPlacesResult.cursor as any)?.firstBatch || [];
      
      // Map MongoDB _id to id for each camping place
      const mappedCampingPlaces = campingPlaces.map((place: any): CampingPlaceServer => ({
        ...place,
        id: MongoDbHelper.extractObjectId(place._id),
        createdAt: MongoDbHelper.parseMongoDate(place.createdAt),
        updatedAt: MongoDbHelper.parseMongoDate(place.updatedAt),
      }));
      
      return mappedCampingPlaces;
    }
    catch (error) 
    {
      console.error('Error fetching camping places:', error);
      return [];
    }
  }

  /**
   * Get a single camping place by ID with bookings
   */
  static async getCampingPlace(id: string): Promise<CampingPlaceServer | null> 
  {
    try 
    {
      const campingPlaceResult = await prisma.$runCommandRaw({
        find: 'camping_places',
        filter: { _id: MongoDbHelper.toObjectId(id) },
      });

      const campingPlace = (campingPlaceResult.cursor as any)?.firstBatch?.[0];

      if (!campingPlace) 
      {
        return null;
      }

      // Get bookings for this camping place
      const bookingsResult = await prisma.$runCommandRaw({
        find: 'bookings',
        filter: { campingPlaceId: MongoDbHelper.toObjectId(id) },
        sort: { createdAt: -1 },
      });

      const bookings = (bookingsResult.cursor as any)?.firstBatch || [];

      // Map MongoDB _id to id and include bookings
      const mappedCampingPlace: CampingPlaceServer = {
        ...campingPlace,
        id: MongoDbHelper.extractObjectId(campingPlace._id),
        createdAt: MongoDbHelper.parseMongoDate(campingPlace.createdAt),
        updatedAt: MongoDbHelper.parseMongoDate(campingPlace.updatedAt),
        bookings: bookings.map((booking: any) => ({
          ...booking,
          id: MongoDbHelper.extractObjectId(booking._id),
        })),
      };

      return mappedCampingPlace;
    }
    catch (error) 
    {
      console.error('Error fetching camping place:', error);
      return null;
    }
  }

  /**
   * Create a new camping place
   */
  static async createCampingPlace(data: {
    name: string;
    description?: string;
    location: string;
    size: number;
    price: number;
    amenities?: string[];
    isActive?: boolean;
  }): Promise<CampingPlaceServer | null> 
  {
    try 
    {
      const insertResult = await prisma.$runCommandRaw({
        insert: 'camping_places',
        documents: [{
          name: data.name,
          description: data.description || '',
          location: data.location,
          size: parseInt(String(data.size)),
          price: parseFloat(String(data.price)),
          amenities: data.amenities || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: MongoDbHelper.createMongoDate(),
          updatedAt: MongoDbHelper.createMongoDate(),
        }]
      });

      // Get the inserted document
      const insertedIds = (insertResult as any).insertedIds || (insertResult as any).inserted;
      const insertedId = Array.isArray(insertedIds) ? insertedIds[0] : insertedIds;
      const id = MongoDbHelper.extractObjectId(insertedId);
      
      // Fetch the created camping place
      return await this.getCampingPlace(id);
    }
    catch (error) 
    {
      console.error('Error creating camping place:', error);
      throw error;
    }
  }

  /**
   * Update an existing camping place
   */
  static async updateCampingPlace(
    id: string,
    data: {
      name?: string;
      description?: string;
      location?: string;
      size?: number;
      price?: number;
      amenities?: string[];
      isActive?: boolean;
    }
  ): Promise<CampingPlaceServer | null> 
  {
    try 
    {
      const updateData: any = {
        updatedAt: MongoDbHelper.createMongoDate(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.size !== undefined) updateData.size = parseInt(String(data.size));
      if (data.price !== undefined) updateData.price = parseFloat(String(data.price));
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await prisma.$runCommandRaw({
        update: 'camping_places',
        updates: [
          {
            q: { _id: MongoDbHelper.toObjectId(id) },
            u: { $set: updateData },
          },
        ],
      });

      // Fetch the updated camping place
      return await this.getCampingPlace(id);
    }
    catch (error) 
    {
      console.error('Error updating camping place:', error);
      throw error;
    }
  }

  /**
   * Delete a camping place
   */
  static async deleteCampingPlace(id: string): Promise<boolean> 
  {
    try 
    {
      const deleteResult = await prisma.$runCommandRaw({
        delete: 'camping_places',
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
      console.error('Error deleting camping place:', error);
      throw error;
    }
  }
}

