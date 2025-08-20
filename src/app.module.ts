import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SearchModule } from './search/search.module';
import { CacheModule } from "@nestjs/cache-manager";
import { CacheableMemory } from "cacheable";
import { createKeyv } from "@keyv/redis";
import { Keyv } from "keyv";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SearchModule,
  ],
})
export class AppModule {}