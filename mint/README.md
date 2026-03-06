# Mint du NFT TokenizeArt42

## Prérequis
- Le contrat doit être **déployé** (voir `../deployment/README.md`)
- Ton image doit être **uploadée sur IPFS** (voir le GUIDE.md)
- Tu dois avoir l'adresse du contrat et le CID IPFS

---

## Méthode 1 — Remix IDE (recommandée)

### Étape 1 : Uploader l'image sur IPFS via Pinata
1. Va sur **https://pinata.cloud/** et crée un compte gratuit
2. Clique **"Upload"** → **"File"**
3. Sélectionne ton image (PNG/JPG/SVG contenant le nombre 42)
4. Après l'upload, note le **CID** (ex: `QmXxxx...`)
5. Ton image est accessible via : `ipfs://QmXxxx...`

### Étape 2 : Minter via Remix
1. Ouvre **https://remix.ethereum.org/**
2. Dans **"Deploy & Run Transactions"**, retrouve ton contrat déployé
   - Si tu ne l'as plus : colle l'adresse dans "At Address" et clique le bouton
3. Dans la section du contrat, trouve la fonction **`mintNFT`**
4. Remplis les champs :
   - `to` : ton adresse MetaMask (ex: `0xAbC123...`)
   - `imageURI` : `ipfs://TON_CID` (ex: `ipfs://QmXxxx...`)
5. Clique **"transact"**
6. Confirme dans MetaMask

### Étape 3 : Vérifier la propriété
1. Dans Remix, appelle la fonction **`ownerOf`**
2. Entre `0` (premier token)
3. La réponse doit être ton adresse MetaMask ✅

---

## Méthode 2 — Script Hardhat automatisé

### Prérequis
```bash
cd mint
npm install
```

### Configuration
Édite `mint.js` et remplis les 3 variables en haut du fichier :
```js
const CONTRACT_ADDRESS = "0xTON_ADRESSE_CONTRAT";  // Après déploiement
const IMAGE_IPFS_URI   = "ipfs://TON_CID";          // Après upload Pinata
const RECIPIENT_ADDRESS = "0xTON_WALLET";           // Ton adresse MetaMask
```

### Lancement
```bash
npm run mint:testnet
```

Le script affiche :
- Le **Token ID** du NFT minté
- Le **propriétaire** (ton adresse)
- Le lien **BscScan** pour vérifier

---

## Vérifications post-mint

### Sur BscScan
1. Va sur `https://testnet.bscscan.com/address/TON_CONTRAT`
2. Onglet **"NFT Transfers"** → tu dois voir ton mint

### Appeler ownerOf
Dans Remix ou via script :
```
ownerOf(0) → doit retourner ton adresse MetaMask
```

### Lire les métadonnées
```
getMetadata(0) → retourne {artist, name, imageURI}
tokenURI(0)    → retourne le JSON encodé en Base64
```
