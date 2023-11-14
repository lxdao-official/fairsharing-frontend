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
NEXT_PUBLIC_API_BASE_URL=/fs-api/

# update in 2023-11-05
NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION=0x0228657dc20f814b0770867d1a85ac473a0dc393c52603ef318bdab79dd9ea63
NEXT_PUBLIC_EAS_SCHEMA_VOTE=0xe045889447a1b5ec1e4771b23e89f38f1cf379ec2e708e1789dfbf4739cdf56f
NEXT_PUBLIC_EAS_SCHEMA_CLAIM=0x4670eabb8d0ed4d28ed4b411defaf202695497dd78f32627dd77d3a0c4c00024
# use ProjectRegisterUpgradeableProxy
NEXT_PUBLIC_CONTRACT_PROJECT_REGISTER=0x5AeA8cbF64f9Cc353E56D1EC1bEE2D49b3e4a24f
# Vote Strategy
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V1=0xCdff95c4a99c1A645D6Be65c01be027cFE8cDC26
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V2=0xD52A7eF9E7736506988c3B9b1a7Ffde451a236f7
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V1=0xE0289920f9aB0d1303e6c53CE3A124509fbe55e1
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V2=0xF919c9C0345f381de69EAA89ED20791Aca00CFcE

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=7188673890c272bd9021dd19e64c9b7e
```

start the backend server by run `docker-compose up`

## Product Environment
```shell
# update in 2023-11-14
NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION=0xc012dddde021c7258ff4671b1be08fe6b3b51d98bd0a89b43d020fafde24b476
NEXT_PUBLIC_EAS_SCHEMA_VOTE=0x2a3fe60324ed2be48cf5790d6edc7bdbc28042f7abebb81329aec640f3439a52
NEXT_PUBLIC_EAS_SCHEMA_CLAIM=0x5bf21260c46b75fe29ccc66463c2bf4cf71264da7610f52cafefa5604d30fe61
# use ProjectRegisterUpgradeableProxy
NEXT_PUBLIC_CONTRACT_PROJECT_REGISTER=0xF124Aca94e664Bfd5373feA9E2410FD799a8a08B
# Vote Strategy
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V1=0x6fCa841788F8EAd49b2a94516F275FaA5Ae08d16
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V2=0xBD13f4962C1a379DA6476Bd8d0d494c04c2E88C8

#NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V1=0xE0289920f9aB0d1303e6c53CE3A124509fbe55e1
#NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V2=0xF919c9C0345f381de69EAA89ED20791Aca00CFcE
```

## Deploy on Vercel

 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 


## Supported by LXDAO

<a target="_blank" href="https://lxdao.io/"><img alt="Supported by LXDAO" src="https://bafkreib7wsfivsbtinvx7yfou2b556ab32pojbjutkxfhh7v3y45qkevui.ipfs.nftstorage.link/" width="180" /></a>

This is a project supported by LXDAO. More links: [LXDAO](https://lxdao.io/) | [LXDAO Forum](https://forum.lxdao.io/) | [LXDAO Discord](https://discord.lxdao.io) | [LXDAO Twitter](https://twitter.com/LXDAO_Official).

LXDAO is an R&D-focused DAO in Web3. Our mission is: Gather the power of buidlers to buidl and support “LX” (valuable) Web3 projects sustainably and welcome 1 billion users into Web3. Welcome to join us.

[![Join our Discord server!](https://invidget.switchblade.xyz/HtcDdPgJ7D)](http://discord.gg/HtcDdPgJ7D)
