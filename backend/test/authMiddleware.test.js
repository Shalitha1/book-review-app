const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../src/middleware/authMiddleware");

const JWT_SECRET = "ci-test-secret";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test.before(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

test("rejects requests without a bearer token", () => {
  const req = { header: () => undefined };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Access denied. No token provided.");
  assert.equal(nextCalled, false);
});

test("rejects an invalid token", () => {
  const req = { header: () => "Bearer invalid-token" };
  const res = createResponse();

  authMiddleware(req, res, () => {
    assert.fail("next should not be called for an invalid token");
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Your session is invalid or has expired");
});

test("accepts a valid token and exposes its user data", () => {
  const token = jwt.sign({ userId: 42 }, JWT_SECRET, { expiresIn: "1m" });
  const req = { header: () => `Bearer ${token}` };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.userId, 42);
  assert.equal(res.statusCode, 200);
});
