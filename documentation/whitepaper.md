# Whitepaper — TokenizeArt42

---

## 1. Présentation

**TokenizeArt42** est le smart contract ERC-721 déployé dans le cadre du projet TokenizeArt de l'école 42. Il permet de tokenizer des œuvres d'art digitales — chaque image devient un token unique sur Ethereum.

Le NFT minté représente l'image `42fusNFT.png`, une création originale contenant le nombre **42** de manière visible.

---

## 2. Le NFT

| Propriété | Valeur |
|-----------|--------|
| Nom de la collection | `42 TokenizeArt` |
| Symbole | `ART42` |
| Standard | ERC-721 |
| Blockchain | Ethereum Sepolia (testnet) |
| Stockage image | IPFS (via Pinata) |
| Métadonnées | On-chain (Base64 JSON) |

L'image est hébergée sur IPFS — un réseau de stockage décentralisé. Le CID (Content Identifier) est l'empreinte cryptographique du fichier, ce qui garantit que l'image ne peut pas être modifiée ou supprimée sans que l'URL change.

- **CID :** `bafybeidit2ud3timi5zzlpyomwofvfnstlr3ujbl2euwa4my3xgewi2fky`
- **URL :** `https://ipfs.io/ipfs/bafybeidit2ud3timi5zzlpyomwofvfnstlr3ujbl2euwa4my3xgewi2fky`

---

## 3. Architecture technique

### Contrat

Le contrat `TokenizeArt42.sol` implémente ERC-721 sans dépendance externe. Chaque token stocke son titre, son artiste et l'URI de son image directement dans le state du contrat.

| Fonction | Description | Accès |
|----------|-------------|-------|
| `mintNFT(to, imageURI, title, artist)` | Crée un NFT | Owner |
| `ownerOf(tokenId)` | Retourne le propriétaire | Public |
| `tokenURI(tokenId)` | Retourne les métadonnées JSON encodées en Base64 | Public |
| `transferFrom(from, to, tokenId)` | Transfère un NFT | Owner / approuvé |

---

## 4. Utilisation

### Vérifier la propriété

Appeler `ownerOf(tokenId)` retourne l'adresse du propriétaire du token.

Via Etherscan :
1. Aller sur `https://sepolia.etherscan.io/address/<ADRESSE_CONTRAT>`
2. Onglet **Read Contract**
3. `ownerOf` → entrer le `tokenId`

### Lire les métadonnées

Appeler `tokenURI(tokenId)` retourne une chaîne `data:application/json;base64,...`. Décoder le Base64 donne :

```json
{
  "name": "Titre de l'oeuvre",
  "artist": "mservage",
  "image": "https://ipfs.io/ipfs/bafybeidit2ud3timi5zzlpyomwofvfnstlr3ujbl2euwa4my3xgewi2fky"
}
```

### Transférer le NFT

```solidity
transferFrom(adresseActuelle, adresseDestinataire, tokenId)
```

