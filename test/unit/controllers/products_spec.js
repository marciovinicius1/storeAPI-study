import ProductsController from "../../../src/controllers/products.js";
import sinon from "sinon";
import Product from "../../../src/models/product.js";

describe("Controllers: Products", () => {
  const defaultProduct = [
    {
      __v: 0,
      _id: "56cb91bdc3464f14678934ca",
      name: "Default product",
      description: "product description",
      price: 100,
    },
  ];

  const defaultRequest = {
    params: {},
  };

  describe("get() products", () => {
    it("should return a list of products", async () => {
      const response = {
        send: sinon.spy(),
      };

      // the stub will simulate a database function
      Product.find = sinon.stub();
      // when the find function is called will return a defaultProduct
      Product.find.withArgs({}).resolves(defaultProduct);

      const productsController = new ProductsController(Product);

      await productsController.get(defaultRequest, response);

      sinon.assert.calledWith(response.send, defaultProduct);
    });

    it("should return 400 when an error occurs", async () => {
      const request = {};
      const response = {
        send: sinon.spy(),
        status: sinon.stub(),
      };

      //when status function is called with 400 code return response
      response.status.withArgs(400).returns(response);

      Product.find = sinon.stub();
      //we use the stub to reject the Promise to cause an error
      Product.find.withArgs({}).rejects({ message: "Error" });

      const productsController = new ProductsController(Product);

      await productsController.get(request, response);

      sinon.assert.calledWith(response.send, "Error");
    });
  });

  describe("getById()", () => {
    it("should return one product", async () => {
      const fakeId = "a-fake-id";
      const request = {
        params: {
          id: fakeId,
        },
      };
      const response = {
        send: sinon.spy(),
      };

      //database call fake - find method MongoDB
      Product.find = sinon.stub();
      Product.find.withArgs({ _id: fakeId }).resolves(defaultProduct);

      //new instace of product controller with product stub
      const productsController = new ProductsController(Product);

      await productsController.getById(request, response);

      sinon.assert.calledWith(response.send, defaultProduct);
    });
  });

  describe("create() product", () => {
    it("should save a new product successfully", async () => {
      // request simulate
      const requestWithBody = Object.assign(
        {},
        { body: defaultProduct[0] },
        defaultRequest
      );
      const response = {
        send: sinon.spy(),
        status: sinon.stub(),
      };

      class fakeProduct {
        save() {}
      }

      // fake http response with status code 201, simulate a real case.
      response.status.withArgs(201).returns(response);
      // fakeProduct return a resolved promisse like a database function
      //simulate save() of product model - MongoDB method
      sinon.stub(fakeProduct.prototype, "save").withArgs().resolves();

      //new instace of crontroller with fake product class
      const productsController = new ProductsController(fakeProduct);

      await productsController.create(requestWithBody, response);
      sinon.assert.calledWith(response.send);
    });

    context("when an error occurs", () => {
      it("should return 422", async () => {
        const response = {
          send: sinon.spy(),
          status: sinon.stub(),
        };

        class fakeProduct {
          save() {}
        }
        // response must return status code 422
        response.status.withArgs(422).returns(response);
        // fakeProduct return a error in database promisse save()
        sinon
          .stub(fakeProduct.prototype, "save")
          .withArgs()
          .rejects({ message: "Error" });

        const productsController = new ProductsController(fakeProduct);

        await productsController.create(defaultRequest, response);
        sinon.assert.calledWith(response.status, 422);
      });
    });
  });

  describe("update() product", () => {
    it("should respond with 200 when the product has been updated", async () => {
      const fakeId = "a-fake-id";
      const updatedProduct = {
        _id: fakeId,
        name: "Updated product",
        description: "Updated description",
        price: 150,
      };
      const request = {
        params: {
          id: fakeId,
        },
        body: updatedProduct,
      };
      const response = {
        sendStatus: sinon.spy(),
      };
      class fakeProduct {
        static updateOne() {}
      }

      const updateOneStub = sinon.stub(fakeProduct, "updateOne");
      updateOneStub
        .withArgs({ _id: fakeId }, updatedProduct)
        .resolves(updatedProduct);
      const productsController = new ProductsController(fakeProduct);

      await productsController.update(request, response);
      sinon.assert.calledWith(response.sendStatus, 200);
    });

    context("when an error occurs", () => {
      it("should return 422", async () => {
        const fakeId = "a-fake-id";
        const updatedProduct = {
          _id: fakeId,
          name: "Updated product",
          description: "Updated description",
          price: 150,
        };
        const request = {
          params: {
            id: fakeId,
          },
          body: updatedProduct,
        };
        const response = {
          send: sinon.spy(),
          status: sinon.stub(),
        };

        class fakeProduct {
          static updateOne() {}
        }

        const updateOneStub = sinon
          .stub(fakeProduct, "updateOne")
          .rejects({ message: "Error" });

        updateOneStub
          .withArgs({ _id: fakeId }, updatedProduct)
          .rejects({ message: "Error" });

        response.status.withArgs(422).returns(response);

        const productsController = new ProductsController(fakeProduct);

        await productsController.update(request, response);
        sinon.assert.calledWith(response.send, "Error");
      });
    });
  });

  describe("delete() products", () => {
    it("should respond with 204 when the product has been deleted", async () => {
      const fakeId = "a-fake-id";
      const request = {
        params: {
          _id: fakeId,
        },
      };
      const response = {
        sendStatus: sinon.spy(),
      };

      class fakeProduct {
        static deleteOne() {}
      }

      const deleteOneStub = sinon.stub(fakeProduct, "deleteOne");

      deleteOneStub.withArgs({ _id: fakeId }).resolves();

      const productsController = new ProductsController(fakeProduct);

      await productsController.remove(request, response);

      sinon.assert.calledWith(response.sendStatus, 204);
    });

    context("when an error occurs", () => {
      it("should return 400", async () => {
        const fakeId = "a-fake-id";
        const request = {
          params: {
            id: fakeId,
          },
        };
        const response = {
          send: sinon.spy(),
          status: sinon.stub(),
        };

        class fakeProduct {
          static deleteOne() {}
        }

        const deleteOneStub = sinon.stub(fakeProduct, "deleteOne");

        deleteOneStub.withArgs({ _id: fakeId }).rejects({ message: "Error" });
        response.status.withArgs(400).returns(response);

        const productsController = new ProductsController(fakeProduct);

        await productsController.remove(request, response);
        sinon.assert.calledWith(response.send, "Error");
      });
    });
  });
});
