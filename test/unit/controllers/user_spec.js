import UsersController from "../../../src/controllers/users.js";
import sinon from "sinon";
import User from "../../../src/models/user.js";

import AuthService from "../../../src/services/auth.js";

import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcrypt";

describe("Controller: Users", () => {
  const defaultUser = [
    {
      __v: 0,
      _id: "56cb91bdc3464f14678934ca",
      name: "Default User",
      email: "user@gmail.com",
      password: "password",
      role: "user",
    },
  ];

  const defaultRequest = {
    params: {},
  };

  describe("get() Users", () => {
    it("should return a list of users", async () => {
      const response = {
        send: sinon.spy(),
      };

      //create a fake method, User.find return a User[]
      // fake depencency
      User.find = sinon.stub();
      User.find.withArgs({}).resolves(defaultUser);

      //UsersController with a fake User to test yours asserts
      const usersController = new UsersController(User);

      await usersController.get(defaultRequest, response);
      sinon.assert.calledWith(response.send, defaultUser);
    });

    it("should return 400 when an error occurs", async () => {
      const request = {};
      const response = {
        send: sinon.spy(),
        status: sinon.stub(),
      };

      //create fake response with status code 400 (Error)
      response.status.withArgs(400).returns(response);
      //create fake method, User.find an Promise Error
      User.find = sinon.stub();
      User.find.withArgs({}).rejects({ message: "Error" });

      const usersController = new UsersController(User);

      await usersController.get(request, response);
      sinon.assert.calledWith(response.send, "Error");
    });
  });

  describe("getById() User", () => {
    it("should call send with one user", async () => {
      const fakeId = "a-fake-id";
      const request = {
        params: {
          id: fakeId,
        },
      };
      const response = {
        send: sinon.spy(),
      };

      User.find = sinon.stub();
      //User.find is a Promisse with fakeId prop then return a default user
      User.find.withArgs({ _id: fakeId }).resolves(defaultUser);

      const usersController = new UsersController(User);

      await usersController.getById(request, response);
      sinon.assert.calledWith(response.send, defaultUser);
    });
  });

  describe("create() User", () => {
    it("should call send with a new user with 201 status", async () => {
      const requestWithBody = Object.assign(
        {},
        { body: defaultUser[0] },
        defaultRequest
      );
      const response = {
        send: sinon.spy(),
        status: sinon.stub(),
      };
      class fakeUser {
        save() {}
      }

      response.status.withArgs(201).returns(response);
      sinon.stub(fakeUser.prototype, "save").withArgs().resolves();

      const usersController = new UsersController(fakeUser);

      await usersController.create(requestWithBody, response);
      sinon.assert.calledWith(response.send);
    });

    context("when an error occurs", () => {
      it("should return 422", async () => {
        const response = {
          send: sinon.spy(),
          status: sinon.stub(),
        };
        class fakeUser {
          save() {}
        }

        response.status.withArgs(422).returns(response);
        sinon
          .stub(fakeUser.prototype, "save")
          .withArgs()
          .rejects({ message: "Error" });

        const usersController = new UsersController(fakeUser);

        await usersController.create(defaultRequest, response);
        sinon.assert.calledWith(response.status, 422);
      });
    });
  });

  describe("update() User", () => {
    it("should respond with 200 when the user has been updated", async () => {
      const fakeId = "a-fake-id";
      const updatedUser = {
        _id: fakeId,
        name: "Updated User",
        email: "user@gmail.com",
        password: "password",
        role: "user",
      };
      const request = {
        params: {
          id: fakeId,
        },
        body: updatedUser,
      };
      const response = {
        sendStatus: sinon.spy(),
      };
      class fakeUser {
        static findById() {}
        save() {}
      }
      const fakeUserInstace = new fakeUser();

      const saveSpy = sinon.spy(fakeUser.prototype, "save");
      const findByIdStub = sinon.stub(fakeUser, "findById");
      findByIdStub.withArgs(fakeId).resolves(fakeUserInstace);

      const usersController = new UsersController(fakeUser);

      await usersController.update(request, response);
      sinon.assert.calledWith(response.sendStatus, 200);
      sinon.assert.calledOnce(saveSpy);
    });

    context("when an error occurs", () => {
      it("should return 422", async () => {
        const fakeId = "a-fake-id";
        const updatedUser = {
          _id: fakeId,
          name: "Updated User",
          email: "user@gmail.com",
          password: "password",
          role: "user",
        };
        const request = {
          params: {
            id: fakeId,
          },
          body: updatedUser,
        };
        const response = {
          send: sinon.spy(),
          status: sinon.stub(),
        };
        class fakeUser {
          static findById() {}
        }

        const findByIdStub = sinon.stub(fakeUser, "findById");
        findByIdStub.withArgs(fakeId).rejects({ message: "Error" });
        response.status.withArgs(422).returns(response);

        const usersController = new UsersController(fakeUser);

        await usersController.update(request, response);
        sinon.assert.calledWith(response.send, "Error");
      });
    });
  });

  describe("delete() User", () => {
    it("should respond with 204 when the user has been deleted", async () => {
      const fakeId = "a-fake-id";
      const request = {
        params: {
          id: fakeId,
        },
      };
      const response = {
        sendStatus: sinon.spy(),
      };

      class fakeUser {
        static deleteOne() {}
      }

      const deleteOneStub = sinon.stub(fakeUser, "deleteOne");

      deleteOneStub.withArgs({ _id: fakeId }).resolves([1]);

      const usersController = new UsersController(fakeUser);

      await usersController.remove(request, response);
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

        class fakeUser {
          static deleteOne() {}
        }

        const deleteOneStub = sinon.stub(fakeUser, "deleteOne");

        deleteOneStub.withArgs({ _id: fakeId }).rejects({ message: "Error" });
        response.status.withArgs(400).returns(response);

        const usersController = new UsersController(fakeUser);

        await usersController.remove(request, response);
        sinon.assert.calledWith(response.send, "Error");
      });
    });
  });

  describe("authenticate", () => {
    it("should authenticate a user", async () => {
      const fakeUserModel = {};
      const user = {
        name: "Elon Musk",
        email: "elon@gmail.com",
        password: "12345",
        role: "admin",
      };
      const userWithEncryptedPassword = {
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      };

      const jwtToken = jwt.sign(
        userWithEncryptedPassword,
        config.get("auth.key"),
        {
          expiresIn: config.get("auth.tokenExpiresIn"),
        }
      );

      class FakeAuthService {
        authenticate() {
          return Promise.resolve(userWithEncryptedPassword);
        }
        static generateToken() {
          return jwtToken;
        }
      }

      const fakeReq = {
        body: user,
      };
      const fakeRes = {
        send: sinon.spy(),
      };
      const usersController = new UsersController(
        fakeUserModel,
        FakeAuthService
      );
      await usersController.authenticate(fakeReq, fakeRes);
      sinon.assert.calledWith(fakeRes.send, { token: jwtToken });
    });

    it("should return 401 when the user can not be found", async () => {
      const fakeUserModel = {};
      class FakeAuthService {
        authenticate() {
          return Promise.resolve(false);
        }
      }
      const user = {
        name: "Elon Musk",
        email: "elon@gamil.com",
        password: "12345",
        role: "admin",
      };
      const fakeReq = {
        body: user,
      };
      const fakeRes = {
        sendStatus: sinon.spy(),
      };
      const usersController = new UsersController(
        fakeUserModel,
        FakeAuthService
      );

      await usersController.authenticate(fakeReq, fakeRes);
      sinon.assert.calledWith(fakeRes.sendStatus, 401);
    });

    it("should return false when the password does not match", async () => {
      const user = {
        email: "elon@gamil.com",
        password: "12345",
      };
      const fakeUserModel = {
        findOne: sinon.stub(),
      };
      fakeUserModel.findOne.withArgs({
        email: user.email,
        password: "aFakeHashPassword",
      });
      const authService = new AuthService(fakeUserModel);
      const response = await authService.authenticate(user);

      expect(response).to.be.false;
    });
  });
});
