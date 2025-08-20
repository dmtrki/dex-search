import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import {HttpModule} from "@nestjs/axios";
import {CacheModule} from "@nestjs/cache-manager";
import {Keyv} from "keyv";
import {CacheableMemory} from "cacheable";
import {createKeyv} from "@keyv/redis";

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
