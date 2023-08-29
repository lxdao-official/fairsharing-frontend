# FairSharing FrontEnd

## Getting Started

First, run the development server:

```bash
yarn
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.


## Proxy to Backend API
```shell
touch .env.local
```
set the following config in `.env.local`
```yaml
NEXT_PUBLIC_API_HOST_TEST=http://localhost:3001
NEXT_PUBLIC_API_HOST_PROXY=http://127.0.0.1:3000
NEXT_PUBLIC_API_BASE_URL=/fs-api
```

start the backend server by run `docker-compose up`


## Deploy on Vercel

 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 


## Supported by LXDAO

<a target="_blank" href="https://lxdao.io/"><img alt="Supported by LXDAO" src="https://bafkreib7wsfivsbtinvx7yfou2b556ab32pojbjutkxfhh7v3y45qkevui.ipfs.nftstorage.link/" width="180" /></a>

This is a project supported by LXDAO. More links: [LXDAO](https://lxdao.io/) | [LXDAO Forum](https://forum.lxdao.io/) | [LXDAO Discord](https://discord.lxdao.io) | [LXDAO Twitter](https://twitter.com/LXDAO_Official).

LXDAO is an R&D-focused DAO in Web3. Our mission is: Gather the power of buidlers to buidl and support “LX” (valuable) Web3 projects sustainably and welcome 1 billion users into Web3. Welcome to join us.

[![Join our Discord server!](https://invidget.switchblade.xyz/HtcDdPgJ7D)](http://discord.gg/HtcDdPgJ7D)
