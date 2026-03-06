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
