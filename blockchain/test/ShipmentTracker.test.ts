import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// Status enum matches ShipmentTracker.Status
enum Status {
  Created,
  InTransit,
  AtCheckpoint,
  Delivered,
}

describe("ShipmentTracker", () => {
  async function deployFixture() {
    const [owner, handler1, handler2, other] = await ethers.getSigners();

    const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy();

    const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
    const shipmentTracker = await ShipmentTracker.deploy(await productRegistry.getAddress());

    // Register a product for baseline tests
    const productId = ethers.keccak256(ethers.toUtf8Bytes("shipment-product"));
    await productRegistry.registerProduct(productId, "Shippable Widget", "Desc", "uri");

    return { productRegistry, shipmentTracker, owner, handler1, handler2, other, productId };
  }

  describe("Deployment", () => {
    it("deploys with the provided ProductRegistry address", async () => {
      const { productRegistry, shipmentTracker } = await loadFixture(deployFixture);
      expect(await shipmentTracker.productRegistry()).to.equal(
        await productRegistry.getAddress()
      );
    });
  });

  describe("recordCheckpoint", () => {
    it("reverts with ProductNotRegistered if product not in registry", async () => {
      const { shipmentTracker, handler1 } = await loadFixture(deployFixture);
      const unregisteredId = ethers.keccak256(ethers.toUtf8Bytes("unregistered"));

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(unregisteredId, "NYC", Status.Created, "notes")
      ).to.be.revertedWithCustomError(shipmentTracker, "ProductNotRegistered");
    });

    it("auto-assigns caller as handler on first checkpoint", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");

      expect(await shipmentTracker.currentHandler(productId)).to.equal(handler1.address);
    });

    it("allows second checkpoint by same handler", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Warehouse", Status.InTransit, "Moving")
      )
        .to.emit(shipmentTracker, "CheckpointRecorded")
        .withArgs(productId, "Warehouse", Status.InTransit, handler1.address, anyValue, "Moving");
    });

    it("reverts with NotCurrentHandler when different handler records checkpoint", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");

      await expect(
        shipmentTracker.connect(handler2).recordCheckpoint(productId, "Warehouse", Status.InTransit, "Moving")
      ).to.be.revertedWithCustomError(shipmentTracker, "NotCurrentHandler");
    });

    it("reverts with EmptyLocation when location is empty", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "", Status.Created, "notes")
      ).to.be.revertedWithCustomError(shipmentTracker, "EmptyLocation");
    });

    it("reverts with InvalidProductId when productId is bytes32(0)", async () => {
      const { shipmentTracker, handler1 } = await loadFixture(deployFixture);
      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(ethers.ZeroHash, "NYC", Status.Created, "notes")
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidProductId");
    });

    it("reverts with InvalidStatusTransition when first checkpoint is not Created", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Store", Status.Delivered, "Oops")
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidStatusTransition");
    });

    it("reverts with InvalidStatusTransition when second checkpoint is also Created", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Still Factory", Status.Created, "Oops")
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidStatusTransition");
    });

    it("reverts with InvalidStatusTransition on backwards status jump from InTransit", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Warehouse", Status.InTransit, "Moving");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Back to Factory", Status.Created, "Oops")
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidStatusTransition");
    });

    it("reverts with InvalidStatusTransition from AtCheckpoint to Created", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Warehouse", Status.InTransit, "Moving");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Dock", Status.AtCheckpoint, "Arrived");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Backwards", Status.Created, "Oops")
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidStatusTransition");
    });

    it("allows Created → AtCheckpoint → Delivered transition", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Warehouse", Status.Created, "Created");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Dock", Status.AtCheckpoint, "Arrived");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Customer", Status.Delivered, "Done")
      )
        .to.emit(shipmentTracker, "DeliveryCompleted")
        .withArgs(productId, handler1.address, anyValue);

      expect(await shipmentTracker.isDelivered(productId)).to.be.true;
    });

    it("reverts with AlreadyDelivered after delivery status is recorded", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Highway", Status.InTransit, "Moving");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Store", Status.Delivered, "Done");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Return Center", Status.AtCheckpoint, "Oops")
      ).to.be.revertedWithCustomError(shipmentTracker, "AlreadyDelivered");
    });

    it("sets delivered and emits DeliveryCompleted on Delivered status", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory", Status.Created, "Created");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Highway", Status.InTransit, "Moving");

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Store", Status.Delivered, "Arrived")
      )
        .to.emit(shipmentTracker, "DeliveryCompleted")
        .withArgs(productId, handler1.address, anyValue);

      expect(await shipmentTracker.isDelivered(productId)).to.be.true;
      expect(await shipmentTracker.delivered(productId)).to.be.true;
    });
  });

  describe("getProductHistory", () => {
    it("returns array of all checkpoints", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "B", Status.InTransit, "Move");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "C", Status.AtCheckpoint, "Stop");

      const history = await shipmentTracker.getProductHistory(productId);
      expect(history).to.have.lengthOf(3);
      expect(history[0].location).to.equal("A");
      expect(history[1].location).to.equal("B");
      expect(history[2].location).to.equal("C");
      expect(history[0].status).to.equal(Status.Created);
      expect(history[1].status).to.equal(Status.InTransit);
      expect(history[2].status).to.equal(Status.AtCheckpoint);
    });
  });

  describe("isDelivered", () => {
    it("returns false before delivery", async () => {
      const { shipmentTracker, productId } = await loadFixture(deployFixture);
      expect(await shipmentTracker.isDelivered(productId)).to.be.false;
    });

    it("returns true after delivery", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "B", Status.InTransit, "Moving");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "C", Status.Delivered, "Done");

      expect(await shipmentTracker.isDelivered(productId)).to.be.true;
    });
  });

  describe("transferCustody", () => {
    it("emits CustodyTransferred and updates currentHandler", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");

      await expect(
        shipmentTracker.connect(handler1).transferCustody(productId, handler2.address)
      )
        .to.emit(shipmentTracker, "CustodyTransferred")
        .withArgs(productId, handler1.address, handler2.address, anyValue);

      expect(await shipmentTracker.currentHandler(productId)).to.equal(handler2.address);
    });

    it("reverts with NotCurrentHandler when non-handler tries to transfer", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");

      await expect(
        shipmentTracker.connect(handler2).transferCustody(productId, handler1.address)
      ).to.be.revertedWithCustomError(shipmentTracker, "NotCurrentHandler");
    });

    it("reverts with InvalidNewHandler when transferring to zero address", async () => {
      const { shipmentTracker, handler1, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");

      await expect(
        shipmentTracker.connect(handler1).transferCustody(productId, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(shipmentTracker, "InvalidNewHandler");
    });

    it("prevents old handler from recording checkpoints after transfer", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");
      await shipmentTracker.connect(handler1).transferCustody(productId, handler2.address);

      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "B", Status.InTransit, "Move")
      ).to.be.revertedWithCustomError(shipmentTracker, "NotCurrentHandler");
    });

    it("allows new handler to record checkpoints after transfer", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");
      await shipmentTracker.connect(handler1).transferCustody(productId, handler2.address);

      await expect(
        shipmentTracker.connect(handler2).recordCheckpoint(productId, "B", Status.InTransit, "Move")
      )
        .to.emit(shipmentTracker, "CheckpointRecorded")
        .withArgs(productId, "B", Status.InTransit, handler2.address, anyValue, "Move");
    });

    it("reverts with AlreadyDelivered when transferring custody after delivery", async () => {
      const { shipmentTracker, handler1, handler2, productId } = await loadFixture(deployFixture);
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "A", Status.Created, "Start");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "B", Status.InTransit, "Moving");
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "C", Status.Delivered, "Done");

      await expect(
        shipmentTracker.connect(handler1).transferCustody(productId, handler2.address)
      ).to.be.revertedWithCustomError(shipmentTracker, "AlreadyDelivered");
    });
  });

  describe("Full lifecycle", () => {
    it("completes full product lifecycle from creation to delivery", async () => {
      const { productRegistry, shipmentTracker, handler1, productId } = await loadFixture(deployFixture);

      // Verify integration with ProductRegistry
      expect(await productRegistry.isProductRegistered(productId)).to.be.true;

      // Created
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Factory Floor", Status.Created, "Product created");
      expect(await shipmentTracker.currentHandler(productId)).to.equal(handler1.address);
      expect(await shipmentTracker.isDelivered(productId)).to.be.false;

      // InTransit
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Highway 101", Status.InTransit, "On the road");

      // AtCheckpoint
      await shipmentTracker.connect(handler1).recordCheckpoint(productId, "Regional Warehouse", Status.AtCheckpoint, "Arrived at checkpoint");

      // Delivered
      await expect(
        shipmentTracker.connect(handler1).recordCheckpoint(productId, "Retail Store", Status.Delivered, "Final delivery")
      )
        .to.emit(shipmentTracker, "DeliveryCompleted")
        .withArgs(productId, handler1.address, anyValue);

      // Verify delivery state
      expect(await shipmentTracker.isDelivered(productId)).to.be.true;
      expect(await shipmentTracker.delivered(productId)).to.be.true;

      // Verify history length and statuses
      const history = await shipmentTracker.getProductHistory(productId);
      expect(history).to.have.lengthOf(4);
      expect(history[0].status).to.equal(Status.Created);
      expect(history[1].status).to.equal(Status.InTransit);
      expect(history[2].status).to.equal(Status.AtCheckpoint);
      expect(history[3].status).to.equal(Status.Delivered);
    });
  });
});
