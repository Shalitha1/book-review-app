const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

module.exports = (sequelize) => {
  const reviewController = require("../controllers/reviewController")(sequelize);

  router.post("/", authMiddleware, reviewController.addReview);
  router.put("/:reviewId", authMiddleware, reviewController.updateReview);
  router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);
  router.get("/:bookId", reviewController.getReviewsForBook);

  return router;
};
