# Déploiement et utilisation — TokenizeArt42

Ce document explique comment déployer et utiliser le contrat `TokenizeArt42` localement et sur Sepolia (ou BSC Testnet). Il couvre les variables d'environnement nécessaires, les commandes et les points de vigilance.

Pré-requis
- Node >= 18 recommandé
- npm
- Un account wallet (clé privée) avec des fonds pour le réseau ciblé (Sepolia / BSC Testnet) si tu déploies sur testnet.

Variables d'environnement
Crée `.env` à la racine et définis :

- `SEPOLIA_RPC_URL` — URL RPC pour Sepolia (ex: Infura, Alchemy)
- `BSC_TESTNET_RPC` — (optionnel) RPC BSC Testnet
- `PRIVATE_KEY` — clé privée du deployer (0x...)
- `PRIVATE_KEY_2` — (optionnel) clé d'un second wallet pour demo
- `NFT_STORAGE_API_KEY` — clé pour `nft.storage` (upload d'images)
- `CONTRACT_ADDRESS` — adresse du contrat déployé (utilisé par scripts d'interaction si disponible)

Installer les dépendances

```bash
npm install
```

Compilation

```bash
npx hardhat compile
```

Déploiement local (Hardhat node)

1. Lancer un nœud local :

```bash
npx hardhat node
```

2. Dans un autre terminal, déployer :

```bash
npx hardhat run deployment/deploy.js --network localhost
```

Le script affichera l'adresse du contrat déployé — copie cette adresse dans `.env` si tu veux l'utiliser avec d'autres scripts.

Exécution d'un test complet local (deploy + mint + lecture)

```bash
npx hardhat run deployment/test-run.js --network localhost
```

Déploiement sur Sepolia

1. Assure-toi d'avoir un compte avec suffisamment d'ETH sur Sepolia (faucet) et un RPC URL.
2. Dans `.env` :

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<PROJECT_ID>
PRIVATE_KEY=0x... (adress fundée)
```

3. Déployer :

```bash
npm run deploy:sepolia
```

Ou directement :

```bash
npx hardhat run deployment/deploy.js --network sepolia
```

Après déploiement, copie l'adresse du contrat (affichée en console) dans `CONTRACT_ADDRESS` de `.env`.

Utiliser `deployment/demo.js`
- `deployment/demo.js` est un script d'exemple qui : affiche comptes, déploie ou se connecte à un contrat existant, tente un mint et affiche `tokenURI` / `getMetadata`.
- Modifie la constante d'adresse dans le fichier ou mets `CONTRACT_ADDRESS` dans `.env` pour que le script se connecte au bon contrat.

Uploader une image et mint (nft.storage)

1. Assure-toi d'avoir `NFT_STORAGE_API_KEY` dans `.env`.
2. Exécute :

```bash
node code/scripts/upload-and-mint.js ./assets/42dofusNFT.png "Titre" "Artiste" 0xDestinataire
```

Le script retournera l'URI IPFS et enverra la transaction de mint.

Points de vigilance / dépannage
- Insufficient funds : si ta clé privée n'a pas de fonds sur le réseau ciblé, la transaction échouera. Pour Sepolia, utilise un faucet.
- Invalid accounts in Hardhat config : si `PRIVATE_KEY` n'est absent, la configuration `accounts` peut déclencher une erreur; la config du projet protège contre cela (utilise `undefined` si clé absente).
- tokenURI decoding error : si `tokenURI` provoque une erreur ABI/UTF‑8 client, lis `getMetadata(tokenId)` pour récupérer `imageURI` et les autres champs.
- Compatibilité marketplaces : le contrat est minimal ; certaines plateformes attendent `safeTransferFrom` / ERC165. Pour listage public, implémente ces interfaces.

Vérifier une transaction
- Utilise `npx hardhat console --network sepolia` pour interagir manuellement.
- Ou bien, pour voir la tx hash et la receipt : garde le hash retourné par le script et utilise un explorateur (etherscan pour Sepolia) ou `provider.getTransactionReceipt(hash)`.

Suivi et amélioration
- Pour rendre le contrat production‑ready : ajouter ERC165, `safeTransferFrom`, tests unitaires (Hardhat + mocha), et restreindre `mintNFT` à un rôle/minter.
