import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { PairQueryDto, QueryDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}
    @Get('address/:network/:address')
    findByAddress(@Param('network') network: string, @Param('address') address: string) {
        return this.searchService.searchByAddress(network, address);
    }

    @Get('pair')
    findByPair(@Query('network') network: string, @Query('q') q?: string, @Query('base') base?: string, @Query('quote') quote?: string) {
        return this.searchService.searchByPair({ network, q, base, quote });
    }

    @Get('name')
    findByName(@Query('network') network: string, @Query('q') q: string) {
        return this.searchService.searchByName(network, q);
    }
}