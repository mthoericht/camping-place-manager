import { Page } from '@playwright/test';

/**
 * Test helper utilities for e2e tests
 * 
 * IMPORTANT: All test data MUST use the "TEST_" prefix to ensure:
 * 1. Test data can be easily identified and cleaned up
 * 2. Production data is never accidentally modified or deleted
 * 3. Tests can run safely without breaking the database
 * 
 * Usage:
 * - Use testName('My Item') instead of 'My Item'
 * - Use testEmail('user@example.com') instead of 'user@example.com'
 * - Always call cleanupTestData() after tests that create data
 */

const TEST_PREFIX = 'TEST_';

/**
 * Clean up all test data from the database
 * This should be called after tests to remove test data
 */
export async function cleanupTestData(page: Page): Promise<void> 
{
  try 
  {
    // IMPORTANT: Cleanup order matters due to foreign key relationships
    // 1. Delete bookings first (they reference camping places and items)
    // 2. Then delete camping places (they may have bookings)
    // 3. Finally delete camping items (they may be referenced by bookings)
    
    // Step 1: Clean up test bookings (this will cascade delete booking items)
    const bookingsResponse = await page.request.get('http://localhost:3000/api/bookings');
    if (bookingsResponse.ok()) 
    {
      const bookings = await bookingsResponse.json();
      const testBookings = bookings.filter((b: any) => 
        b.customerName?.startsWith(TEST_PREFIX) || 
        b.customerEmail?.startsWith(TEST_PREFIX) ||
        b.campingPlace?.name?.startsWith(TEST_PREFIX)
      );
      
      for (const booking of testBookings) 
      {
        try 
        {
          await page.request.delete(`http://localhost:3000/api/bookings/${booking.id}`);
        } 
        catch (error) 
        {
          console.warn(`Failed to delete booking ${booking.id}:`, error);
        }
      }
    }

    // Step 2: Clean up test camping places
    const placesResponse = await page.request.get('http://localhost:3000/api/camping-places');
    if (placesResponse.ok()) 
    {
      const places = await placesResponse.json();
      const testPlaces = places.filter((p: any) => p.name?.startsWith(TEST_PREFIX));
      
      for (const place of testPlaces) 
      {
        try 
        {
          await page.request.delete(`http://localhost:3000/api/camping-places/${place.id}`);
        } 
        catch (error) 
        {
          console.warn(`Failed to delete camping place ${place.id}:`, error);
        }
      }
    }

    // Step 3: Clean up test camping items
    const itemsResponse = await page.request.get('http://localhost:3000/api/camping-items');
    if (itemsResponse.ok()) 
    {
      const items = await itemsResponse.json();
      const testItems = items.filter((i: any) => i.name?.startsWith(TEST_PREFIX));
      
      for (const item of testItems) 
      {
        try 
        {
          await page.request.delete(`http://localhost:3000/api/camping-items/${item.id}`);
        } 
        catch (error) 
        {
          console.warn(`Failed to delete camping item ${item.id}:`, error);
        }
      }
    }
  } 
  catch (error) 
  {
    console.warn('Error cleaning up test data:', error);
    // Don't fail tests if cleanup fails
  }
}

/**
 * Generate a test name with prefix
 */
export function testName(name: string): string 
{
  return `${TEST_PREFIX}${name}`;
}

/**
 * Generate a test email with prefix
 */
export function testEmail(email: string): string 
{
  const localPart = email.split('@')[0];
  const domain = email.includes('@') ? email.split('@')[1] : 'test.com';
  return `${TEST_PREFIX}${localPart}@${domain}`;
}

/**
 * Check if a string is test data
 */
export function isTestData(value: string): boolean 
{
  return value.startsWith(TEST_PREFIX);
}

