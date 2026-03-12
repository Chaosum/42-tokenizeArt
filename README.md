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
- **Hardhat** : compile et déploie rapidement, réseau local intégré pour faire des tests.

## Commandes

```bash
npm run compile          # compile → artifacts/
npm run deploy:sepolia   # déploie sur Sepolia (affiche l'adresse)
```

Mint manuel après déploiement :

```bash
node mint/upload-and-mint.js "Titre" "Artiste" 0xAdresseDestinataire
```

## Contrat déployé

Sepolia : `<adresse à renseigner>`  
https://sepolia.etherscan.io/address/<adresse>
