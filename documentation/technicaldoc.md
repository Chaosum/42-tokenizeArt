## Fonctions publiques

- name() — Retourne le nom du token ("Mat42Coin").
- symbol() — Retourne le ticker ("M42").
- decimals() — Nombre de décimales (18).
- totalSupply() — Supply totale en circulation.
- balanceOf(account) — Solde de `account`.
- allowance(owner, spender) — Montant que `spender` peut dépenser pour `owner`.

- transfer(recipient, amount) — Envoie `amount` du compte appelant à `recipient`. Revert si solde insuffisant ou adresse nulle. Émet `Transfer`.

- approve(spender, amount) — Autorise `spender` à dépenser `amount`. Émet `Approval`.

- transferFrom(sender, recipient, amount) — Déplace des fonds depuis `sender` vers `recipient` en consommant une allowance.

- mint(to, amount) — (onlyOwner) Crée des tokens pour `to`. Revert si dépasse `MAX_SUPPLY`.

- burn(amount) — Détruit `amount` du solde de l'appelant.

- owner() — Retourne l'adresse du propriétaire.

- transferOwnership(newOwner) — (onlyOwner) Transfère la propriété.

- renounceOwnership() — (onlyOwner) Renonce à la propriété (owner = 0).

---

## Fonctions internes

- _transfer(sender, recipient, amount) — logique de transfert et validation.
- _mint(to, amount) — augmente `_totalSupply` et le solde de `to`.
- _burn(from, amount) — décrémente `_balances[from]` et `_totalSupply`.
- _approve(owner, spender, amount) — met à jour `_allowances`.

## Events importants

- Transfer(from, to, value)
## Documentation technique — TokenizeArt42 (contrat NFT)

Ce document décrit les fonctions publiques, événements et erreurs définis dans `code/TokenizeArt42.sol` (implémentation minimale de type ERC‑721 sans OpenZeppelin). Il explique les paramètres, les sorties, les cas limites et les considérations de sécurité/gaz.

Résumé rapide des choix de conception
- Pas d'OpenZeppelin : objectif de fournir une implémentation autonome et pédagogique. Cela réduit les dépendances mais demande prudence pour la sécurité et la compatibilité ERC‑721 complète (p.ex. ERC165 ou `safeTransferFrom` n'est pas implémenté).
- Métadonnées : stockées on‑chain dans une struct simple (artist, name, imageURI). `tokenURI(uint256)` renvoie un data:application/json;base64,... construit on‑chain. Un accessor `getMetadata(uint256)` retourne directement les champs (plus sûr pour les clients qui rencontrent des problèmes de décodage).

-- Contrat : TokenizeArt42

Événements principaux
- event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
- event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
- event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
- event NFTMinted(address indexed to, uint256 indexed tokenId)
- event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)

Erreurs personnalisées (revert) — exemples
- error ZeroAddress(); // adresse nulle fournie
- error NotOwner(); // appel réservé au propriétaire
- error NotApproved(); // pas approuvé pour l'action
- error TokenDoesNotExist(uint256 tokenId);

Storage essentiel
- mapping(uint256 => address) private _owners
- mapping(address => uint256) private _balances
- mapping(uint256 => address) private _tokenApprovals
- mapping(address => mapping(address => bool)) private _operatorApprovals
- mapping(uint256 => NFTMetadata) private _nftMetadata
- uint256 private _tokenIdCounter
- address private _ownerContract

Struct NFTMetadata
- string artist
- string name
- string imageURI

Fonctions publiques (détaillées)

constructor(string memory name_, string memory symbol_)
- Rôle : initialise le nom/symbole du contrat et définit l'adresse du propriétaire (msg.sender).
- Inputs : `name_`, `symbol_` (utilisés par `name()` et `symbol()`).
- Effet : stocke `owner = msg.sender`, `name` et `symbol`.

owner() -> address
- Rôle : retourne l'adresse propriétaire du contrat.
- Sortie : adresse du propriétaire.

transferOwnership(address newOwner) (onlyOwner)
- Rôle : transfère la propriété du contrat.
- Revert si `newOwner` == address(0) (ZeroAddress).
- Émet `OwnershipTransferred(previousOwner, newOwner)`.

name() -> string
- Rôle : retourne le nom du token (défini à la construction).

symbol() -> string
- Rôle : retourne le symbole/ticker du token.

balanceOf(address account) -> uint256
- Rôle : retourne le nombre de tokens possédés par `account`.
- Revert si `account` == address(0) (ZeroAddress).

ownerOf(uint256 tokenId) -> address
- Rôle : retourne le propriétaire du token `tokenId`.
- Revert avec `TokenDoesNotExist(tokenId)` si le token n'existe pas.

approve(address to, uint256 tokenId)
- Rôle : autorise `to` à transférer `tokenId`.
- Revert si `msg.sender` n'est ni le propriétaire ni un opérateur approuvé.
- Met à jour `_tokenApprovals[tokenId] = to` et émet `Approval(owner, to, tokenId)`.

getApproved(uint256 tokenId) -> address
- Rôle : retourne l'adresse approuvée pour `tokenId`.
- Revert si `tokenId` n'existe pas.

setApprovalForAll(address operator, bool approved)
- Rôle : définit ou révoque une approbation globale pour `operator`.
- Met à jour `_operatorApprovals[msg.sender][operator]` et émet `ApprovalForAll`.

