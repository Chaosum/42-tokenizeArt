# TokenizeArt42 — minimal NFT project (sans OpenZeppelin)

Ce dépôt contient une implémentation autonome d'un contrat NFT (ERC‑721‑like) nommée `TokenizeArt42`, des scripts de déploiement/démonstration, et des outils pour uploader une image sur IPFS via `nft.storage` puis la mint en NFT.

Principaux choix techniques
- Sans OpenZeppelin : la logique ERC‑721 a été réimplémentée minimalement pour réduire les dépendances et servir d'exemple pédagogique. Attention : cela n'inclut pas toutes les garanties/fonctionnalités d'OpenZeppelin (par ex. ERC165, `safeTransferFrom`).
- Métadonnées on‑chain : chaque token stocke `artist`, `name` et `imageURI` on‑chain. `tokenURI()` construit un data:application/json;base64,... mais un getter `getMetadata()` renvoie directement les champs si besoin.
- Upload automatisé : script `code/scripts/upload-and-mint.js` pour déposer une image sur nft.storage et appeler `mintNFT` avec l'URI IPFS.

Structure du repo (essentielle)
- `code/TokenizeArt42.sol` — contrat NFT principal
- `deployment/deploy.js` — script de déploiement (Hardhat)
- `deployment/demo.js` — script d'exemple pour mint et lire metadata
- `deployment/test-run.js` — test-run local (deploy + mint + lecture)
- `code/scripts/upload-and-mint.js` — upload vers nft.storage + mint (Node.js)
- `documentation/technicaldoc.md` — documentation détaillée des méthodes (méthode et événements)
- `documentation/deployment.md` — guide de déploiement et utilisation des scripts

Quick start (local)
1. Installer les dépendances :

```bash
npm install
```

2. Lancer un nœud local Hardhat :

```bash
npx hardhat node
```

3. Déployer localement :

```bash
npx hardhat run deployment/deploy.js --network localhost
```

4. Exécuter le test d'intégration local (déploy + mint + lecture) :

```bash
npx hardhat run deployment/test-run.js --network localhost
```

Mint d'une image locale via nft.storage
1. Crée un fichier `.env` à la racine avec :

```
NFT_STORAGE_API_KEY=...        # clé nft.storage
PRIVATE_KEY=0x...             # clé deployer / wallet
CONTRACT_ADDRESS=0x...        # adresse du contrat déployé (optionnel si deploy local)
SEPOLIA_RPC_URL=...          # si tu veux utiliser Sepolia / testnet
```

2. Upload & mint :

```bash
node code/scripts/upload-and-mint.js ./assets/42dofusNFT.png "Titre du NFT" "Artiste" 0xTonAdresse
```

Notes importantes
- tokenURI() renvoie un data URI Base64 construit on‑chain ; dans certains cas (client JS strict) cela peut provoquer une erreur de décodage UTF‑8. Utilise `getMetadata(tokenId)` pour un accès robuste aux champs si tu rencontres ce problème.
- Pour un usage en production, je recommande : ajouter `safeTransferFrom`, ERC165, et restreindre `mintNFT` à un rôle `MINTER`/`ADMIN`.

Si tu veux, je peux :
- corriger l'encodeur Base64 on‑chain pour éliminer le problème de décodage
- ajouter `safeTransferFrom` + ERC165
- implémenter un script de déploiement complet pour Sepolia et une vérification automatique Etherscan
# Déploiement du contrat TokenizeArt42

## Méthode 1 — Remix IDE (recommandée, sans installation)

### Étape 1 : Ouvrir le contrat dans Remix
1. Va sur **https://remix.ethereum.org/**
2. Dans le panneau gauche, crée un nouveau fichier : `TokenizeArt42.sol`
3. Copie-colle le contenu de `../code/TokenizeArt42.sol`

### Étape 2 : Compiler
1. Clique sur l'icône **Solidity Compiler** (onglet en forme de S)
2. Sélectionne la version **0.8.20**
3. Active **"Enable optimization"** (200 runs)
4. Clique **"Compile TokenizeArt42.sol"**
5. ✅ Aucune erreur = compilation réussie

### Étape 3 : Configurer MetaMask sur BSC Testnet
Ajoute le réseau manuellement dans MetaMask :
| Champ | Valeur |
|-------|--------|
| Nom du réseau | BSC Testnet |
| URL RPC | `https://data-seed-prebsc-1-s1.binance.org:8545/` |
| Chain ID | `97` |
| Symbole | `tBNB` |
| Block Explorer | `https://testnet.bscscan.com` |

### Étape 4 : Obtenir des tBNB gratuits (faucet)
1. Va sur **https://www.bnbchain.org/en/testnet-faucet**
2. Entre ton adresse MetaMask
3. Attends ~1 minute → tu reçois 0.5 tBNB (suffisant pour déployer + minter)

### Étape 5 : Déployer
1. Dans Remix, clique l'onglet **"Deploy & Run Transactions"** (icône fusée)
2. **Environment** : sélectionne `Injected Provider - MetaMask`
3. MetaMask s'ouvre → choisis le compte BSC Testnet
4. Clique **"Deploy"**
5. Confirme la transaction dans MetaMask
6. Attends 10-20 secondes → l'adresse du contrat apparaît dans Remix

### Étape 6 : Noter l'adresse du contrat
Copie l'adresse (ex: `0xAbC123...`) et mets-la à jour dans :
- `../README.md` (section "Contrat déployé")
- `../mint/mint.js` (variable `CONTRACT_ADDRESS`)

---

## Méthode 2 — Hardhat (automatisée)

### Prérequis
- Node.js >= 18 installé
- npm installé

### Installation
```bash
cd deployment
npm install
```

### Configuration
```bash
cp .env.example .env
# Édite .env et remplis PRIVATE_KEY avec ta clé privée MetaMask
```

> ⚠️ Utilise un wallet de test UNIQUEMENT — jamais un wallet avec de vraies crypto !

### Compilateur
```bash
npm run compile
```

### Déploiement
```bash
npm run deploy:testnet
```

Le script affiche l'adresse du contrat déployé. Note-la !

---

## Vérifier que le déploiement a fonctionné

1. Va sur **https://testnet.bscscan.com/**
2. Recherche ton adresse de contrat
3. Tu dois voir la transaction de déploiement
4. Dans l'onglet **"Contract"**, tu peux voir le bytecode déployé
