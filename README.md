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

# update in 2023-10-27
NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION=0xa7dca651e011d44363742bddfde1f72c5cec536858589b89778efc5bcdff868b
NEXT_PUBLIC_EAS_SCHEMA_VOTE=0x1654a49365e83e920d7444dc48423cf16be33f9f902dca8500d00766cb9b8fd2
NEXT_PUBLIC_EAS_SCHEMA_CLAIM=0x7cc6a5995560f61cf4f77c00facfc83f93ec3ca95aad9a57e80504efb92a438a
NEXT_PUBLIC_CONTRACT_PROJECT=0x168dEF42CdD95b574c704a7d00284e5c81514e59
NEXT_PUBLIC_CONTRACT_PROJECT_REGISTER=0xA164E14558B4665ee512cF15dD12d1a7A8492830
NEXT_PUBLIC_CONTRACT_VOTING_STRATEGY=0x13A5DfeB3E823378e379Bb59A46c5c9E19a3Fc37

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=7188673890c272bd9021dd19e64c9b7e
```

start the backend server by run `docker-compose up`


## Deploy on Vercel

 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 


## Supported by LXDAO

<a target="_blank" href="https://lxdao.io/"><img alt="Supported by LXDAO" src="https://bafkreib7wsfivsbtinvx7yfou2b556ab32pojbjutkxfhh7v3y45qkevui.ipfs.nftstorage.link/" width="180" /></a>

This is a project supported by LXDAO. More links: [LXDAO](https://lxdao.io/) | [LXDAO Forum](https://forum.lxdao.io/) | [LXDAO Discord](https://discord.lxdao.io) | [LXDAO Twitter](https://twitter.com/LXDAO_Official).

LXDAO is an R&D-focused DAO in Web3. Our mission is: Gather the power of buidlers to buidl and support “LX” (valuable) Web3 projects sustainably and welcome 1 billion users into Web3. Welcome to join us.

[![Join our Discord server!](https://invidget.switchblade.xyz/HtcDdPgJ7D)](http://discord.gg/HtcDdPgJ7D)
