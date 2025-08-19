import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { PairQueryDto, QueryDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get('address/:network/:address')
    @ApiParam({ name: 'network', description: 'Blockchain network (eth, bsc, sol, etc.)' })
    @ApiParam({ name: 'address', description: 'Token address' })
    findByAddress(@Param('network') network: string, @Param('address') address: string) {
        // GeckoTerminal-style: svc.searchByAddress(network, address)
        return this.searchService.searchByAddress(network, address);
    }

    @Get('pair')
    @ApiQuery({ name: 'q', required: false, description: 'Pair string like ETH/USDC' })
    @ApiQuery({ name: 'base', required: false, description: 'Base token symbol' })
    @ApiQuery({ name: 'quote', required: false, description: 'Quote token symbol' })
    @ApiQuery({ name: 'network', required: false, description: 'Blockchain network (eth, bsc, sol, etc.)' })
    findByPair(@Query() q: PairQueryDto) {
        // Передаём network вместе с q/base/quote
        return this.searchService.searchByPair(q);
    }

    @Get('name')
    @ApiQuery({ name: 'q', required: true, description: 'Token name query' })
    @ApiQuery({ name: 'network', required: false, description: 'Blockchain network (eth, bsc, sol, etc.)' })
    findByName(@Query() q: QueryDto) {
        // GeckoTerminal-style: svc.searchByName(network, q)
        return this.searchService.searchByName(q.network, q.q);
    }
}