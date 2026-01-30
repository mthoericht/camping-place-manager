import 'server-only';
import { prisma } from '@/lib/server/prisma';
import { MongoDbHelper } from '@/lib/server/MongoDbHelper';
import type { CampingItemServer } from '@/lib/shared/types';

// Re-export as CampingItem for backward compatibility
export type { CampingItemServer as CampingItem };

/**
 * Service class for camping item-related operations
 */
export class CampingItemService 
{
  /**
   * Get all camping items
   */
  static async getCampingItems(): Promise<CampingItemServer[]> 
  {
    try 
    {
      const campingItemsResult = await prisma.$runCommandRaw({
        find: 'camping_items',
        sort: { createdAt: -1 }
      });
      
      const campingItems = (campingItemsResult.cursor as any)?.firstBatch || [];
      
      // Map MongoDB _id to id for each camping item
      const mappedCampingItems = campingItems.map((item: any): CampingItemServer => ({
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
  static async getCampingItem(id: string): Promise<CampingItemServer | null> 
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
      const mappedCampingItem: CampingItemServer = {
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

  /**
   * Create a new camping item
   */
  static async createCampingItem(data: {
    name: string;
    category: string;
    size: number;
    description?: string;
    isActive?: boolean;
  }): Promise<CampingItemServer | null> 
  {
    try 
    {
      const id = MongoDbHelper.createObjectId();
      await prisma.$runCommandRaw({
        insert: 'camping_items',
        documents: [{
          _id: MongoDbHelper.toObjectId(id),
          name: data.name,
          category: data.category,
          size: parseInt(String(data.size)),
          description: data.description || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: MongoDbHelper.createMongoDate(),
          updatedAt: MongoDbHelper.createMongoDate()
        }]
      });

      return await this.getCampingItem(id);
    }
    catch (error) 
    {
      console.error('Error creating camping item:', error);
      throw error;
    }
  }

  /**
   * Update an existing camping item
   */
  static async updateCampingItem(
    id: string,
    data: {
      name?: string;
      category?: string;
      size?: number;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<CampingItemServer | null> 
  {
    try 
    {
      const updateData: any = {
        updatedAt: MongoDbHelper.createMongoDate(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.size !== undefined) updateData.size = parseInt(String(data.size));
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await prisma.$runCommandRaw({
        update: 'camping_items',
        updates: [
          {
            q: { _id: MongoDbHelper.toObjectId(id) },
            u: { $set: updateData },
          },
        ],
      });

      // Fetch the updated camping item
      return await this.getCampingItem(id);
    }
    catch (error) 
    {
      console.error('Error updating camping item:', error);
      throw error;
    }
  }

  /**
   * Delete a camping item
   */
  static async deleteCampingItem(id: string): Promise<boolean> 
  {
    try 
    {
      const deleteResult = await prisma.$runCommandRaw({
        delete: 'camping_items',
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
      console.error('Error deleting camping item:', error);
      throw error;
    }
  }
}

