const ReviewModel = require("../models/Review");
const BookModel = require("../models/Book");
const UserModel = require("../models/User");

module.exports = (sequelize) => {
  const Review = ReviewModel(sequelize);
  const Book = BookModel(sequelize);
  const User = UserModel(sequelize);

  return {
    addReview: async (req, res) => {
      try {
        const { bookId, comment, rating } = req.body;
        const userId = req.user.userId;

        if (!bookId || !comment?.trim() || Number(rating) < 1 || Number(rating) > 5) {
          return res.status(400).json({ message: "A book, review, and rating from 1 to 5 are required" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }

        const newReview = await Review.create({
          userId,
          bookId,
          comment: comment.trim(),
          rating: Number(rating),
          username: user.name,
        });

        res.status(201).json({ message: "Review added successfully", review: newReview });
      } catch (error) {
        console.error("Unable to add review:", error);
        res.status(500).json({ message: "Server error while adding review" });
      }
    },

    getReviewsForBook: async (req, res) => {
      try {
        const { bookId } = req.params;

        const reviews = await Review.findAll({
          where: { bookId },
          order: [["createdAt", "DESC"]],
        });

        res.json(reviews);
      } catch (error) {
        console.error("Unable to fetch reviews:", error);
        res.status(500).json({ message: "Server error while fetching reviews" });
      }
    },

    updateReview: async (req, res) => {
      try {
        const { reviewId } = req.params;
        const { comment, rating } = req.body;
        const review = await Review.findByPk(reviewId);

        if (!review) {
          return res.status(404).json({ message: "Review not found" });
        }
        if (review.userId !== req.user.userId) {
          return res.status(403).json({ message: "You can only edit your own reviews" });
        }
        if (!comment?.trim() || Number(rating) < 1 || Number(rating) > 5) {
          return res.status(400).json({ message: "A review and rating from 1 to 5 are required" });
        }

        await review.update({ comment: comment.trim(), rating: Number(rating) });
        res.json({ message: "Review updated successfully", review });
      } catch (error) {
        console.error("Unable to update review:", error);
        res.status(500).json({ message: "Server error while updating review" });
      }
    },

    deleteReview: async (req, res) => {
      try {
        const { reviewId } = req.params;
        const review = await Review.findByPk(reviewId);

        if (!review) {
          return res.status(404).json({ message: "Review not found" });
        }
        if (review.userId !== req.user.userId) {
          return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        await review.destroy();
        res.json({ message: "Review deleted successfully" });
      } catch (error) {
        console.error("Unable to delete review:", error);
        res.status(500).json({ message: "Server error while deleting review" });
      }
    },
  };
};
