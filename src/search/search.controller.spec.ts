import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  beforeEach(async () => {
    const mockSearchService = {
      searchByAddress: jest.fn(),
      searchByPair: jest.fn(),
      searchByName: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();
    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  describe('findByAddress', () => {
    it('should call searchService.searchByAddress with correct params and return its result', async () => {
      const network = 'eth';
      const address = '0x123';
      const expected = { data: 'test-address' };
      (searchService.searchByAddress as jest.Mock).mockResolvedValue(expected);
      const result = await controller.findByAddress(network, address);
      expect(searchService.searchByAddress).toHaveBeenCalledWith(network, address);
      expect(result).toBe(expected);
    });
  });

  describe('findByPair', () => {
    it('should call searchService.searchByPair with correct params and return its result', async () => {
      const params = { network: 'eth', q: 'pair', base: 'tokenA', quote: 'tokenB' };
      const expected = { data: 'test-pair' };
      (searchService.searchByPair as jest.Mock).mockResolvedValue(expected);
      const result = await controller.findByPair(params.network, params.q, params.base, params.quote);
      expect(searchService.searchByPair).toHaveBeenCalledWith(params);
      expect(result).toBe(expected);
    });
  });

  describe('findByName', () => {
    it('should call searchService.searchByName with correct params and return its result', async () => {
      const network = 'eth';
      const q = 'uniswap';
      const expected = { data: 'test-name' };
      (searchService.searchByName as jest.Mock).mockResolvedValue(expected);
      const result = await controller.findByName(network, q);
      expect(searchService.searchByName).toHaveBeenCalledWith(network, q);
      expect(result).toBe(expected);
    });
  });
});
