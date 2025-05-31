import { GET } from '../route';
// Remove direct import of NextResponse if it was added

// Mock next/server
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'), // Import and retain default behavior
  NextResponse: {
    ...jest.requireActual('next/server').NextResponse,
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
      text: async () => JSON.stringify(body),
      headers: new Headers(init?.headers),
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      redirect: jest.fn(),
      clone: jest.fn(),
    })),
  },
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  ...jest.requireActual('next/cache'),
  unstable_cache: jest.fn((fn) => fn), // Mock unstable_cache to just return the function
}));

// Mock global fetch
global.fetch = jest.fn();

describe('GET /api/market/status', () => {
  beforeEach(() => {
    // Clear mock history before each test
    (jest.requireMock('next/server').NextResponse.json as jest.Mock).mockClear();
    (jest.requireMock('next/cache').unstable_cache as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockClear();
    // Reset any environment variables modified in tests
    delete process.env.FINNHUB_API_KEY;
  });

  it('should return a 200 OK response and data on success', async () => {
    process.env.FINNHUB_API_KEY = 'test_api_key';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ marketState: 'REGULAR', session: 'regular' }),
    });

    const response = await GET();

    expect(global.fetch).toHaveBeenCalledWith(
      `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=test_api_key`
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      market: 'US',
      status: 'open',
      session: 'regular',
      holiday: undefined,
    });
    expect(jest.requireMock('next/server').NextResponse.json).toHaveBeenCalledWith({
      market: 'US',
      status: 'open',
      session: 'regular',
      holiday: undefined,
    });
  });

  it('should return a 500 response if API key is missing', async () => {
    // FINNHUB_API_KEY is already deleted in beforeEach
    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: 'API key missing' });
    expect(jest.requireMock('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'API key missing' },
      { status: 500 }
    );
    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
  });

  it('should return a 500 response if fetch fails', async () => {
    process.env.FINNHUB_API_KEY = 'test_api_key';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      // status: 500, // Optional: if you want to simulate a specific error status from fetch
      // statusText: 'Internal Server Error'
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: 'Unable to load market status',
      details: 'Failed to fetch market status',
    });
    expect(jest.requireMock('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Unable to load market status', details: 'Failed to fetch market status' },
      { status: 500 }
    );
  });

  it('should return a 500 response if fetch throws an error', async () => {
    process.env.FINNHUB_API_KEY = 'test_api_key';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    const response = await GET();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: 'Unable to load market status',
      details: 'Network failure',
    });
  });

  // Add more tests for other scenarios, like fetch failures
}); 