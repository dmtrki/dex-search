import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

class FakeCache {
  private store = new Map<string, any>();

  async get<T = any>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }
  async set<T = any>(key: string, value: T) {
    this.store.set(key, value);
  }
}

const httpGet = jest.fn();
const httpMock = { get: httpGet } as unknown as HttpService;

const pairsPayload = {
  pairs: [
    {
      chainId: 'eth',
      dexId: 'uniswap',
      pairAddress: '0xpair',
      baseToken: { address: '0xbase', name: 'Base', symbol: 'BASE' },
      quoteToken: { address: '0xquote', name: 'Quote', symbol: 'QUOTE' },
      liquidity: { usd: 1000, base: 1, quote: 1000 },
      volume: { h24: 2000 },
      fdv: 3000,
      pairCreatedAt: 1700000000000,
      txns: { h24: { buys: 5, sells: 5 } },
      priceUsd: '1',
      priceNative: '1',
      priceChange: { h24: 5 },
      info: { imageUrl: null, socials: [] },
    },
  ],
};

describe('SearchService', () => {
  let service: SearchService;
  let cache: FakeCache;

  beforeEach(async () => {
    cache = new FakeCache();
    httpGet.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: HttpService, useValue: httpMock },
        { provide: 'CACHE_MANAGER', useValue: cache },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('searchByAddress fetches and caches result', async () => {
    httpGet.mockReturnValueOnce(of({ data: pairsPayload }));

    const result1 = await service.searchByAddress('eth', '0xabc');
    expect(result1).toHaveLength(1);
    expect(httpGet).toHaveBeenCalledTimes(1);

    // second call should hit cache
    const result2 = await service.searchByAddress('eth', '0xabc');
    expect(result2).toEqual(result1);
    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('searchByName maps response correctly', async () => {
    httpGet.mockReturnValueOnce(of({ data: pairsPayload }));
    const result = await service.searchByName('eth', 'Test');
    expect(result[0]).toMatchObject({ blockchain: 'ETH', dex: 'UNISWAP' });
  });

  it('searchByPair applies base/quote filter', async () => {
    httpGet.mockReturnValueOnce(of({ data: pairsPayload }));
    const result = await service.searchByPair({ base: 'BASE', quote: 'QUOTE' } as any);
    expect(result).toHaveLength(1);
  });
});