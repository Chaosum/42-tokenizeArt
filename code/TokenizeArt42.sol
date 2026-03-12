// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title TokenizeArt42
 * @author mservage
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
        string name;
        string artist;
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
    function mintNFT(address to, string memory imageURI, string memory title, string memory artist) public onlyOwner returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (bytes(imageURI).length == 0) revert TokenDoesNotExist();

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _owners[tokenId] = to;
        _balances[to] += 1;

        _nftMetadata[tokenId] = NFTMetadata({name: title, artist: artist, imageURI: imageURI});

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
                '"artist":"', meta.artist, '",',
                '"image":"', meta.imageURI, '"',
            '}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

}
