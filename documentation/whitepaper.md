# Whitepaper — TokenizeArt42 NFT

**Auteur :** matth (Projet 42 x BNB Chain)
**Version :** 1.0 — Mars 2026

---

## 1. Présentation du projet

**TokenizeArt42** est un NFT (Non-Fungible Token) créé dans le cadre du projet TokenizeArt de l'école 42, en partenariat avec BNB Chain. Ce projet consiste à créer, déployer et minter un token numérique unique représentant une œuvre d'art digitale.

---

## 2. Le NFT

### 2.1 Caractéristiques
| Propriété | Valeur |
|-----------|--------|
| Nom de la collection | `42 TokenizeArt` |
| Symbole | `ART42` |
| Standard | ERC-721 / BEP-721 |
| Blockchain | BNB Smart Chain Testnet |
| Artiste | `matth` (login 42) |
| Nom du token | `42 TokenizeArt - Digital Odyssey` |
| Stockage image | IPFS (décentralisé) |
| Métadonnées | On-chain (Base64 JSON) |

### 2.2 L'image
L'image du NFT est une création originale contenant le nombre **42** de manière visible et lisible. Elle est stockée de manière décentralisée sur IPFS via Pinata, ce qui garantit sa disponibilité permanente sans dépendance à un serveur central.

- **Lien IPFS :** `ipfs://TODO_APRES_UPLOAD`
- **Gateway HTTP :** `https://gateway.pinata.cloud/ipfs/TODO_CID`

---

## 3. Architecture technique

### 3.1 Smart Contract
Le contrat `TokenizeArt42.sol` est déployé sur la BNB Smart Chain Testnet. Il implémente le standard ERC-721 (compatible BEP-721) via la bibliothèque OpenZeppelin, qui est la référence de l'industrie pour les contrats sécurisés.

**Fonctions clés :**

| Fonction | Description | Accès |
|----------|-------------|-------|
| `mintNFT(to, imageURI)` | Crée un nouveau NFT | Owner seulement |
| `ownerOf(tokenId)` | Retourne le propriétaire du NFT | Public |
| `tokenURI(tokenId)` | Retourne les métadonnées JSON (Base64) | Public |
| `getMetadata(tokenId)` | Retourne les métadonnées brutes | Public |
| `totalMinted()` | Nombre total de tokens créés | Public |

### 3.2 Métadonnées on-chain
Contrairement à beaucoup de NFTs qui stockent leurs métadonnées sur des serveurs centraux (vulnérables à la panne), ce NFT stocke ses métadonnées **directement dans la blockchain** sous forme de JSON encodé en Base64.

**Format des métadonnées (standard OpenSea) :**
```json
{
  "name": "42 TokenizeArt - Digital Odyssey",
  "description": "NFT créé dans le cadre du projet TokenizeArt à l'École 42.",
  "image": "ipfs://QmXxxx...",
  "attributes": [
    { "trait_type": "Artist",     "value": "matth" },
    { "trait_type": "School",     "value": "42" },
    { "trait_type": "Token ID",   "value": "0" },
    { "trait_type": "Blockchain", "value": "BNB Smart Chain" }
  ]
}
```

### 3.3 Stockage IPFS
IPFS (InterPlanetary File System) est un protocole de stockage décentralisé. Chaque fichier est identifié par son **CID** (Content Identifier), un hash cryptographique de son contenu. Cela garantit :
- L'**immuabilité** : le contenu ne peut pas être modifié sans changer le CID
- La **décentralisation** : pas de serveur unique qui peut tomber en panne
- La **permanence** : le fichier existe tant qu'au moins un nœud le maintient

---

## 4. Utilisation du NFT

### 4.1 Vérifier la propriété
Pour confirmer le propriétaire d'un NFT, appeler la fonction `ownerOf` :

**Via Remix :**
1. Connecter MetaMask sur BSC Testnet
2. Charger le contrat par son adresse
3. Appeler `ownerOf(0)` → retourne l'adresse du propriétaire

**Via BscScan :**
1. Aller sur `https://testnet.bscscan.com/address/ADRESSE_CONTRAT`
2. Onglet "Read Contract"
3. Section `ownerOf` → entrer `0` → résultat = propriétaire

### 4.2 Lire les métadonnées
Appeler `tokenURI(0)` retourne une chaîne commençant par `data:application/json;base64,`. Décoder le Base64 donne le JSON complet des métadonnées.

### 4.3 Transférer le NFT
Appeler `transferFrom(from, to, tokenId)` avec :
- `from` : adresse actuelle du propriétaire
- `to` : adresse du nouveau propriétaire
- `tokenId` : `0` pour le premier token

---

## 5. Sécurité

### 5.1 Contrôle d'accès
- Le mint est protégé par `onlyOwner` (modifier d'OpenZeppelin)
- Seul le deployer peut créer de nouveaux tokens
- Les transferts respectent le standard ERC-721

### 5.2 Bonne pratiques appliquées
- Validation des inputs (`require` avec messages d'erreur clairs)
- Utilisation de `_safeMint` (vérifie que le receveur peut gérer les NFTs)
- Pas de reentrancy possible (pas d'appels externes dans mintNFT)
- Clé privée jamais dans le code (stockée dans `.env`, ignoré par git)

---

## 6. Informations de déploiement

| Paramètre | Valeur |
|-----------|--------|
| Réseau | BSC Testnet (Chain ID: 97) |
| Adresse contrat | `0xTODO_APRES_DEPLOIEMENT` |
| Transaction déploiement | `0xTODO` |
| Token ID minté | `0` |
| Propriétaire | `0xTODO_WALLET` |
| IPFS CID image | `TODO_CID` |
| Block Explorer | https://testnet.bscscan.com |

---

## 7. Reproduction

Pour reproduire ce projet from scratch :
1. Cloner le dépôt
2. Uploader une image sur IPFS (Pinata)
3. Déployer le contrat (voir `deployment/README.md`)
4. Minter le NFT (voir `mint/README.md`)
5. Vérifier avec `ownerOf(0)`
