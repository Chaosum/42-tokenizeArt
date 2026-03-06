// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
// Imports OpenZeppelin - bibliothèque de contrats sécurisés
// ============================================================
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// ERC721     : implémentation standard du token non-fongible
import "@openzeppelin/contracts/access/Ownable.sol";
// Ownable    : restreint certaines fonctions au propriétaire du contrat
import "@openzeppelin/contracts/utils/Base64.sol";
// Base64     : encode les métadonnées JSON directement on-chain (bonus)
import "@openzeppelin/contracts/utils/Strings.sol";
// Strings    : convertit uint256 en string pour le JSON

/**
 * @title  TokenizeArt42
 * @author matth (Projet 42 x BNB Chain — TokenizeArt)
 * @notice Contrat NFT ERC-721 / BEP-721 pour le projet TokenizeArt.
 *         Chaque token représente une œuvre d'art numérique unique.
 *         Les métadonnées (nom, artiste, image) sont encodées on-chain
 *         en Base64 JSON, ce qui rend le NFT totalement auto-suffisant.
 * @dev    Hérite de ERC721 (standard NFT) et Ownable (contrôle d'accès).
 *         Déployé sur BNB Smart Chain Testnet (Chain ID : 97).
 */
contract TokenizeArt42 is ERC721, Ownable {

    // ============================================================
    // VARIABLES D'ÉTAT
    // ============================================================

    /**
     * @dev Compteur interne pour générer les token IDs.
     *      Le premier NFT minté aura l'ID 0, le deuxième l'ID 1, etc.
     */
    uint256 private _tokenIdCounter;

    /**
     * @dev Structure qui contient les métadonnées propres à chaque NFT.
     *      - artist   : le login 42 de l'auteur (obligatoire selon le sujet)
     *      - name     : le titre du NFT (doit contenir "42")
     *      - imageURI : l'adresse IPFS de l'image (ex: ipfs://CID...)
     */
    struct NFTMetadata {
        string artist;
        string name;
        string imageURI;
    }

    /**
     * @dev Mapping : token ID => métadonnées.
     *      Permet de retrouver les métadonnées à partir de l'ID du token.
     */
    mapping(uint256 => NFTMetadata) private _nftMetadata;

    // ============================================================
    // ÉVÉNEMENTS
    // ============================================================

    /**
     * @dev Émis à chaque mint d'un nouveau NFT.
     *      Les events sont enregistrés dans la blockchain et permettent
     *      de suivre l'activité du contrat (visible sur BscScan).
     * @param to       Adresse du receveur du NFT
     * @param tokenId  ID du token créé
     * @param imageURI URI IPFS de l'image
     */
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string imageURI
    );

    // ============================================================
    // CONSTRUCTEUR
    // ============================================================

    /**
     * @dev Le constructeur est exécuté UNE SEULE FOIS lors du déploiement.
     *      Il initialise :
     *      - ERC721("42 TokenizeArt", "ART42") : nom et symbole de la collection
     *      - Ownable(msg.sender)               : le deployer devient propriétaire
     */
    constructor() ERC721("42 TokenizeArt", "ART42") Ownable(msg.sender) {}

    // ============================================================
    // FONCTIONS PRINCIPALES
    // ============================================================

    /**
     * @notice  Mint (crée) un nouveau NFT et l'envoie à l'adresse spécifiée.
     * @dev     Seul le propriétaire du contrat peut appeler cette fonction.
     *          Le modificateur `onlyOwner` (d'Ownable) protège cette fonction.
     * @param   to        Adresse qui recevra le NFT (généralement ton wallet)
     * @param   imageURI  URI IPFS de l'image (format : "ipfs://CID...")
     * @return  tokenId   L'ID du token nouvellement créé
     */
    function mintNFT(address to, string memory imageURI)
        public
        onlyOwner
        returns (uint256)
    {
        // Vérifications de sécurité
        require(to != address(0), "Impossible de minter vers l'adresse zero");
        require(bytes(imageURI).length > 0, "L'URI de l'image ne peut pas etre vide");

        // Attribution de l'ID et incrémentation du compteur
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint du token : _safeMint vérifie que le receveur peut accepter un NFT
        _safeMint(to, tokenId);

        // Enregistrement des métadonnées on-chain
        // ⚠️ REMPLACE "matth" par ton vrai login 42 avant de déployer !
        _nftMetadata[tokenId] = NFTMetadata({
            artist: "matth",
            name: "42 - The Enchanted Realm",
            imageURI: imageURI
        });

        // Émission de l'événement (visible sur BscScan)
        emit NFTMinted(to, tokenId, imageURI);

        return tokenId;
    }

    // ============================================================
    // FONCTIONS DE LECTURE (VIEW)
    // ============================================================

    /**
     * @notice  Retourne les métadonnées d'un token.
     * @dev     Fonction de lecture, ne coûte pas de gas si appelée off-chain.
     * @param   tokenId  L'ID du token à interroger
     * @return  NFTMetadata struct {artist, name, imageURI}
     */
    function getMetadata(uint256 tokenId)
        public
        view
        returns (NFTMetadata memory)
    {
        require(
            _ownerOf(tokenId) != address(0),
            "Ce token n'existe pas"
        );
        return _nftMetadata[tokenId];
    }

    /**
     * @notice  Retourne le nombre total de NFT mintés.
     * @return  Le nombre de tokens créés depuis le déploiement du contrat
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice  Génère et retourne les métadonnées du token au format JSON
     *          encodé en Base64, directement on-chain.
     * @dev     Override de la fonction tokenURI de ERC721.
     *          Le format retourné est : "data:application/json;base64,..."
     *          Ce format est reconnu par OpenSea, MetaMask, et tous les
     *          explorateurs NFT, sans avoir besoin d'un serveur externe.
     * @param   tokenId  L'ID du token
     * @return  Une string contenant les métadonnées JSON encodées en Base64
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _ownerOf(tokenId) != address(0),
            "Ce token n'existe pas"
        );

        NFTMetadata memory meta = _nftMetadata[tokenId];

        // Construction du JSON des métadonnées
        // Format standard OpenSea/EIP-721 Metadata Standard
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{',
                            '"name": "', meta.name, '",',
                            '"description": "NFT cree dans le cadre du projet TokenizeArt a lEcole 42. Artiste : ', meta.artist, '.",',
                            '"image": "', meta.imageURI, '",',
                            '"attributes": [',
                                '{"trait_type": "Artist", "value": "', meta.artist, '"},',
                                '{"trait_type": "School", "value": "42"},',
                                '{"trait_type": "Token ID", "value": "', Strings.toString(tokenId), '"},',
                                '{"trait_type": "Blockchain", "value": "BNB Smart Chain"}',
                            ']',
                        '}'
                    )
                )
            )
        );

        // Retour au format data URI (pas besoin de serveur externe)
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // ============================================================
    // NOTE : ownerOf(tokenId) est HÉRITÉ de ERC721
    // ============================================================
    // Tu peux appeler ownerOf(0) pour obtenir le propriétaire du token #0.
    // Cette fonction est requise par le sujet et est déjà disponible.
    // Exemple Remix : appelle ownerOf(0) → retourne l'adresse du propriétaire.
}
