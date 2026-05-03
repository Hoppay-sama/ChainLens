// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProductRegistry
 * @notice Manages the registration and metadata of supply chain products.
 * @dev Stores product details on-chain with references to off-chain IPFS metadata.
 */
contract ProductRegistry {
    struct Product {
        bytes32 productId;
        address manufacturer;
        string name;
        string description;
        string metadataURI;
        uint256 timestamp;
    }

    mapping(bytes32 => Product) public products;
    mapping(address => bytes32[]) public manufacturerProducts;
    uint256 public totalProducts;

    /**
     * @notice Emitted when a new product is registered.
     * @param productId The unique product identifier.
     * @param manufacturer The address of the registering manufacturer.
     * @param name The human-readable product name.
     * @param timestamp The block timestamp of registration.
     */
    event ProductRegistered(
        bytes32 indexed productId,
        address indexed manufacturer,
        string name,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a product's metadata URI is updated.
     * @param productId The unique product identifier.
     * @param metadataURI The new metadata URI.
     */
    event ProductMetadataUpdated(
        bytes32 indexed productId,
        string metadataURI
    );

    error InvalidProductId();
    error EmptyName();
    error ProductAlreadyExists();
    error ProductNotFound();
    error NotManufacturer();

    /**
     * @notice Register a new product.
     * @param productId Unique identifier for the product.
     * @param name Human-readable product name.
     * @param description Product description.
     * @param metadataURI URI pointing to off-chain metadata (e.g., IPFS).
     */
    function registerProduct(
        bytes32 productId,
        string calldata name,
        string calldata description,
        string calldata metadataURI
    ) external {
        if (productId == bytes32(0)) revert InvalidProductId();
        if (bytes(name).length == 0) revert EmptyName();
        if (products[productId].timestamp != 0) revert ProductAlreadyExists();

        products[productId] = Product({
            productId: productId,
            manufacturer: msg.sender,
            name: name,
            description: description,
            metadataURI: metadataURI,
            timestamp: block.timestamp
        });

        manufacturerProducts[msg.sender].push(productId);
        unchecked {
            totalProducts++;
        }

        emit ProductRegistered(productId, msg.sender, name, block.timestamp);
    }

    /**
     * @notice Retrieve product details.
     * @param productId The product identifier.
     * @return Product struct containing all stored data.
     */
    function getProduct(bytes32 productId) external view returns (Product memory) {
        if (products[productId].timestamp == 0) revert ProductNotFound();
        return products[productId];
    }

    /**
     * @notice Get all product IDs registered by a manufacturer.
     * @param manufacturer The manufacturer address.
     * @return Array of product IDs.
     */
    function getProductsByManufacturer(address manufacturer) external view returns (bytes32[] memory) {
        return manufacturerProducts[manufacturer];
    }

    /**
     * @notice Check whether a product has been registered.
     * @param productId The product identifier.
     * @return True if registered, false otherwise.
     */
    function isProductRegistered(bytes32 productId) external view returns (bool) {
        return products[productId].timestamp != 0;
    }

    /**
     * @notice Get the manufacturer address for a product.
     * @param productId The product identifier.
     * @return The manufacturer address.
     */
    function getProductManufacturer(bytes32 productId) external view returns (address) {
        if (products[productId].timestamp == 0) revert ProductNotFound();
        return products[productId].manufacturer;
    }

    /**
     * @notice Update the metadata URI for a product.
     * @dev Only the original manufacturer can update metadata.
     * @param productId The product identifier.
     * @param newMetadataURI New URI pointing to off-chain metadata.
     */
    function updateProductMetadata(bytes32 productId, string calldata newMetadataURI) external {
        Product storage product = products[productId];
        if (product.timestamp == 0) revert ProductNotFound();
        if (product.manufacturer != msg.sender) revert NotManufacturer();

        product.metadataURI = newMetadataURI;

        emit ProductMetadataUpdated(productId, newMetadataURI);
    }
}
