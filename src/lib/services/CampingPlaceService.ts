import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

export interface CampingPlace {
  id: string;
  name: string;
  description: string;
  location: string;
  size: number;
  price: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bookings?: any[];
}

/**
 * Service class for camping place-related operations
 */
export class CampingPlaceService 
{
  /**
   * Get all camping places
   */
  static async getCampingPlaces(): Promise<CampingPlace[]> 
  {
    try 
    {
      const campingPlacesResult = await prisma.$runCommandRaw({
        find: 'camping_places',
        sort: { createdAt: -1 }
      });
      
      const campingPlaces = (campingPlacesResult.cursor as any)?.firstBatch || [];
      
      // Map MongoDB _id to id for each camping place
      const mappedCampingPlaces = campingPlaces.map((place: any): CampingPlace => ({
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
  static async getCampingPlace(id: string): Promise<CampingPlace | null> 
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
      const mappedCampingPlace: CampingPlace = {
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
}

