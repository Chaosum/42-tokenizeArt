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
ETHERSCAN_API_KEY=...    # clé API Etherscan (pour la vérification)
CONTRACT_ADDRESS=0x...   # adresse du contrat déployé
NFT_IMAGE_URI=...        # URL de l'image à minter
MINT_TITLE=...           # titre du NFT
MINT_ARTIST=...          # nom de l'artiste
MINT_TO=0x...            # adresse de destination du mint
```


### Commandes

```bash
npm run compile                 # compile le contrat → artifacts/
npm run deploy:sepolia          # déploiement sur Sepolia (affiche l'adresse)
npm run verify:sepolia          # vérifie le source sur Etherscan (utilise CONTRACT_ADDRESS du .env)
npm run mint                    # mint un NFT
npm run demo                    # démonstration complète
```

---

## Vérification Etherscan

La vérification publie le code source sur Etherscan pour permettre une lecture publique du contrat.

**Prérequis** : 
- avoir une clé API Etherscan dans `.env` sous `ETHERSCAN_API_KEY`
- avoir l'adresse du contrat déployé dans `.env` sous `CONTRACT_ADDRESS`

**Commande** :
```bash
npm run verify:sepolia
```

Le script lit automatiquement `CONTRACT_ADDRESS` depuis votre `.env` et lance la vérification.

**Points importants** :
- Le contrat doit être vérifié **avec exactement les mêmes settings de compilation** que lors du déploiement (`viaIR`, `optimizer`, version Solidity).
- Toute modification du source après déploiement rendra la vérification impossible sur l'ancienne adresse — il faut redéployer.
- La config `etherscan.apiKey` doit être une **string simple** (API v2), pas un objet par réseau.
---

## Mint

Le script `mint/upload-and-mint.js` lit les paramètres depuis `.env` :

```bash
npx hardhat run mint/upload-and-mint.js --network sepolia
```

Il affiche le `tokenId` du NFT minté. Pour lire les métadonnées on-chain :

```js
const uri = await contract.tokenURI(0); // "data:application/json;base64,..."
const json = Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString();
console.log(JSON.parse(json));
```


