import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

type GtResource = { id: string; type: string; attributes: Record<string, any> };
type GtResponse = { data: GtResource[] | GtResource; included?: GtResource[] };

@Injectable()
export class SearchService {
    private readonly base = 'https://api.geckoterminal.com/api/v2';
    private readonly ttl = Number(process.env.CACHE_TTL_SECONDS ?? 60);

    constructor(
        private readonly http: HttpService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    /** 1) По адресу токена */
    async searchByAddress(network: string, address: string) {
        if (!network || !address) throw new BadRequestException('network/address required');
        const key = `gt:addr:${network}:${address.toLowerCase()}`;
        const cached = await this.cache.get(key);
        if (cached) return cached;

        const url = `${this.base}/networks/${encodeURIComponent(network)}/tokens/${encodeURIComponent(address)}/pools`;
        const { data } = await firstValueFrom(this.http.get<GtResponse>(url));

        const result = this.mapPools(data);
        await this.cache.set(key, result, this.ttl);
        return result;
    }

    /** 2) По торговой паре (строкой "ETH/USDC" или base/quote), с фильтром по сети */
    async searchByPair({ network, q, base, quote }: { network?: string; q?: string; base?: string; quote?: string }) {
        const query = q || [base, quote].filter(Boolean).join('/');
        if (!query) throw new BadRequestException('q or base/quote required');
        const key = `gt:pair:${network || 'any'}:${query}`;
        const cached = await this.cache.get(key);
        if (cached) return cached;

        const url = `${this.base}/search/pools?query=${encodeURIComponent(query)}`;
        const { data } = await firstValueFrom(this.http.get<GtResponse>(url));

        let pools = this.mapPools(data);
        if (network) pools = pools.filter(p => (p.blockchain || '').toLowerCase() === network.toLowerCase());

        // Доп. фильтр на точное совпадение symbols при base/quote
        if (base || quote) {
            pools = pools.filter(p => {
                const b = p.baseToken?.symbol?.toUpperCase();
                const qsym = p.quoteToken?.symbol?.toUpperCase();
                return (!base || b === base!.toUpperCase()) && (!quote || qsym === quote!.toUpperCase());
            });
        }

        await this.cache.set(key, pools, this.ttl);
        return pools;
    }

    async searchByName(network: string | undefined, q: string) {
        if (!q) throw new BadRequestException('q required');
        const key = `gt:name:${network || 'any'}:${q.toLowerCase()}`;
        const cached = await this.cache.get(key);
        if (cached) return cached;

        const url = `${this.base}/search/pools?query=${encodeURIComponent(q)}`;
        const { data } = await firstValueFrom(this.http.get<GtResponse>(url));

        let pools = this.mapPools(data);
        if (network) pools = pools.filter(p => (p.blockchain || '').toLowerCase() === network.toLowerCase());

        await this.cache.set(key, pools, this.ttl);
        return pools;
    }

    private mapPools(resp: GtResponse) {
        const data = Array.isArray(resp.data) ? resp.data : [resp.data];
        const included = resp.included || [];

        const byId = new Map(included.map(r => [r.id, r]));

        return data
            .filter(Boolean)
            .map(resource => {
                const a = resource.attributes || {};
                const baseTok = this.pickToken(byId, a.base_token_id);
                const quoteTok = this.pickToken(byId, a.quote_token_id);

                return {
                    blockchain: String(a.network_id || '').toUpperCase(),
                    dex: String(a.dex_id || '').toUpperCase(),
                    pairAddress: a.address || resource.id,
                    baseToken: baseTok && { address: baseTok.attributes?.address, name: baseTok.attributes?.name, symbol: baseTok.attributes?.symbol },
                    quoteToken: quoteTok && { address: quoteTok.attributes?.address, name: quoteTok.attributes?.name, symbol: quoteTok.attributes?.symbol },
                    liquidity: {
                        usd: a.liquidity_usd ?? null,
                        base: a.base_token_liquidity ?? null,
                        quote: a.quote_token_liquidity ?? null,
                    },
                    volume24h: a.volume_usd?.h24 ?? a.volume_usd ?? null,
                    mcap: a.market_cap_usd ?? a.fdv_usd ?? null,
                    pairCreatedAt: a.created_at ? Date.parse(a.created_at) : null,
                    trades24h: (a.transactions?.h24?.buys ?? 0) + (a.transactions?.h24?.sells ?? 0),
                    usdPrice: a.price_in_usd != null ? String(a.price_in_usd) : '',
                    priceInBaseToken: a.base_token_price_quote_token ?? null,
                    priceChangePercent24h: a.price_change_percentage?.h24 ?? null,
                    logo: baseTok?.attributes?.image_url || quoteTok?.attributes?.image_url || null,
                    socials: this.mergeSocials(baseTok, quoteTok),
                };
            });
    }

    private pickToken(byId: Map<string, GtResource>, id?: string) {
        if (!id) return undefined;
        const r = byId.get(id);
        return r?.type?.includes('token') ? r : undefined;
    }

    private mergeSocials(b?: GtResource, q?: GtResource) {
        const s1 = b?.attributes?.socials || [];
        const s2 = q?.attributes?.socials || [];
        return [...s1, ...s2].map((s: any) => ({ type: s.type, url: s.url })).slice(0, 10);
    }
}