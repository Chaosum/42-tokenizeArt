# TokenizeArt — Build your own NFT

**Projet 42 x BNB Chain** | Version 1.0 | Auteur : matth

---

## Description

Ce projet consiste à créer, déployer et minter un NFT (Non-Fungible Token) sur la BNB Smart Chain Testnet dans le cadre du projet **TokenizeArt** de l'école 42.

---

## Choix techniques

### Blockchain : BNB Smart Chain Testnet
- **Pourquoi BSC ?** Frais de transaction très faibles, compatible EVM, large communauté Web3.
- **Réseau utilisé :** BSC Testnet (Chain ID 97) — aucune vraie crypto n'est utilisée.
- **Standard :** BEP-721 (100% compatible avec ERC-721).

### Langage : Solidity ^0.8.20
- Standard de l'industrie pour les smart contracts sur blockchains EVM.
- Compilateur le plus récent et stable à la date du projet.
- Support natif des standards ERC-721 via OpenZeppelin v5.

### Bibliothèque : OpenZeppelin v5
- Référence absolue de l'industrie pour la sécurité des smart contracts.
- Fournit ERC721, Ownable, Base64, Strings prêts à l'emploi et audités.

### Outil de déploiement : Remix IDE + Hardhat
- **Remix :** déploiement interactif sans installation, idéal pour tester.
- **Hardhat :** automatisation complète via scripts Node.js.

### Stockage de l'image : IPFS via Pinata
- Stockage décentralisé et permanent — pas de serveur central vulnérable.
- Le CID (hash) garantit l'immuabilité de l'image.

### Métadonnées : On-chain (Base64 JSON)
- Les métadonnées ne dépendent d'aucun serveur externe.
- `tokenURI()` retourne un JSON encodé en Base64 directement depuis la blockchain.

---

## Contrat déployé

| Paramètre | Valeur |
|-----------|--------|
| Réseau | BSC Testnet (Chain ID: 97) |
| Adresse du contrat | `0xTODO_APRES_DEPLOIEMENT` |
| Transaction de déploiement | `0xTODO` |
| Token ID du NFT minté | `0` |
| Propriétaire | `0xTODO_WALLET` |
| Image IPFS | `ipfs://TODO_CID` |

> Voir sur BscScan : https://testnet.bscscan.com/address/0xTODO

---

## Structure du dépôt

```
.
├── README.md                   ← Ce fichier (choix techniques + infos contrat)
├── GUIDE.md                    ← Guide complet étape par étape (tout expliqu)
├── code/
│   └── TokenizeArt42.sol       ← Smart contract ERC-721/BEP-721 commenté
├── deployment/
│   ├── README.md               ← Instructions de déploiement (Remix + Hardhat)
│   ├── deploy.js               ← Script de déploiement automatisé
│   ├── hardhat.config.js       ← Configuration Hardhat + BSC Testnet
│   ├── package.json            ← Dépendances npm
│   └── .env.example            ← Template des variables d'environnement
├── mint/
│   ├── README.md               ← Instructions de mint (Remix + Hardhat)
│   ├── mint.js                 ← Script de mint automatisé
│   ├── hardhat.config.js       ← Config Hardhat pour le mint
│   └── package.json            ← Dépendances npm
└── documentation/
    └── whitepaper.md           ← Documentation complète du NFT
```

---

## Démarrage rapide

**1. Lire le guide complet :** [GUIDE.md](GUIDE.md)

**2. Déployer le contrat :** [deployment/README.md](deployment/README.md)

**3. Minter le NFT :** [mint/README.md](mint/README.md)

**4. Vérifier la propriété :** appeler `ownerOf(0)` sur le contrat → retourne l'adresse du propriétaire.
