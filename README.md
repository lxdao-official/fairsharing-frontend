# FairSharing FrontEnd

## 1. Local dev

```shell
touch .env.local
```
set the following config in `.env.local`
```yaml
NEXT_PUBLIC_API_HOST_TEST=http://localhost:3001
NEXT_PUBLIC_API_HOST_PROXY=https://api-dev.fairsharing.xyz
NEXT_PUBLIC_API_BASE_URL=/fs-api/

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=7188673890c272bd9021dd19e64c9b7e
```

```bash
yarn
yarn dev
```

Open [http://localhost:3001](http://localhost:3001)

## 2. Deploy

[Fairsharing deployment on vercel](https://vercel.com/lxdao/fairsharing)

### 2.1 Test Environment
Push latest commit to `develop` branch, everything is ok!

### 2.2 Product Environment

1、Set the following `Environment Variables` on vercel
```yaml
# schema
NEXT_PUBLIC_EAS_SCHEMA_CONTRIBUTION
NEXT_PUBLIC_EAS_SCHEMA_VOTE
NEXT_PUBLIC_EAS_SCHEMA_CLAIM

# project register contract
NEXT_PUBLIC_CONTRACT_PROJECT_REGISTER

# vote strategy
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V1
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_RELATIVE_V2
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V1
NEXT_PUBLIC_CONTRACT_VOTE_STRATEGY_ABSOLUTE_V2
```

2. Merge request to `main` branch, wait for the build result.
## Supported by LXDAO

<a target="_blank" href="https://lxdao.io/"><img alt="Supported by LXDAO" src="https://bafkreib7wsfivsbtinvx7yfou2b556ab32pojbjutkxfhh7v3y45qkevui.ipfs.nftstorage.link/" width="180" /></a>

This is a project supported by LXDAO. More links: [LXDAO](https://lxdao.io/) | [LXDAO Forum](https://forum.lxdao.io/) | [LXDAO Discord](https://discord.lxdao.io) | [LXDAO Twitter](https://twitter.com/LXDAO_Official).

LXDAO is an R&D-focused DAO in Web3. Our mission is: Gather the power of buidlers to buidl and support “LX” (valuable) Web3 projects sustainably and welcome 1 billion users into Web3. Welcome to join us.

[![Join our Discord server!](https://invidget.switchblade.xyz/HtcDdPgJ7D)](http://discord.gg/HtcDdPgJ7D)
