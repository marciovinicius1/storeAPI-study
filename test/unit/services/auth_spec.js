import bcrypt from "bcrypt";
import sinon from "sinon";
import AuthService from "../../../src/services/auth.js";

import jwt from "jsonwebtoken";
import config from "config";
import { expect } from "chai";

describe("Service: Auth", () => {
  context("authenticate", () => {
    it("should authenticate an user", async () => {
      const fakeUserModel = {
        findOne: sinon.stub(),
      };
      const user = {
        name: "Elon",
        email: "elon@gmail.com",
        password: "12345",
      };

      const authService = new AuthService(fakeUserModel);
      const hashedPassword = bcrypt.hashSync("12345", 10);
      const userFromDatabase = {
        ...user,
        password: hashedPassword,
      };

      fakeUserModel.findOne
        .withArgs({ email: "elon@gmail.com" })
        .resolves(userFromDatabase);

      const res = await authService.authenticate(user);

      expect(res).to.eql(userFromDatabase);
    });
  });

  context("generateToken", () => {
    it("should genereate a JWT token from a payload", () => {
      const payload = {
        name: "Elon",
        email: "elon@gmail.com",
        password: "12345",
      };
      const expectedToken = jwt.sign(payload, config.get("auth.key"), {
        expiresIn: config.get("auth.tokenExpiresIn"),
      });
      const generatedToken = AuthService.generateToken(payload);
      expect(generatedToken).to.eql(expectedToken);
    });
  });
});
