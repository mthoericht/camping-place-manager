import { prisma } from '@/lib/prisma';
import { MongoDbHelper } from '@/lib/MongoDbHelper';

export interface CampingItem {
  id: string;
  name: string;
  category: string;
  size: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service class for camping item-related operations
 */
export class CampingItemService 
{
  /**
   * Get all camping items
   */
  static async getCampingItems(): Promise<CampingItem[]> 
  {
    try 
    {
      const campingItemsResult = await prisma.$runCommandRaw({
        find: 'camping_items',
        sort: { createdAt: -1 }
      });
      
      const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];
      
      // Map MongoDB _id to id for each camping item
      const mappedCampingItems = campingItems.map((item: any): CampingItem => ({
        ...item,
        id: MongoDbHelper.extractObjectId(item._id),
        createdAt: MongoDbHelper.parseMongoDate(item.createdAt),
        updatedAt: MongoDbHelper.parseMongoDate(item.updatedAt),
      }));
      
      return mappedCampingItems;
    }
    catch (error) 
    {
      console.error('Error fetching camping items:', error);
      return [];
    }
  }

  /**
   * Get a single camping item by ID
   */
  static async getCampingItem(id: string): Promise<CampingItem | null> 
  {
    try 
    {
      const campingItemResult = await prisma.$runCommandRaw({
        find: 'camping_items',
        filter: { _id: MongoDbHelper.toObjectId(id) },
      });

      const campingItem = (campingItemResult.cursor as any)?.firstBatch?.[0];

      if (!campingItem) 
      {
        return null;
      }

      // Map MongoDB _id to id
      const mappedCampingItem: CampingItem = {
        ...campingItem,
        id: MongoDbHelper.extractObjectId(campingItem._id),
        createdAt: MongoDbHelper.parseMongoDate(campingItem.createdAt),
        updatedAt: MongoDbHelper.parseMongoDate(campingItem.updatedAt),
      };

      return mappedCampingItem;
    }
    catch (error) 
    {
      console.error('Error fetching camping item:', error);
      return null;
    }
  }
}

