import { IsOptional, IsString } from 'class-validator';

export class QueryDto {
    @IsString()
    q: string;
}

export class PairQueryDto {
    @IsOptional() @IsString() q?: string;
    @IsOptional() @IsString() base?: string;
    @IsOptional() @IsString() quote?: string;
}