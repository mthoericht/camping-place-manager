import { MongoDbHelper } from './MongoDbHelper';

describe('MongoDbHelper', () => 
{
  describe('parseMongoDate', () => 
  {
    it('should parse MongoDB $date object format', () => 
    {
      const mongoDate = { $date: '2024-01-15T10:30:00.000Z' };
      const result = MongoDbHelper.parseMongoDate(mongoDate);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should parse JavaScript Date instance', () => 
    {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = MongoDbHelper.parseMongoDate(date);
      expect(result).toBe(date.toISOString());
    });

    it('should return string as-is if already a string', () => 
    {
      const dateString = '2024-01-15T10:30:00.000Z';
      const result = MongoDbHelper.parseMongoDate(dateString);
      expect(result).toBe(dateString);
    });

    it('should return empty string for null or undefined', () => 
    {
      expect(MongoDbHelper.parseMongoDate(null)).toBe('');
      expect(MongoDbHelper.parseMongoDate(undefined)).toBe('');
    });

    it('should return empty string for invalid input', () => 
    {
      expect(MongoDbHelper.parseMongoDate({})).toBe('');
      expect(MongoDbHelper.parseMongoDate(123)).toBe('');
    });
  });

  describe('extractObjectId', () => 
  {
    it('should extract ObjectId from MongoDB $oid format', () => 
    {
      const mongoId = { $oid: '507f1f77bcf86cd799439011' };
      const result = MongoDbHelper.extractObjectId(mongoId);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should return string as-is if already a string', () => 
    {
      const stringId = '507f1f77bcf86cd799439011';
      const result = MongoDbHelper.extractObjectId(stringId);
      expect(result).toBe(stringId);
    });

    it('should convert other types to string', () => 
    {
      expect(MongoDbHelper.extractObjectId(123)).toBe('123');
      expect(MongoDbHelper.extractObjectId(null)).toBe('');
    });

    it('should handle null or undefined', () => 
    {
      expect(MongoDbHelper.extractObjectId(null)).toBe('');
      expect(MongoDbHelper.extractObjectId(undefined)).toBe('');
    });
  });

  describe('toObjectId', () => 
  {
    it('should convert string ID to MongoDB ObjectId format', () => 
    {
      const id = '507f1f77bcf86cd799439011';
      const result = MongoDbHelper.toObjectId(id);
      expect(result).toEqual({ $oid: '507f1f77bcf86cd799439011' });
    });
  });

  describe('mapDocument', () => 
  {
    it('should map MongoDB document _id to id field', () => 
    {
      const document = {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        name: 'Test',
        value: 123,
      };
      const result = MongoDbHelper.mapDocument(document);
      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.name).toBe('Test');
      expect(result.value).toBe(123);
    });

    it('should handle string _id', () => 
    {
      const document = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test',
      };
      const result = MongoDbHelper.mapDocument(document);
      expect(result.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('mapDocuments', () => 
  {
    it('should map array of MongoDB documents', () => 
    {
      const documents = [
        { _id: { $oid: '507f1f77bcf86cd799439011' }, name: 'Test1' },
        { _id: { $oid: '507f1f77bcf86cd799439012' }, name: 'Test2' },
      ];
      const result = MongoDbHelper.mapDocuments(documents);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[1].id).toBe('507f1f77bcf86cd799439012');
    });
  });

  describe('extractCampingPlaceId', () => 
  {
    it('should extract campingPlaceId from $oid format', () => 
    {
      const booking = {
        campingPlaceId: { $oid: '507f1f77bcf86cd799439011' },
      };
      const result = MongoDbHelper.extractCampingPlaceId(booking);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should extract campingPlaceId from string format', () => 
    {
      const booking = {
        campingPlaceId: '507f1f77bcf86cd799439011',
      };
      const result = MongoDbHelper.extractCampingPlaceId(booking);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle missing campingPlaceId', () => 
    {
      const booking = {};
      const result = MongoDbHelper.extractCampingPlaceId(booking);
      expect(result).toBe('');
    });
  });

  describe('extractCampingItemId', () => 
  {
    it('should extract campingItemId from $oid format', () => 
    {
      const item = {
        campingItemId: { $oid: '507f1f77bcf86cd799439011' },
      };
      const result = MongoDbHelper.extractCampingItemId(item);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should extract campingItemId from string format', () => 
    {
      const item = {
        campingItemId: '507f1f77bcf86cd799439011',
      };
      const result = MongoDbHelper.extractCampingItemId(item);
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle missing campingItemId', () => 
    {
      const item = {};
      const result = MongoDbHelper.extractCampingItemId(item);
      expect(result).toBe('');
    });
  });

  describe('createMongoDate', () => 
  {
    it('should create MongoDB date object from Date instance', () => 
    {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = MongoDbHelper.createMongoDate(date);
      expect(result).toEqual({ $date: date.toISOString() });
    });

    it('should create MongoDB date object with current date if no date provided', () => 
    {
      const result = MongoDbHelper.createMongoDate();
      expect(result).toHaveProperty('$date');
      expect(typeof result.$date).toBe('string');
      expect(new Date(result.$date).getTime()).toBeCloseTo(Date.now(), -3);
    });
  });
});

