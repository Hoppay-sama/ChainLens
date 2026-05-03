// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IProductRegistry
 * @notice Minimal interface for ProductRegistry interactions.
 */
interface IProductRegistry {
    function isProductRegistered(bytes32 productId) external view returns (bool);
    function getProductManufacturer(bytes32 productId) external view returns (address);
}

/**
 * @title ShipmentTracker
 * @notice Tracks the custody and delivery status of registered products.
 * @dev Integrates with ProductRegistry to ensure only valid products are tracked.
 */
contract ShipmentTracker {
    enum Status {
        Created,
        InTransit,
        AtCheckpoint,
        Delivered
    }

    struct Checkpoint {
        bytes32 productId;
        string location;
        Status status;
        address handler;
        uint256 timestamp;
        string notes;
    }

    IProductRegistry public productRegistry;

    mapping(bytes32 => Checkpoint[]) public productHistory;
    mapping(bytes32 => address) public currentHandler;
    mapping(bytes32 => bool) public delivered;

    /**
     * @notice Emitted when a checkpoint is recorded.
     * @param productId The product identifier.
     * @param location The checkpoint location.
     * @param status The shipment status.
     * @param handler The address recording the checkpoint.
     * @param timestamp The block timestamp.
     * @param notes Optional notes.
     */
    event CheckpointRecorded(
        bytes32 indexed productId,
        string location,
        Status status,
        address indexed handler,
        uint256 timestamp,
        string notes
    );

    /**
     * @notice Emitted when custody is transferred to a new handler.
     * @param productId The product identifier.
     * @param from The previous handler.
     * @param to The new handler.
     * @param timestamp The block timestamp.
     */
    event CustodyTransferred(
        bytes32 indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a product reaches the Delivered status.
     * @param productId The product identifier.
     * @param handler The handler who completed delivery.
     * @param timestamp The block timestamp.
     */
    event DeliveryCompleted(
        bytes32 indexed productId,
        address indexed handler,
        uint256 timestamp
    );

    error InvalidProductId();
    error ProductNotRegistered();
    error NotCurrentHandler();
    error InvalidNewHandler();
    error EmptyLocation();
    error AlreadyDelivered();
    error InvalidStatusTransition();

    /**
     * @notice Restricts function access to the current handler.
     * @dev The first checkpoint for a product has no handler, so the first caller is allowed.
     */
    modifier onlyCurrentHandler(bytes32 productId) {
        if (!productRegistry.isProductRegistered(productId)) revert ProductNotRegistered();
        if (currentHandler[productId] == address(0)) {
            // First checkpoint: only the product manufacturer can initiate tracking
            address manufacturer = productRegistry.getProductManufacturer(productId);
            if (manufacturer != msg.sender) revert NotCurrentHandler();
        } else if (currentHandler[productId] != msg.sender) {
            revert NotCurrentHandler();
        }
        _;
    }

    /**
     * @notice Ensures the product has not already been delivered.
     */
    modifier onlyBeforeDelivery(bytes32 productId) {
        if (delivered[productId]) revert AlreadyDelivered();
        _;
    }

    constructor(address _productRegistry) {
        productRegistry = IProductRegistry(_productRegistry);
    }

    /**
     * @notice Validate that a status transition is legal.
     * @dev First checkpoint must be Created. Created → InTransit|AtCheckpoint. InTransit → AtCheckpoint|Delivered. AtCheckpoint → InTransit|Delivered.
     */
    function _validateStatusTransition(bytes32 productId, Status newStatus) internal view {
        Checkpoint[] storage history = productHistory[productId];
        if (history.length == 0) {
            if (newStatus != Status.Created) revert InvalidStatusTransition();
            return;
        }

        Status current = history[history.length - 1].status;

        if (current == Status.Created) {
            if (newStatus != Status.InTransit && newStatus != Status.AtCheckpoint) {
                revert InvalidStatusTransition();
            }
        } else if (current == Status.InTransit) {
            if (newStatus != Status.AtCheckpoint && newStatus != Status.Delivered) {
                revert InvalidStatusTransition();
            }
        } else if (current == Status.AtCheckpoint) {
            if (newStatus != Status.InTransit && newStatus != Status.Delivered) {
                revert InvalidStatusTransition();
            }
        } else if (current == Status.Delivered) {
            revert InvalidStatusTransition();
        }
    }

    /**
     * @notice Record a new checkpoint for a product.
     * @dev The first caller automatically becomes the handler. Reverts if product is not registered or already delivered.
     * @param productId The product identifier.
     * @param location Location string for the checkpoint.
     * @param status Current shipment status.
     * @param notes Optional notes.
     */
    function recordCheckpoint(
        bytes32 productId,
        string calldata location,
        Status status,
        string calldata notes
    ) external onlyCurrentHandler(productId) onlyBeforeDelivery(productId) {
        if (productId == bytes32(0)) revert InvalidProductId();
        if (!productRegistry.isProductRegistered(productId)) revert ProductNotRegistered();
        if (bytes(location).length == 0) revert EmptyLocation();

        _validateStatusTransition(productId, status);

        if (currentHandler[productId] == address(0)) {
            currentHandler[productId] = msg.sender;
        }

        Checkpoint memory checkpoint = Checkpoint({
            productId: productId,
            location: location,
            status: status,
            handler: msg.sender,
            timestamp: block.timestamp,
            notes: notes
        });

        productHistory[productId].push(checkpoint);

        if (status == Status.Delivered) {
            delivered[productId] = true;
            emit DeliveryCompleted(productId, msg.sender, block.timestamp);
        }

        emit CheckpointRecorded(
            productId,
            location,
            status,
            msg.sender,
            block.timestamp,
            notes
        );
    }

    /**
     * @notice Retrieve the full checkpoint history for a product.
     * @param productId The product identifier.
     * @return Array of Checkpoint structs.
     */
    function getProductHistory(bytes32 productId) external view returns (Checkpoint[] memory) {
        return productHistory[productId];
    }

    /**
     * @notice Check whether a product has been delivered.
     * @param productId The product identifier.
     * @return True if delivered, false otherwise.
     */
    function isDelivered(bytes32 productId) external view returns (bool) {
        return delivered[productId];
    }

    /**
     * @notice Transfer custody of a product to a new handler.
     * @dev Only the current handler can transfer custody.
     * @param productId The product identifier.
     * @param newHandler Address of the new handler.
     */
    function transferCustody(bytes32 productId, address newHandler) external onlyBeforeDelivery(productId) {
        if (productId == bytes32(0)) revert InvalidProductId();
        if (currentHandler[productId] != msg.sender) revert NotCurrentHandler();
        if (newHandler == address(0)) revert InvalidNewHandler();

        emit CustodyTransferred(productId, msg.sender, newHandler, block.timestamp);

        currentHandler[productId] = newHandler;
    }
}
