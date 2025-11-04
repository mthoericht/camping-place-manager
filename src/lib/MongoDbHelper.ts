/**
 * Helper class for MongoDB-specific operations
 */
export class MongoDbHelper 
{
  /**
   * Parse MongoDB date format to ISO string
   * Handles various MongoDB date formats: $date objects, Date instances, and strings
   */
  static parseMongoDate(date: any): string 
  {
    if (!date) return '';
    
    if (date.$date) 
    {
      return date.$date;
    }
    if (date instanceof Date) 
    {
      return date.toISOString();
    }
    if (typeof date === 'string') 
    {
      return date;
    }
    return '';
  }

  /**
   * Extract ObjectId from MongoDB document
   * Handles both ObjectId objects and string IDs
   */
  static extractObjectId(id: any): string 
  {
    if (!id) return '';
    if (typeof id === 'object' && id.$oid) 
    {
      return id.$oid;
    }
    if (typeof id === 'string') 
    {
      return id;
    }
    return String(id);
  }

  /**
   * Convert ObjectId to MongoDB query format
   */
  static toObjectId(id: string): { $oid: string } 
  {
    return { $oid: id };
  }

  /**
   * Map MongoDB document _id to id field
   */
  static mapDocument<T extends { _id?: any }>(document: T): T & { id: string } 
  {
    return {
      ...document,
      id: this.extractObjectId(document._id),
    };
  }

  /**
   * Map array of MongoDB documents to have id field
   */
  static mapDocuments<T extends { _id?: any }>(documents: T[]): (T & { id: string })[] 
  {
    return documents.map((doc) => this.mapDocument(doc));
  }

  /**
   * Extract campingPlaceId from booking document
   * Handles both ObjectId objects and string IDs
   */
  static extractCampingPlaceId(booking: any): string 
  {
    if (booking.campingPlaceId?.$oid) 
    {
      return booking.campingPlaceId.$oid;
    }
    if (typeof booking.campingPlaceId === 'string') 
    {
      return booking.campingPlaceId;
    }
    return String(booking.campingPlaceId || '');
  }

  /**
   * Extract campingItemId from booking item document
   * Handles both ObjectId objects and string IDs
   */
  static extractCampingItemId(item: any): string 
  {
    if (typeof item.campingItemId === 'object' && item.campingItemId.$oid) 
    {
      return item.campingItemId.$oid;
    }
    if (typeof item.campingItemId === 'string') 
    {
      return item.campingItemId;
    }
    return String(item.campingItemId || '');
  }

  /**
   * Create MongoDB date object for insertion/updates
   */
  static createMongoDate(date?: Date): { $date: string } 
  {
    const dateToUse = date || new Date();
    return { $date: dateToUse.toISOString() };
  }
}

