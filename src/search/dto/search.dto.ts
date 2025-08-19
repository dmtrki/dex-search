import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
    @IsString()
    @ApiPropertyOptional({ description: 'Search query (token name)' })
    q: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Blockchain network (eth, bsc, sol, etc.)' })
    network?: string;
}

export class PairQueryDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Search query like ETH/USDC' })
    q?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Base token symbol' })
    base?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Quote token symbol' })
    quote?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Blockchain network (eth, bsc, sol, etc.)' })
    network?: string;
}