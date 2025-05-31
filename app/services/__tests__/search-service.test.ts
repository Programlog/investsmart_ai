import { searchGoogleCustom } from '../search-service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('search-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_API_KEY = 'test-api-key';
    process.env.GOOGLE_CSE_ID = 'test-cse-id';
  });

  describe('searchGoogleCustom', () => {
    it('should throw an error if API key or CSE ID is missing', async () => {
      // Temporarily remove environment variables
      const originalApiKey = process.env.GOOGLE_API_KEY;
      const originalCseId = process.env.GOOGLE_CSE_ID;
      
      delete process.env.GOOGLE_API_KEY;
      delete process.env.GOOGLE_CSE_ID;
      
      await expect(searchGoogleCustom({ query: 'test' })).rejects.toThrow('Missing Google API Key or CSE ID');
      
      // Restore environment variables
      process.env.GOOGLE_API_KEY = originalApiKey;
      process.env.GOOGLE_CSE_ID = originalCseId;
    });

    it('should make a request to the Google Custom Search API', async () => {
      // Mock successful response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [
            {
              cacheId: 'item1',
              title: 'Test Result 1',
              snippet: 'This is a test result.',
              link: 'https://example.com/test1'
            },
            {
              cacheId: 'item2',
              title: 'Test Result 2',
              snippet: 'This is another test result.',
              link: 'https://investopedia.com/test2'
            }
          ]
        }
      });
      
      const results = await searchGoogleCustom({ query: 'test query' });
      
      // Verify axios was called with the correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: 'test-api-key',
            cx: 'test-cse-id',
            q: 'test query'
          }
        }
      );
      
      // Verify the results are formatted correctly
      expect(results.results).toHaveLength(2);
      expect(results.results[0]).toEqual({
        id: 'item1',
        title: 'Test Result 1',
        snippet: 'This is a test result.',
        url: 'https://example.com/test1',
        source: 'web' // Default category since example.com is not in the DOMAIN_CATEGORIES
      });
      expect(results.results[1]).toEqual({
        id: 'item2',
        title: 'Test Result 2',
        snippet: 'This is another test result.',
        url: 'https://investopedia.com/test2',
        source: 'news' // investopedia.com is categorized as news
      });
    });

    it('should include a summary when filter is "definition"', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [
            {
              cacheId: 'def1',
              title: 'Definition Result',
              snippet: 'This is a definition result.',
              link: 'https://merriam-webster.com/definition/test'
            }
          ]
        }
      });
      
      const results = await searchGoogleCustom({ query: 'test', filter: 'definition' });
      
      expect(results.summary).not.toBeNull();
      expect(results.summary).toContain('definition for "test"');
    });

    it('should return cached results if available and not expired', async () => {
      // First call to prime the cache
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [
            {
              cacheId: 'cached1',
              title: 'Cached Result',
              snippet: 'This is a cached result.',
              link: 'https://example.com/cached'
            }
          ]
        }
      });
      
      await searchGoogleCustom({ query: 'cached query' });
      
      // Reset the mock to verify it doesn't get called again
      mockedAxios.get.mockClear();
      
      // Second call with the same query should use the cache
      const cachedResults = await searchGoogleCustom({ query: 'cached query' });
      
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(cachedResults.results[0].title).toBe('Cached Result');
    });
  });
}); 