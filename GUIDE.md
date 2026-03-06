# GUIDE COMPLET — TokenizeArt42
## Tout comprendre et tout faire, étape par étape

**Projet 42 x BNB Chain | Auteur : matth**

---

# TABLE DES MATIÈRES

1. [Les concepts fondamentaux](#1-les-concepts-fondamentaux)
2. [Prérequis et installation](#2-prérequis-et-installation)
3. [Étape 1 : Créer l'image NFT](#3-étape-1--créer-limage-nft)
4. [Étape 2 : Uploader l'image sur IPFS](#4-étape-2--uploader-limage-sur-ipfs)
5. [Étape 3 : Comprendre le smart contract](#5-étape-3--comprendre-le-smart-contract)
6. [Étape 4 : Déployer le contrat avec Remix](#6-étape-4--déployer-le-contrat-avec-remix)
7. [Étape 5 : Minter le NFT](#7-étape-5--minter-le-nft)
8. [Étape 6 : Vérifier la propriété](#8-étape-6--vérifier-la-propriété)
9. [Étape 7 : Déploiement automatisé avec Hardhat](#9-étape-7--déploiement-automatisé-avec-hardhat)
10. [Étape 8 : Finaliser le dépôt Git](#10-étape-8--finaliser-le-dépôt-git)
11. [Erreurs fréquentes et solutions](#11-erreurs-fréquentes-et-solutions)
12. [Glossaire](#12-glossaire)

---

# 1. Les concepts fondamentaux

## 1.1 Qu'est-ce qu'une blockchain ?

Une **blockchain** est une base de données décentralisée. Au lieu d'être stockée sur un seul serveur (comme une base de données MySQL chez un hébergeur), elle est répliquée sur des milliers d'ordinateurs dans le monde entier appelés **nœuds**.

Chaque enregistrement (transaction) est regroupé dans un **bloc**, et chaque bloc est lié cryptographiquement au précédent, formant une **chaîne** (d'où le nom). Cela rend les données :
- **Immuables** : impossible de modifier un enregistrement passé sans recalculer toute la chaîne
- **Transparentes** : tout le monde peut lire toutes les transactions
- **Décentralisées** : pas de point de défaillance unique

**BNB Smart Chain (BSC)** est une blockchain compatible avec Ethereum (même langage, même outils) mais avec des frais de transaction (gas) beaucoup plus faibles.

## 1.2 Qu'est-ce qu'un smart contract ?

Un **smart contract** (contrat intelligent) est un programme informatique déployé sur une blockchain. Ses caractéristiques :
- Il s'exécute automatiquement quand ses conditions sont remplies
- Son code est public et immuable une fois déployé
- Il n'a pas besoin d'intermédiaire pour fonctionner
- Il est écrit en **Solidity** pour les blockchains EVM (Ethereum, BSC, etc.)

Dans notre projet, le smart contract gère qui possède quel NFT et comment les transférer.

## 1.3 Qu'est-ce qu'un NFT ?

Un **NFT** (Non-Fungible Token = token non-fongible) est un token **unique**. Contrairement aux cryptomonnaies (où 1 BTC = 1 autre BTC), chaque NFT est différent et possède des propriétés uniques.

**La différence avec une image normale :**
Une image JPG peut être copiée à l'infini. Un NFT est une **preuve de propriété** enregistrée sur la blockchain qui dit "cette adresse possède cet actif numérique". C'est comme un titre de propriété.

**Le standard ERC-721 / BEP-721 :**
C'est la norme qui définit comment un NFT doit fonctionner :
- `ownerOf(tokenId)` : qui possède ce token ?
- `transferFrom(from, to, tokenId)` : transférer la propriété
- `tokenURI(tokenId)` : où trouver les métadonnées ?

## 1.4 Qu'est-ce qu'IPFS ?

**IPFS** (InterPlanetary File System) est un protocole de stockage décentralisé. Au lieu d'identifier un fichier par son URL (qui peut changer ou disparaître), IPFS l'identifie par son **contenu** via un hash cryptographique appelé **CID** (Content Identifier).

Exemple :
- URL classique : `https://monsite.com/image.jpg` → si le site tombe, l'image disparaît
- IPFS : `ipfs://QmXxxx...` → l'image existe tant qu'un nœud la maintient, et son hash garantit qu'elle n'a pas été modifiée

**Pinata** est un service qui "épingle" (pin) tes fichiers IPFS pour les maintenir disponibles.

## 1.5 Qu'est-ce que MetaMask ?

**MetaMask** est un wallet (portefeuille) crypto qui s'installe comme extension Chrome/Firefox. Il permet de :
- Stocker tes cryptomonnaies et NFTs
- Signer des transactions sur la blockchain
- Interagir avec les dApps (applications décentralisées) directement depuis le navigateur

Dans ce projet, MetaMask est utilisé pour payer le gas (frais de transaction) et signer les déploiements/mints.

## 1.6 Qu'est-ce que le gas ?

Le **gas** est la mesure des ressources computationnelles consommées par une opération sur la blockchain. Chaque transaction coûte du gas, payé en crypto (tBNB sur le testnet).

Sur le BSC Testnet, les tBNB sont **gratuits** via le faucet — aucune vraie monnaie n'est utilisée dans ce projet.

## 1.7 Qu'est-ce que OpenZeppelin ?

**OpenZeppelin** est une bibliothèque de smart contracts en Solidity, **auditée et open-source**, référence de l'industrie. Elle fournit des implémentations sécurisées de :
- `ERC721.sol` : implémentation du standard NFT
- `Ownable.sol` : gestion du propriétaire du contrat
- `Base64.sol` : encodage Base64 pour les métadonnées on-chain

Au lieu de ré-écrire ces fonctions (risqué), on les importe depuis OpenZeppelin.

---

# 2. Prérequis et installation

## 2.1 Installer MetaMask

1. Va sur **https://metamask.io/download/**
2. Installe l'extension pour Chrome ou Firefox
3. Crée un nouveau wallet
4. **CRUCIAL** : note ta seed phrase (12 mots) dans un endroit sûr
5. ⚠️ Pour ce projet, utilise un wallet de test — pas ton wallet principal !

## 2.2 Configurer le réseau BSC Testnet dans MetaMask

MetaMask est configuré pour Ethereum par défaut. Il faut ajouter BSC Testnet :

1. Dans MetaMask, clique sur le sélecteur de réseau (en haut)
2. Clique **"Ajouter un réseau"** → **"Ajouter un réseau manuellement"**
3. Remplis avec ces informations exactes :

| Champ | Valeur |
|-------|--------|
| **Nom du réseau** | BSC Testnet |
| **Nouvelle URL RPC** | `https://data-seed-prebsc-1-s1.binance.org:8545/` |
| **ID de chaîne** | `97` |
| **Symbole de la devise** | `tBNB` |
| **URL de l'explorateur de blocs** | `https://testnet.bscscan.com` |

4. Clique **"Enregistrer"**

> Astuce : tu peux aussi ajouter BSC Testnet automatiquement via **https://chainlist.org** en cherchant "BSC Testnet"

## 2.3 Obtenir des tBNB gratuits (faucet)

Les tBNB (testnet BNB) sont des tokens fictifs utilisés pour payer le gas sur le testnet.

1. Copie ton adresse MetaMask (clique sur ton compte pour la copier)
2. Va sur **https://www.bnbchain.org/en/testnet-faucet**
3. Colle ton adresse dans le champ
4. Choisis "BNB" et clique **"Give Me BNB"**
5. Attends 1-2 minutes → tu reçois 0.5 tBNB (amplement suffisant)

Si ce faucet ne fonctionne pas, essaie : **https://faucet.quicknode.com/binance-smart-chain/bnb-testnet**

## 2.4 Node.js et npm (pour Hardhat — optionnel si tu utilises Remix)

Si tu veux utiliser les scripts automatisés :
1. Télécharge Node.js depuis **https://nodejs.org/** (version LTS)
2. Vérifie l'installation : `node --version` et `npm --version`

---

# 3. Étape 1 : Créer l'image NFT

## 3.1 Règles obligatoires

Selon le sujet :
- ✅ L'image doit contenir le **nombre 42** de manière visible et lisible
- ✅ Le 42 doit être **correctement affiché** (pas stylisé au point d'être illisible)
- ❌ Interdit : termes ou images insultants

## 3.2 Outils recommandés

- **Photoshop / GIMP** : pour des images complexes
- **Canva** (https://canva.com) : en ligne, gratuit, très facile
- **Figma** (https://figma.com) : pour des créations vectorielles
- **DALL-E / Midjourney** : génération d'image par IA (puis ajouter le 42 manuellement)

## 3.3 Conseils pour créer une bonne image

L'image doit être **originale et soignée** pour marquer les points bonus "beautiful NFT". Quelques idées :
- Une scène spatiale avec "42" dans les étoiles
- Un tableau abstrait avec le nombre en élément central
- Un pixel art avec 42 intégré
- Une œuvre minimaliste où 42 est l'élément principal

## 3.4 Format recommandé

- **Format :** PNG (meilleure qualité) ou JPG
- **Taille :** 1000x1000px minimum (carré recommandé pour les marketplaces NFT)
- **Taille de fichier :** idéalement inférieure à 10MB pour IPFS

## 3.5 Mettre à jour le contrat avec le bon nom

Une fois ton image créée, décide du nom de ton NFT. Il doit **contenir "42"** et un titre.

Dans `code/TokenizeArt42.sol`, trouve cette ligne :
```solidity
name: "42 TokenizeArt - Digital Odyssey",
```
Change "Digital Odyssey" par le titre de ton œuvre.

---

# 4. Étape 2 : Uploader l'image sur IPFS

## 4.1 Créer un compte Pinata

**Pinata** est le service IPFS le plus utilisé pour les NFTs. L'offre gratuite (200 fichiers, 1GB) est plus que suffisante pour ce projet.

1. Va sur **https://pinata.cloud/**
2. Clique **"Try For Free"** → crée un compte
3. Vérifie ton email

## 4.2 Uploader l'image

1. Dans le tableau de bord Pinata, clique **"Upload"** → **"File"**
2. Sélectionne ton image
3. Donne un nom à ton fichier (ex: `tokenizeart42.png`)
4. Clique **"Upload"**

Après l'upload, tu verras ton fichier dans la liste avec un **CID** (ex: `QmXxyz...`).

## 4.3 Obtenir le CID et l'URI IPFS

- **CID :** la chaîne de caractères qui identifie ton fichier (ex: `QmXxyzABCDEF123...`)
- **URI IPFS :** `ipfs://QmXxyzABCDEF123...`
- **Lien HTTP de test :** `https://gateway.pinata.cloud/ipfs/QmXxyzABCDEF123...`

**Noté le CID** — tu en auras besoin lors du mint.

## 4.4 Vérifier l'accessibilité

1. Va sur `https://gateway.pinata.cloud/ipfs/TON_CID`
2. Ton image doit s'afficher dans le navigateur ✅

---

# 5. Étape 3 : Comprendre le smart contract

Ouvre `code/TokenizeArt42.sol`. Voici une explication ligne par ligne des parties importantes :

## 5.1 Les imports

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
```

Ces lignes importent du code réutilisable d'OpenZeppelin :
- `ERC721.sol` : contient toutes les fonctions standards d'un NFT (ownerOf, transferFrom, etc.)
- `Ownable.sol` : ajoute un modifier `onlyOwner` pour protéger les fonctions sensibles
- `Base64.sol` : permet d'encoder les métadonnées en Base64 (stockage on-chain)
- `Strings.sol` : convertit des nombres en texte pour le JSON

## 5.2 La déclaration du contrat

```solidity
contract TokenizeArt42 is ERC721, Ownable {
```

`is ERC721, Ownable` signifie que le contrat **hérite** des fonctionnalités de ERC721 et Ownable. C'est comme l'héritage en Python/C++ : notre contrat reçoit toutes leurs fonctions automatiquement.

## 5.3 La structure NFTMetadata

```solidity
struct NFTMetadata {
    string artist;    // Ton login 42
    string name;      // Titre (doit contenir "42")
    string imageURI;  // "ipfs://CID..."
}
```

Un `struct` en Solidity est l'équivalent d'une structure en C : un regroupement de données. Ici, on regroupe les trois informations qui définissent notre NFT.

## 5.4 Le mapping

```solidity
mapping(uint256 => NFTMetadata) private _nftMetadata;
```

Un `mapping` est l'équivalent d'une `map<uint, NFTMetadata>` en C++ ou d'un dictionnaire Python. Il associe chaque `tokenId` (uint256) à ses métadonnées.

## 5.5 Le constructeur

```solidity
constructor() ERC721("42 TokenizeArt", "ART42") Ownable(msg.sender) {}
```

Exécuté une seule fois lors du déploiement :
- `ERC721("42 TokenizeArt", "ART42")` : nom et symbole de la collection
- `Ownable(msg.sender)` : le deployer (toi) devient propriétaire du contrat

## 5.6 La fonction mintNFT

```solidity
function mintNFT(address to, string memory imageURI)
    public
    onlyOwner
    returns (uint256)
{
    require(to != address(0), "...");
    require(bytes(imageURI).length > 0, "...");

    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;

    _safeMint(to, tokenId);

    _nftMetadata[tokenId] = NFTMetadata({
        artist: "matth",
        name: "42 TokenizeArt - Digital Odyssey",
        imageURI: imageURI
    });

    emit NFTMinted(to, tokenId, imageURI);
    return tokenId;
}
```

- `onlyOwner` : seul toi (le deployer) peux appeler cette fonction
- `require(...)` : validation des inputs (sécurité)
- `_safeMint(to, tokenId)` : crée officiellement le NFT (fonction héritée d'ERC721)
- `emit NFTMinted(...)` : émet un événement visible sur BscScan

⚠️ **IMPORTANT** : Remplace `"matth"` par ton vrai login 42 !

## 5.7 La fonction tokenURI (métadonnées on-chain)

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    // ...
    string memory json = Base64.encode(
        bytes(string(abi.encodePacked(
            '{"name": "', meta.name, '",',
            '"image": "', meta.imageURI, '",',
            // ...
        )))
    );
    return string(abi.encodePacked("data:application/json;base64,", json));
}
```

Cette fonction génère les métadonnées **directement depuis la blockchain**. Le résultat ressemble à :
```
data:application/json;base64,eyJuYW1lIjoiNDIgVG9rZW5pemVBcnQi...
```
En décodant le Base64, on obtient le JSON des métadonnées. Tous les explorateurs NFT (OpenSea, MetaMask) comprennent ce format automatiquement.

---

# 6. Étape 4 : Déployer le contrat avec Remix

Remix est l'outil recommandé — pas d'installation, tout se passe dans le navigateur.

## 6.1 Ouvrir Remix

1. Va sur **https://remix.ethereum.org/**
2. Dans le panneau de gauche, tu vois l'explorateur de fichiers

## 6.2 Créer le fichier du contrat

1. Dans le panneau gauche, clique l'icône **"New File"** (+ dans la liste)
2. Nomme le fichier `TokenizeArt42.sol`
3. Copie-colle TOUT le contenu de `code/TokenizeArt42.sol`

## 6.3 Compiler

1. Clique l'onglet **"Solidity Compiler"** (icône en forme de "S" dans le panneau gauche)
2. Vérifie que la version est **0.8.20** (ou la plus proche disponible)
3. Coche **"Enable optimization"** et laisse `200` runs
4. Clique le gros bouton bleu **"Compile TokenizeArt42.sol"**
5. ✅ Si aucune erreur rouge n'apparaît, la compilation est réussie

> Si tu as une erreur "file not found" pour OpenZeppelin, c'est normal avec Remix.
> Utilise à la place l'URL directe : remplace les imports par :
> ```solidity
> import "@openzeppelin/contracts@5.0.0/token/ERC721/ERC721.sol";
> ```

## 6.4 Connecter MetaMask à Remix

1. Dans MetaMask, assure-toi d'être sur **BSC Testnet**
2. Dans Remix, clique l'onglet **"Deploy & Run Transactions"** (icône fusée)
3. Dans le menu **"Environment"**, sélectionne **"Injected Provider - MetaMask"**
4. MetaMask s'ouvre → clique **"Connect"** → sélectionne ton compte → **"Connect"**
5. Remix affiche maintenant ton adresse et ton solde en tBNB

## 6.5 Déployer

1. Dans la section **"Contract"**, sélectionne `TokenizeArt42` dans le dropdown
2. Clique le gros bouton orange **"Deploy"**
3. MetaMask s'ouvre et demande confirmation
4. Clique **"Confirmer"** (le gas estimé sera quelques centimes en tBNB)
5. Attends 10-20 secondes...

## 6.6 Récupérer l'adresse du contrat

Après le déploiement, dans Remix :
1. En bas à gauche, dans **"Deployed Contracts"**, tu vois `TOKENIZEART42 at 0xAbc...`
2. **Copie cette adresse** — c'est l'adresse de ton contrat !
3. Mets-la à jour dans `README.md` (section "Contrat déployé")

---

# 7. Étape 5 : Minter le NFT

Le mint crée l'instance concrète de ton NFT sur la blockchain.

## 7.1 Via Remix (après le déploiement)

Dans Remix, dans la section **"Deployed Contracts"** :

1. Clique sur la flèche pour déplier les fonctions du contrat
2. Trouve la fonction **`mintNFT`** avec deux champs :
   - `to` : ton adresse MetaMask (ex: `0xTon_Adresse`)
   - `imageURI` : `ipfs://TON_CID` (le CID obtenu depuis Pinata)
3. Remplis les deux champs
4. Clique **"transact"**
5. Confirme dans MetaMask
6. Attends la confirmation de la transaction

## 7.2 Vérifier que le mint a fonctionné

Dans Remix, appelle :
- **`ownerOf`** avec `0` → doit retourner ton adresse MetaMask ✅
- **`getMetadata`** avec `0` → doit retourner `{artist, name, imageURI}` ✅
- **`totalMinted`** → doit retourner `1` ✅

## 7.3 Voir le NFT sur BscScan

1. Va sur `https://testnet.bscscan.com/address/TON_ADRESSE_CONTRAT`
2. Onglet **"NFT Transfers"** → tu verras le mint
3. En cliquant sur le token (Token ID : 0), tu peux voir les infos

---

# 8. Étape 6 : Vérifier la propriété

La fonction `ownerOf` est LA fonction clé que l'évaluation va vérifier.

## 8.1 Via Remix

1. Dans **"Deployed Contracts"**, trouve la fonction `ownerOf`
2. Entre `0` (premier token)
3. Clique le bouton bleu (lecture, pas de gas)
4. La réponse affiche l'adresse du propriétaire ✅

## 8.2 Via BscScan

1. Va sur `https://testnet.bscscan.com/address/TON_CONTRAT`
2. Onglet **"Read Contract"** (si le contrat est vérifié)
3. Cherche la fonction `ownerOf`
4. Entre `0` → la réponse est l'adresse du propriétaire

## 8.3 Via le script mint.js

Le script `mint/mint.js` appelle automatiquement `ownerOf` après le mint et affiche le résultat dans le terminal.

---

# 9. Étape 7 : Déploiement automatisé avec Hardhat

Si tu veux automatiser tout ça avec des scripts Node.js :

## 9.1 Installer les dépendances

```bash
# Dans le dossier deployment/
cd deployment
npm install
```

Cela installe :
- `hardhat` : framework de développement Ethereum/BSC
- `@nomicfoundation/hardhat-toolbox` : outils (ethers.js, etc.)
- `@openzeppelin/contracts` : les contrats OpenZeppelin
- `dotenv` : gestion des variables d'environnement

## 9.2 Configurer la clé privée

⚠️ **SÉCURITÉ IMPORTANTE** : La clé privée donne accès total à ton wallet. Ne la mets JAMAIS dans du code, dans un commit, ou dans un fichier public.

```bash
# Crée le fichier .env à partir du template
cp .env.example .env
```

Édite `.env` et remplace la valeur :
```
PRIVATE_KEY=0xTA_CLE_PRIVEE
```

**Comment obtenir ta clé privée MetaMask :**
1. MetaMask → Clic sur ton compte → **"Détails du compte"**
2. Clique **"Exporter la clé privée"**
3. Entre ton mot de passe MetaMask
4. Copie la clé (commence par `0x...`)

**Vérifie que `.env` est dans `.gitignore` :**
```bash
echo ".env" >> ../.gitignore
```

## 9.3 Compiler le contrat

```bash
npm run compile
```

Hardhat va lire `code/TokenizeArt42.sol` (configuré dans `hardhat.config.js` via `paths.sources`) et créer les artefacts dans `deployment/artifacts/`.

## 9.4 Déployer

```bash
npm run deploy:testnet
```

Tu verras quelque chose comme :
```
================================================
   Déploiement de TokenizeArt42
================================================
Réseau : bscTestnet
Chain ID : 97
Deployed par : 0xTonAdresse
Solde du deployer : 0.5 tBNB

Déploiement en cours...

================================================
   ✅ Déploiement réussi !
================================================
Adresse du contrat : 0xAbCDEF...
Transaction hash   : 0x123...
```

## 9.5 Minter avec le script

Dans `mint/mint.js`, mets à jour les 3 variables :
```js
const CONTRACT_ADDRESS = "0xAbCDEF..."; // L'adresse du contrat
const IMAGE_IPFS_URI   = "ipfs://QmXxyz..."; // Le CID de ton image
const RECIPIENT_ADDRESS = "0xTonWallet..."; // Ton adresse MetaMask
```

Puis :
```bash
cd mint
npm install
npm run mint:testnet
```

---

# 10. Étape 8 : Finaliser le dépôt Git

## 10.1 Mettre à jour README.md

Dans `README.md`, remplace les `TODO` par les vraies valeurs :
```markdown
| Adresse du contrat        | `0xTON_ADRESSE_DEPLOYEE` |
| Transaction de déploiement | `0xHASH_TRANSACTION` |
| Token ID du NFT minté     | `0` |
| Propriétaire              | `0xTON_WALLET` |
| Image IPFS                | `ipfs://TON_CID` |
```

## 10.2 Mettre à jour documentation/whitepaper.md

Même chose : remplace les `TODO` par les vraies valeurs dans la section 6.

## 10.3 Créer le .gitignore

```bash
# À la racine du projet
cat > .gitignore << EOF
.env
node_modules/
artifacts/
cache/
*.log
EOF
```

## 10.4 Structure finale vérification

```
.
├── README.md                ✅ Avec adresse contrat et choix techniques
├── GUIDE.md                 ✅ Ce fichier
├── .gitignore               ✅ Contient .env et node_modules
├── code/
│   └── TokenizeArt42.sol   ✅ Contrat commenté avec ton login
├── deployment/
│   ├── README.md           ✅ Instructions de déploiement
│   ├── deploy.js           ✅ Script de déploiement
│   ├── hardhat.config.js   ✅ Config Hardhat
│   ├── package.json        ✅ Dépendances
│   └── .env.example        ✅ Template (pas le .env avec la vraie clé !)
├── mint/
│   ├── README.md           ✅ Instructions de mint
│   ├── mint.js             ✅ Script de mint
│   ├── hardhat.config.js   ✅ Config
│   └── package.json        ✅ Dépendances
└── documentation/
    └── whitepaper.md       ✅ Documentation complète
```

## 10.5 Commit et push

```bash
git add .
git commit -m "feat: Deploy TokenizeArt42 NFT on BSC Testnet"
git push
```

---

# 11. Erreurs fréquentes et solutions

## "Error: could not detect network"
→ MetaMask n'est pas sur BSC Testnet. Vérifie le réseau sélectionné.

## "Insufficient funds for gas"
→ Tu n'as pas assez de tBNB. Va sur le faucet et récupères-en.

## "execution reverted: Cannot mint to zero address"
→ Le paramètre `to` de mintNFT est vide ou est `0x000...`. Entre une vraie adresse wallet.

## "execution reverted: Ownable: caller is not the owner"
→ Tu n'es pas connecté avec le même wallet qui a déployé le contrat.

## "Error: file not found @openzeppelin/contracts"
→ Dans Remix, utilise les imports avec la version explicite :
```solidity
import "@openzeppelin/contracts@5.0.0/token/ERC721/ERC721.sol";
```

## "PRIVATE_KEY is not defined"
→ Le fichier `.env` n'existe pas ou n'est pas correctement configuré dans `deployment/`.

## L'image n'apparaît pas sur les marketplaces
→ Le gateway IPFS met parfois du temps. Essaie `https://ipfs.io/ipfs/TON_CID`

## "Transaction underpriced"
→ Le gas price est trop bas. Augmente `gasPrice` dans `hardhat.config.js`.

---

# 12. Glossaire

| Terme | Définition |
|-------|-----------|
| **ABI** | Application Binary Interface — interface qui décrit les fonctions d'un contrat |
| **BEP-721** | Standard NFT sur BNB Chain (identique à ERC-721) |
| **Blockchain** | Base de données décentralisée, immuable et transparente |
| **BSC** | BNB Smart Chain — blockchain compatible EVM de Binance |
| **CID** | Content Identifier — hash IPFS identifiant un fichier par son contenu |
| **dApp** | Application décentralisée — application fonctionnant sur une blockchain |
| **Deploy** | Déployer — publier le code d'un smart contract sur la blockchain |
| **ERC-721** | Standard NFT sur Ethereum (et blockchains EVM compatibles) |
| **EVM** | Ethereum Virtual Machine — moteur d'exécution des smart contracts |
| **Faucet** | Robinet — service donnant des tokens de test gratuits |
| **Gas** | Unité mesurant les ressources computationnelles d'une transaction |
| **IPFS** | InterPlanetary File System — stockage décentralisé basé sur le contenu |
| **Mapping** | Structure de données associant clés et valeurs (dict Python / map C++) |
| **MetaMask** | Wallet crypto en extension de navigateur |
| **Mint** | Créer — l'acte de créer un nouveau NFT sur la blockchain |
| **NFT** | Non-Fungible Token — token unique prouvant la propriété d'un actif numérique |
| **onlyOwner** | Modificateur Solidity limitant l'accès au propriétaire du contrat |
| **OpenZeppelin** | Bibliothèque de smart contracts sécurisés, standard de l'industrie |
| **Pinata** | Service d'hébergement IPFS pour les NFTs |
| **Smart Contract** | Programme auto-exécutable déployé sur la blockchain |
| **Solidity** | Langage de programmation pour les smart contracts EVM |
| **tBNB** | Testnet BNB — tokens fictifs pour tester sur BSC Testnet |
| **Token ID** | Identifiant unique d'un NFT au sein d'une collection |
| **tokenURI** | Fonction retournant l'adresse (ou les données) des métadonnées d'un NFT |
| **Transaction** | Modification de l'état de la blockchain (coûte du gas) |
| **Wallet** | Portefeuille cryptographique stockant tes clés privées |

---

*Guide rédigé dans le cadre du projet TokenizeArt — 42 x BNB Chain*
