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
- `safeTransferFrom(from, to, tokenId)` — Transfère `tokenId` de `from` à `to` de façon sécurisée. Vérifie que `to` est soit une adresse EOA, soit un contrat qui implémente `onERC721Received()`. Revert si `to` est un contrat qui n'implémente pas l'interface ou qui refuse le transfer (retourne un sélecteur invalide).
- `safeTransferFrom(from, to, tokenId, data)` — Surcharge avec données optionnelles (`bytes`). Appelle `onERC721Received(operator, from, tokenId, data)` sur `to` si contrat. Même sécurité que la version sans données.

- `mintNFT(to, imageURI, title, artist)` — (onlyOwner) Crée un nouveau token pour `to` avec ses métadonnées. Revert si adresse nulle ou `imageURI` vide. Retourne le `tokenId`.
- `totalMinted()` — Nombre total de tokens créés.

- `getMetadata(tokenId)` — Retourne la struct `NFTMetadata` (name, artist, imageURI) du token.
- `tokenURI(tokenId)` — Retourne un data URI `data:application/json;base64,...` contenant le JSON des métadonnées.

---

## transferFrom vs safeTransferFrom

### `transferFrom(from, to, tokenId)`
- Transfère le token sans contrôle supplémentaire.
- **Danger** : si `to` est un contrat qui n'accepte pas les ERC-721 NFT, le token sera perdu et irrécupérable.
- **Utilisation** : transfert vers une adresse EOA (wallet utilisateur) ou un contrat de confiance.

### `safeTransferFrom(from, to, tokenId)`
- Vérifie que `to` accepte les ERC-721 NFT en appelant `onERC721Received()` sur `to`.
- Si `to` est un contrat qui n'implémente pas `onERC721Received()` ou qui refuse le transfer (retourne un sélecteur invalide), la transaction **revert** et le token ne change pas de propriétaire.
- **Avantage** : prévient les pertes de tokens accidentelles vers des contrats incompatibles.
- **Utilisation** : transfert sécurisé, particulièrement vers des adresses inconnues ou des contrats.

### `safeTransferFrom(from, to, tokenId, data)`
- Identique à la version sans `data`, mais passe des données optionnelles (`bytes`) à `onERC721Received()`.
- Utile si le contrat destinataire veut recevoir des instructions ou informations supplémentaires.
- **Exemple** : `data` pourrait contenir des paramètres pour une action du contrat après réception.

---

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

Créer un fichier `.env` (voir `.env.example`) :

```env
SEPOLIA_RPC_URL=...      # RPC Sepolia
PRIVATE_KEY=0x...        # wallet déployeur (owner)
PRIVATE_KEY_2=0x...      # second wallet (demo.js uniquement)
ETHERSCAN_API_KEY=...    # clé API Etherscan
CONTRACT_ADDRESS=0x...   # adresse après déploiement
NFT_IMAGE_URI=...        # URL IPFS de l'image
MINT_TITLE=...           # titre du NFT
MINT_ARTIST=...          # artiste
MINT_TO=0x...            # adresse de destination
```

### Commandes

```bash
npm run compile          # compile le contrat → artifacts/
npm run deploy:sepolia   # déploiement sur Sepolia (affiche l'adresse)
npm run mint             # mint un NFT
npm run demo             # démonstration complète
npm run verify:sepolia <addr>  # vérifie le source sur Etherscan
```

