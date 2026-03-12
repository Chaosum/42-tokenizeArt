## Stockage

Le contrat utilise 4 mappings principaux :

- `_owners` : `tokenId → adresse` — à qui appartient chaque NFT.
- `_balances` : `adresse → nombre` — combien de NFT possède chaque adresse.
- `_tokenApprovals` : `tokenId → adresse` — qui est autorisé à transférer **ce token précis** à la place du owner (délégation unitaire).
- `_operatorApprovals` : `adresse → adresse → bool` — qui est autorisé à transférer **tous** les tokens d'un owner (utilisé par les marketplaces).

---

## Fonctions publiques

- `name()` — Retourne le nom de la collection ("42 TokenizeArt").
- `symbol()` — Retourne le symbole ("ART42").
- `owner()` — Retourne l'adresse du propriétaire du contrat.
- `transferOwnership(newOwner)` — (onlyOwner) Transfère la propriété. Revert si adresse nulle.

- `balanceOf(ownerAddr)` — Nombre de tokens détenus par `ownerAddr`.
- `ownerOf(tokenId)` — Adresse propriétaire du token `tokenId`. Revert si inexistant.
- `approve(to, tokenId)` — Autorise `to` à transférer `tokenId`. Revert si appelant non owner/operator.
- `getApproved(tokenId)` — Retourne l'adresse approuvée pour `tokenId`.
- `setApprovalForAll(operator, approved)` — Donne/retire les droits de transfert global à `operator`.
- `isApprovedForAll(ownerAddr, operator)` — Vérifie si `operator` a les droits globaux sur les tokens de `ownerAddr`.
- `transferFrom(from, to, tokenId)` — Transfère `tokenId` de `from` à `to`. Revert si appelant non autorisé ou adresse nulle.

- `mintNFT(to, imageURI, title, artist)` — (onlyOwner) Crée un nouveau token pour `to` avec ses métadonnées. Revert si adresse nulle ou `imageURI` vide. Retourne le `tokenId`.
- `totalMinted()` — Nombre total de tokens créés.

- `getMetadata(tokenId)` — Retourne la struct `NFTMetadata` (name, artist, imageURI) du token.
- `tokenURI(tokenId)` — Retourne un data URI `data:application/json;base64,...` contenant le JSON des métadonnées.

---

## Fonctions internes

- `_isApprovedOrOwner(spender, tokenId)` — Vérifie si `spender` est owner, approuvé ou operator du token.

---

## Events

- `Transfer(from, to, tokenId)` — Émis à chaque transfert (y compris mint depuis `address(0)`).
- `Approval(owner, approved, tokenId)` — Émis lors d'un `approve`.
- `ApprovalForAll(owner, operator, approved)` — Émis lors d'un `setApprovalForAll`.
- `NFTMinted(to, tokenId, imageURI)` — Émis à chaque mint.
- `OwnershipTransferred(previousOwner, newOwner)` — Émis lors d'un changement de propriétaire.

---

## Erreurs custom

- `ZeroAddress()` — Adresse nulle passée en paramètre.
- `NotOwner()` — Appelant non autorisé (onlyOwner).
- `NotApproved()` — Appelant sans permission de transfert.
- `TokenDoesNotExist()` — Token inexistant (ou imageURI vide au mint).

---

## Déploiement

### Setup

```bash
npm install
```

Créer un fichier `.env` :

```env
SEPOLIA_RPC_URL=https://11155111.rpc.thirdweb.com/
PRIVATE_KEY=0x...        # wallet déployeur (owner)
PRIVATE_KEY_2=0x...      # second wallet (demo.js uniquement)
```


### Commandes

```bash
npm run compile          # compile le contrat → artifacts/
npm run deploy:sepolia   # déploiement sur Sepolia (affiche l'adresse)
```

---

## Code de déploiement

### `scripts/deploy.js`

```js
const factory = await ethers.getContractFactory("TokenizeArt42"); // charge ABI + bytecode
const contract = await factory.deploy();                       // envoie la tx de création
await contract.waitForDeployment();                            // attend la confirmation
console.log(await contract.getAddress());                      // affiche l'adresse
```

