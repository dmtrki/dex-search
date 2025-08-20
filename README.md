# Token Search Service
## Env
```
PORT=3000
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=60
```

## Setup
```bash
docker compose up --build -d
pnpm install
pnpm run start:dev
```

## Swagger
```
http://localhost:3000/api/docs
```

## Endpoints
### Search by address
```
GET /search/address/:network/:address
```
**Параметры**
- `network` — сеть (напр. `eth`, `bsc`, `sol`)
- `address` — адрес токена в сети

### Search by pair
```
GET /search/pair?network=eth&q=ETH/USDC
GET /search/pair?network=eth&base=ETH&quote=USDC
```
- `network` *(optional)* — фильтр по сети
- `q` *(optional)* — строка вида `BASE/QUOTE`
- `base`, `quote` *(optional)* — символы токенов

### Search by name
```
GET /search/name?network=sol&q=Chill%20Santa%20Dog
```
- `network`
- `q` — часть названия/символа токена

## Examples
```bash
curl "http://localhost:3000/search/address/sol/So11111111111111111111111111111111111111112"

curl "http://localhost:3000/search/pair?network=eth&q=ETH/USDC"

curl "http://localhost:3000/search/name?network=sol&q=Chill%20Santa%20Dog"
```

## Config
- `CACHE_TTL_SECONDS` — TTL кеша (секунды)
- `REDIS_URL` — строка подключения к Redis
- `PORT` — порт HTTP сервера
