// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Minimal ERC721 + on-chain metadata (no OpenZeppelin)
 * @author matth (adapted)
 * @notice Self-contained ERC-721-like implementation with Base64 metadata
 *         encoding. Contains a simple Ownable and basic ERC-721 functions
 *         sufficient for minting, reading ownerOf, tokenURI and transfer.
 */
contract TokenizeArt42 {
    // Basic ERC-721 storage
    string private _name;
    string private _symbol;

    // tokenId => owner
    mapping(uint256 => address) private _owners;
    // owner => balance
    mapping(address => uint256) private _balances;
    // tokenId => approved address
    mapping(uint256 => address) private _tokenApprovals;
    // owner => operator => approved
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Simple Ownable
    address private _ownerContract;

    // Token metadata storage
    struct NFTMetadata {
        string artist;
        string name;
        string imageURI;
    }
    mapping(uint256 => NFTMetadata) private _nftMetadata;

    uint256 private _tokenIdCounter;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event NFTMinted(address indexed to, uint256 indexed tokenId, string imageURI);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    error ZeroAddress();
    error NotOwner();
    error NotApproved();
    error TokenDoesNotExist();

    modifier onlyOwner() {
        if (msg.sender != _ownerContract) revert NotOwner();
        _;
    }

    constructor() {
        _name = "42 TokenizeArt";
        _symbol = "ART42";
        _ownerContract = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ========== Ownership ==========
    function owner() public view returns (address) {
        return _ownerContract;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(_ownerContract, newOwner);
        _ownerContract = newOwner;
    }

    // ========== ERC-721 basics ==========
    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function balanceOf(address ownerAddr) public view returns (uint256) {
        if (ownerAddr == address(0)) revert ZeroAddress();
        return _balances[ownerAddr];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address ownerAddr = _owners[tokenId];
        if (ownerAddr == address(0)) revert TokenDoesNotExist();
        return ownerAddr;
    }

    function approve(address to, uint256 tokenId) public {
        address ownerAddr = _owners[tokenId];
        if (ownerAddr == address(0)) revert TokenDoesNotExist();
        if (msg.sender != ownerAddr && !_operatorApprovals[ownerAddr][msg.sender]) revert NotApproved();
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerAddr, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address ownerAddr, address operator) public view returns (bool) {
        return _operatorApprovals[ownerAddr][operator];
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address ownerAddr = _owners[tokenId];
        return (spender == ownerAddr || _tokenApprovals[tokenId] == spender || _operatorApprovals[ownerAddr][spender]);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotApproved();
        if (_owners[tokenId] != from) revert TokenDoesNotExist();
        if (to == address(0)) revert ZeroAddress();

        // clear approvals
        delete _tokenApprovals[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // ========== Minting ==========
    /// @notice Mint a new NFT with metadata. Only contract owner.
    function mintNFT(address to, string memory imageURI, string memory title, string memory artist) public onlyOwner returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (bytes(imageURI).length == 0) revert TokenDoesNotExist();

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _owners[tokenId] = to;
        _balances[to] += 1;

        _nftMetadata[tokenId] = NFTMetadata({artist: artist, name: title, imageURI: imageURI});

        emit Transfer(address(0), to, tokenId);
        emit NFTMinted(to, tokenId, imageURI);

        return tokenId;
    }

    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // ========== Metadata (tokenURI) ==========
    function getMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _nftMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        NFTMetadata memory meta = _nftMetadata[tokenId];

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{',
                '"name":"', meta.name, '",',
                '"description":"NFT cree dans le cadre du projet TokenizeArt a lEcole 42. Artiste : ', meta.artist, '.",',
                '"image":"', meta.imageURI, '",',
                '"attributes":[',
                    '{"trait_type":"Artist","value":"', meta.artist, '"},',
                    '{"trait_type":"School","value":"42"},',
                    '{"trait_type":"Token ID","value":"', _toString(tokenId), '"},',
                    '{"trait_type":"Blockchain","value":"Sepolia"}',
                ']',
            '}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // ========== Utilities ==========
    function _toString(uint256 value) internal pure returns (string memory) {
        // Inspired from OpenZeppelin's toString
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

/// @notice Minimal Base64 library (encode only)
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encode bytes to Base64 string
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        bytes memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        bytes memory result = new bytes(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for { let i := 0 } lt(i, mload(data)) { } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(input, 0x3F))))

                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }

            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
