import { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import { cleanupTestData } from './test-helpers';

/**
 * Global teardown to clean up all test data after all tests complete
 */
async function globalTeardown(config: FullConfig) 
{
  console.log('Cleaning up test data...');
  
  try 
  {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await cleanupTestData(page);
    
    await context.close();
    await browser.close();
    
    console.log('Test data cleanup completed.');
  } 
  catch (error) 
  {
    console.warn('Error during global teardown:', error);
    // Don't fail the test run if cleanup fails
  }
}

export default globalTeardown;

