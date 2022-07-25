import { expect } from "chai";
import Product from "../../../src/models/product.js";

describe("Routes: Products", () => {
  const defaultId = "56cb91bdc3464f14678934ca";

  const defaultProduct = {
    name: "Default product",
    description: "product description",
    price: 100,
  };

  const expectedProduct = {
    __v: 0,
    _id: defaultId,
    name: "Default product",
    description: "product description",
    price: 100,
  };

  //before each test we create a defaultProduct to comapare the results
  beforeEach(async () => {
    //clear database
    await Product.deleteMany();

    //create a new instace of product with defaultProduct
    const product = new Product(defaultProduct);
    product._id = "56cb91bdc3464f14678934ca";

    //save in database
    return await product.save();
  });

  //after tests clear Products in database
  afterEach(async () => await Product.deleteMany());

  describe("GET /products", () => {
    it("should return a list of products", (done) => {
      request.get("/products").end((err, res) => {
        expect(res.body).to.eql([expectedProduct]);
        done(err);
      });
    });

    context("when id is specified", (done) => {
      it("should return 200 with one product", (done) => {
        request.get(`/products/${defaultId}`).end((err, res) => {
          expect(res.statusCode).to.eql(200);
          expect(res.body).to.eql([expectedProduct]);
          done(err);
        });
      });
    });
  });

  describe("POST /products", () => {
    context("when posting a product", () => {
      it("should return a new project with status 201", (done) => {
        const customId = "56cb91bdc3464f14678934ba";
        const newProduct = Object.assign(
          {},
          { _id: customId, __v: 0 },
          defaultProduct
        );

        const expectedSavedProduct = {
          __v: 0,
          _id: customId,
          name: "Default product",
          description: "product description",
          price: 100,
        };

        request
          .post("/products")
          .send(newProduct)
          .end((err, res) => {
            expect(res.statusCode).to.eql(201);
            expect(res.body).to.eql(expectedSavedProduct);
            done(err);
          });
      });
    });
  });

  describe("PUT /product", () => {
    context("when editing a product", () => {
      it("should update the product and return 200 as status code", (done) => {
        const customProduct = {
          name: "customName",
        };

        const updateProduct = Object.assign({}, customProduct, defaultProduct);

        request
          .put(`/products/${defaultId}`)
          .send(updateProduct)
          .end((err, res) => {
            expect(res.statusCode).to.eql(200);
            done(err);
          });
      });
    });
  });

  describe("DELETE /product", () => {
    context("when deleting a product", () => {
      it("should delete the product and return 204 as status code", (done) => {
        request.delete(`/products/${defaultId}`).end((err, res) => {
          expect(res.statusCode).to.eql(204);
          done(err);
        });
      });
    });
  });
});
