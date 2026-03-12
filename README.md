# TokenizeArt42

## C'est quoi ce projet ?

Le but est de tokenizer des images sous forme de NFT sur Ethereum.
Chaque image devient un token ERC-721 unique, avec ses métadonnées (titre, image) encodées directement on-chain.

Le contrat est écrit en Solidity, déployé avec Hardhat sur Sepolia.

## NFT vs token classique

Un token ERC-20 (token classique) est fongible : chaque unité est identique et interchangeable, comme une monnaie.

Un NFT (ERC-721) est non-fongible : chaque token a un `tokenId` unique et peut avoir ses propres métadonnées. Deux NFT du même contrat ne sont pas interchangeables.

Ce contrat implémente ERC-721.

## Pourquoi ces choix

- **Ethereum / Sepolia** : standard pour les NFT, testnet simple à utiliser.
- **Métadonnées on-chain** : les infos du token (titre, image) sont stockées dans le contrat. `tokenURI()` construit et retourne le JSON directement depuis la blockchain — pas de serveur externe qui peut tomber.
- **IPFS (Pinata)** : l'image est stockée sur un réseau décentralisé. Le CID garantit que l'image ne peut pas être modifiée — si le fichier change, l'URL change.
- **Hardhat** : compile et déploie rapidement, réseau local intégré pour faire des tests.

## Commandes

```bash
npm run compile          # compile → artifacts/
npm run deploy:sepolia   # déploie sur Sepolia (affiche l'adresse)
npm run mint             # mint un NFT (paramètres dans .env)
npm run demo             # démonstration complète
npm run verify:sepolia <addr>  # vérifie le source sur Etherscan
```

## Contrat déployé

Sepolia : `0xAB57B63EBf41290a8Be6c4ea1e920CeC3EE6B28C`  
https://sepolia.etherscan.io/address/0xAB57B63EBf41290a8Be6c4ea1e920CeC3EE6B28C#code