isApprovedForAll(address owner_, address operator) -> bool
- Rôle : indique si `operator` est approuvé globalement par `owner_`.

transferFrom(address from, address to, uint256 tokenId)
- Rôle : transfère `tokenId` de `from` vers `to`.
- Revert si `to` == address(0) (ZeroAddress) ou si `tokenId` n'existe pas.
- Revert si `msg.sender` n'est ni `from`, ni approuvé pour ce token, ni opérateur approuvé.
- Effets : met à jour `_balances`, `_owners`, supprime l'approbation (`_tokenApprovals[tokenId]=address(0)`), émet `Transfer(from,to,tokenId)`.
- Note : `safeTransferFrom` (avec check ERC721Receiver) n'est pas implémenté ici ; utiliser avec prudence pour tokens destinés à contrats.

mintNFT(address to, string memory imageURI, string memory title, string memory artist) -> uint256 tokenId
- Rôle : fabrique (mint) un nouveau NFT et l'assigne à `to`.
- Inputs :
	- `to` : adresse destinataire (non nulle)
	- `imageURI` : URI de l'image (p.ex. `ipfs://Qm...`) ou url HTTP
	- `title` : nom du NFT
	- `artist` : nom de l'artiste
- Effets :
	- Incrémente `_tokenIdCounter` et assigne `tokenId`.
	- `_owners[tokenId] = to`, `_balances[to]++`.
	- Stocke `_nftMetadata[tokenId] = NFTMetadata(artist, title, imageURI)`.
	- Émet `NFTMinted(to, tokenId)` et `Transfer(address(0), to, tokenId)`.
- Retourne : le nouvel `tokenId` (uint256).
- Autorisation : dans l'implémentation actuelle, la fonction est publique — selon les besoins, on peut la restreindre (onlyOwner / minter role).

totalMinted() -> uint256
- Rôle : retourne la valeur actuelle de `_tokenIdCounter` (nombre total mintés).

getMetadata(uint256 tokenId) -> (string name, string artist, string imageURI)
- Rôle : lecteur fiable des métadonnées stockées on‑chain.
- Sorties : `name`, `artist`, `imageURI`.
- Revert si `tokenId` n'existe pas.

tokenURI(uint256 tokenId) -> string
- Rôle : construit et retourne un data URI JSON encodé en Base64 :
	data:application/json;base64,<base64(json)>
- Contenu JSON typique : { "name": ..., "description": ..., "image": "<imageURI>" }
- Attention : l'implémentation Base64 est écrite en Solidity (assembly) ; certains clients (ethers) peuvent échouer à décoder le string retourné à cause d'un caractère non‑UTF8 produit par l'encodage on‑chain. Si tu rencontres une erreur ABI/UTF‑8, utiliser `getMetadata(tokenId)` pour lire directement `imageURI`.

Fonctions utilitaires internes
- _toString(uint256) : conversion uint256 -> string (utilisé pour construire JSON)
- Base64.encode(bytes) : implémentation interne pour construire `tokenURI`.

Considérations de sécurité et limitations
- Compatibilité ERC‑721 : cette implémentation couvre l'essentiel (ownerOf, transferFrom, approval), mais n'implémente pas ERC165 ni `safeTransferFrom`. Les marchés/contrats qui exigent `safeTransferFrom` ou ERC165 peuvent ne pas reconnaître totalement ce token.
- Approvals : logique d'approval et d'opérateur est présente, mais attention aux edge cases (approbation d'une adresse nulle, suppression correcte d'approbations après transfert).
- Métadonnées on‑chain : plus coûteux en gaz mais immuable et résilient. L'alternative est de stocker seulement un `tokenURI` pointant vers IPFS.
- Base64 on‑chain : le résultat doit être compatible UTF‑8 pour qu'un client JS l'interprète sans erreur. Si l'ABI call échoue, lire `getMetadata` comme workaround.
- Autorisations de mint : actuellement `mintNFT` est publique (implémentation par défaut). Pour un projet réel, restreindre l'accès à une adresse minter/owner ou utiliser un mécanisme de signature off‑chain.

Gas et optimisation
- Stocker des strings on‑chain est cher. Préférer pointer vers IPFS (imageURI ipfs://CID) et garder le JSON à l'extérieur si tu veux réduire coûts.
- Le compteur `_tokenIdCounter` est un simple uint256 : minting séquentiel est économique.

Edge cases testés
- Mint à address(0) doit revert.
- getMetadata/ownerOf sur token inexistant doit revert.
- transferFrom par un non‑propriétaire non‑approuvé doit revert.

Recommandations pour prochaines itérations
- Ajouter `safeTransferFrom` et ERC165 pour meilleure compatibilité.
- Remplacer l'encodage Base64 on‑chain par un tokenURI qui pointe vers IPFS, ou corriger/valider l'encodeur Base64 pour garantir un résultat ASCII sûr.
- Ajouter des rôles (minter/admin) plutôt que rendre `mintNFT` totalement publique.

---

Si tu veux que je génère aussi un fichier Markdown listant toutes les signatures exactement (avec types et visibilité) ou des exemples de tests unitaires (Hardhat + mocha/ethers), je peux l'ajouter ici.

