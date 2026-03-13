// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";

// Minimal IERC721Receiver interface used by safeTransferFrom checks
/// @title Minimal ERC721 receiver interface
/// @notice Used to detect safe transfers to contracts
interface IERC721Receiver {
    /// @notice Handle the receipt of an NFT
    /// @dev The contract must return `0x150b7a02` to accept the transfer
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

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
    /// @dev Emitted when `tokenId` token is transferred from `from` to `to`.
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    /// @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    /// @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all their assets.
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    /// @dev Emitted when a new NFT is minted to `to` with `tokenId` and imageURI.
    event NFTMinted(address indexed to, uint256 indexed tokenId, string imageURI);
    /// @dev Emitted when contract ownership is transferred.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Errors
    /// @dev Revert when an address argument is the zero address
    error ZeroAddress();
    /// @dev Revert when caller is not the contract owner
    error NotOwner();
    /// @dev Revert when caller is not approved nor owner for a token operation
    error NotApproved();
    /// @dev Revert when querying or operating on a non-existent token
    error TokenDoesNotExist();

    modifier onlyOwner() {
        /// @dev Restrict access to the contract owner
        if (msg.sender != _ownerContract) revert NotOwner();
        _;
    }

    /**
     * @dev Contract constructor sets token name/symbol and the deployer as owner.
     */
    constructor() {
        _name = "42 TokenizeArt";
        _symbol = "ART42";
        _ownerContract = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ========== Ownership ==========
    /**
     * @notice Returns the owner of the contract (admin)
     */
    function owner() public view returns (address) {
        return _ownerContract;
    }

    /**
     * @notice Transfer ownership of the contract to `newOwner`.
     * @dev Only callable by current owner.
     * @param newOwner the address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(_ownerContract, newOwner);
        _ownerContract = newOwner;
    }

    // ========== ERC-721 basics ==========
    /**
     * @notice Query if a contract implements an interface
     * @dev Implements ERC165. Returns true for ERC165, ERC721 and ERC721Metadata ids.
     */
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        // ERC165: 0x01ffc9a7
        // ERC721: 0x80ac58cd
        // ERC721Metadata: 0x5b5e139f
        return (
            interfaceId == 0x01ffc9a7 ||
            interfaceId == 0x80ac58cd ||
            interfaceId == 0x5b5e139f
        );
    }

    /// @notice Returns token collection name
    function name() public view returns (string memory) {
        return _name;
    }

    /// @notice Returns token collection symbol
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /// @notice Returns number of tokens owned by `ownerAddr`
    function balanceOf(address ownerAddr) public view returns (uint256) {
        if (ownerAddr == address(0)) revert ZeroAddress();
        return _balances[ownerAddr];
    }

    /// @notice Returns owner of `tokenId`
    function ownerOf(uint256 tokenId) public view returns (address) {
        address ownerAddr = _owners[tokenId];
        if (ownerAddr == address(0)) revert TokenDoesNotExist();
        return ownerAddr;
    }

    /**
     * @notice Approve `to` to transfer `tokenId`.
     * @dev Caller must be owner or operator.
     */
    function approve(address to, uint256 tokenId) public {
        address ownerAddr = _owners[tokenId];
        if (ownerAddr == address(0)) revert TokenDoesNotExist();
        if (msg.sender != ownerAddr && !_operatorApprovals[ownerAddr][msg.sender]) revert NotApproved();
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerAddr, to, tokenId);
    }

    /// @notice Returns approved address for `tokenId`
    function getApproved(uint256 tokenId) public view returns (address) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _tokenApprovals[tokenId];
    }

    /**
     * @notice Set or unset `operator` as an operator for caller
     */
    function setApprovalForAll(address operator, bool approved) public {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /// @notice Returns whether `operator` is approved to manage all of `ownerAddr`'s tokens
    function isApprovedForAll(address ownerAddr, address operator) public view returns (bool) {
        return _operatorApprovals[ownerAddr][operator];
    }

    /// @dev Returns whether `spender` is allowed to manage `tokenId`
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address ownerAddr = _owners[tokenId];
        return (spender == ownerAddr || _tokenApprovals[tokenId] == spender || _operatorApprovals[ownerAddr][spender]);
    }

    /**
     * @notice Transfer `tokenId` token from `from` to `to`.
     * @dev Caller must be owner, approved, or operator.
     */
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

    // IERC721Receiver interface selector
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    

    /**
     * @notice Safely transfers `tokenId` token from `from` to `to`.
     * @dev If `to` is a contract, calls `onERC721Received` and reverts if it doesn't return the expected selector.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, "") returns (bytes4 retval) {
                if (retval != _ERC721_RECEIVED) revert NotApproved();
            } catch {
                revert NotApproved();
            }
        }
    }

    /**
     * @notice Safely transfers `tokenId` token from `from` to `to` with additional `data`.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                if (retval != _ERC721_RECEIVED) revert NotApproved();
            } catch {
                revert NotApproved();
            }
        }
    }

    // ========== Minting ==========
    /**
     * @notice Mint a new NFT to `to` with given metadata.
     * @dev Only callable by contract owner. Stores metadata on-chain.
     * @return tokenId the newly minted token id.
     */
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

    /// @notice Returns the total number of tokens minted so far
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // ========== Metadata (tokenURI) ==========
    /// @notice Returns metadata struct for `tokenId`
    function getMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _nftMetadata[tokenId];
    }

    /**
     * @notice Returns a data:application/json;base64 encoded token metadata JSON for `tokenId`.
     * @dev Some clients may fail to decode long data URIs; `getMetadata` is a safer alternative.
     */
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
