import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProductRegistry", () => {
  async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy();
    return { productRegistry, owner, addr1, addr2 };
  }

  function getProductId(name: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(name));
  }

  describe("Deployment", () => {
    it("sets totalProducts to 0 on deployment", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      expect(await productRegistry.totalProducts()).to.equal(0);
    });
  });

  describe("registerProduct", () => {
    it("registers a product with all 4 params and emits ProductRegistered", async () => {
      const { productRegistry, owner } = await loadFixture(deployFixture);
      const productId = getProductId("product-1");

      await expect(
        productRegistry.registerProduct(
          productId,
          "Widget A",
          "A high-quality widget",
          "ipfs://QmTest123"
        )
      )
        .to.emit(productRegistry, "ProductRegistered")
        .withArgs(productId, owner.address, "Widget A", anyValue);
    });

    it("reverts with InvalidProductId when productId is bytes32(0)", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      await expect(
        productRegistry.registerProduct(ethers.ZeroHash, "Widget", "Desc", "uri")
      ).to.be.revertedWithCustomError(productRegistry, "InvalidProductId");
    });

    it("reverts with EmptyName when name is empty", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-empty-name");
      await expect(
        productRegistry.registerProduct(productId, "", "Desc", "uri")
      ).to.be.revertedWithCustomError(productRegistry, "EmptyName");
    });

    it("reverts with ProductAlreadyExists when registering duplicate", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-dup");
      await productRegistry.registerProduct(productId, "Widget", "Desc", "uri");

      await expect(
        productRegistry.registerProduct(productId, "Widget 2", "Desc 2", "uri-2")
      ).to.be.revertedWithCustomError(productRegistry, "ProductAlreadyExists");
    });
  });

  describe("getProduct", () => {
    it("returns correct data including metadataURI", async () => {
      const { productRegistry, owner } = await loadFixture(deployFixture);
      const productId = getProductId("product-get");
      await productRegistry.registerProduct(
        productId,
        "Widget B",
        "Description B",
        "ipfs://QmMeta456"
      );

      const product = await productRegistry.getProduct(productId);

      expect(product.productId).to.equal(productId);
      expect(product.manufacturer).to.equal(owner.address);
      expect(product.name).to.equal("Widget B");
      expect(product.description).to.equal("Description B");
      expect(product.metadataURI).to.equal("ipfs://QmMeta456");
      expect(product.timestamp).to.be.gt(0);
    });

    it("reverts with ProductNotFound for unknown product", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("unknown-product");
      await expect(
        productRegistry.getProduct(productId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
  });

  describe("isProductRegistered", () => {
    it("returns true for a registered product", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-registered");
      await productRegistry.registerProduct(productId, "Widget", "Desc", "uri");

      expect(await productRegistry.isProductRegistered(productId)).to.be.true;
    });

    it("returns false for an unregistered product", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-unregistered");

      expect(await productRegistry.isProductRegistered(productId)).to.be.false;
    });
  });

  describe("getProductsByManufacturer", () => {
    it("returns array of product IDs for a manufacturer", async () => {
      const { productRegistry, owner } = await loadFixture(deployFixture);
      const id1 = getProductId("prod-1");
      const id2 = getProductId("prod-2");
      await productRegistry.registerProduct(id1, "Widget 1", "Desc", "uri");
      await productRegistry.registerProduct(id2, "Widget 2", "Desc", "uri");

      const products = await productRegistry.getProductsByManufacturer(owner.address);
      expect(products).to.have.lengthOf(2);
      expect(products[0]).to.equal(id1);
      expect(products[1]).to.equal(id2);
    });

    it("returns empty array for manufacturer with no products", async () => {
      const { productRegistry, addr1 } = await loadFixture(deployFixture);
      const products = await productRegistry.getProductsByManufacturer(addr1.address);
      expect(products).to.have.lengthOf(0);
    });

    it("returns multiple products registered by same manufacturer", async () => {
      const { productRegistry, addr1 } = await loadFixture(deployFixture);
      const id1 = getProductId("multi-1");
      const id2 = getProductId("multi-2");
      const id3 = getProductId("multi-3");
      await productRegistry.connect(addr1).registerProduct(id1, "A", "Desc", "uri");
      await productRegistry.connect(addr1).registerProduct(id2, "B", "Desc", "uri");
      await productRegistry.connect(addr1).registerProduct(id3, "C", "Desc", "uri");

      const products = await productRegistry.getProductsByManufacturer(addr1.address);
      expect(products).to.have.lengthOf(3);
    });
  });

  describe("totalProducts", () => {
    it("increments correctly after multiple registrations", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      expect(await productRegistry.totalProducts()).to.equal(0);

      await productRegistry.registerProduct(getProductId("tp-1"), "A", "Desc", "uri");
      expect(await productRegistry.totalProducts()).to.equal(1);

      await productRegistry.registerProduct(getProductId("tp-2"), "B", "Desc", "uri");
      expect(await productRegistry.totalProducts()).to.equal(2);

      await productRegistry.registerProduct(getProductId("tp-3"), "C", "Desc", "uri");
      expect(await productRegistry.totalProducts()).to.equal(3);
    });
  });

  describe("updateProductMetadata", () => {
    it("allows manufacturer to update metadataURI and emits ProductMetadataUpdated", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-update");
      await productRegistry.registerProduct(productId, "Widget", "Desc", "old-uri");

      await expect(
        productRegistry.updateProductMetadata(productId, "new-uri")
      )
        .to.emit(productRegistry, "ProductMetadataUpdated")
        .withArgs(productId, "new-uri");

      const product = await productRegistry.getProduct(productId);
      expect(product.metadataURI).to.equal("new-uri");
    });

    it("reverts with NotManufacturer when non-manufacturer tries to update", async () => {
      const { productRegistry, addr1 } = await loadFixture(deployFixture);
      const productId = getProductId("product-unauth");
      await productRegistry.registerProduct(productId, "Widget", "Desc", "uri");

      await expect(
        productRegistry.connect(addr1).updateProductMetadata(productId, "new-uri")
      ).to.be.revertedWithCustomError(productRegistry, "NotManufacturer");
    });

    it("reverts with ProductNotFound for non-existent product", async () => {
      const { productRegistry } = await loadFixture(deployFixture);
      const productId = getProductId("product-nonexistent");

      await expect(
        productRegistry.updateProductMetadata(productId, "new-uri")
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
  });
});
