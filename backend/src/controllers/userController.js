const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

module.exports = (sequelize) => {
  const User = UserModel(sequelize);

  return {
    register: async (req, res) => {
      try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
          return res.status(400).json({ message: "Name, valid email, and an 8-character password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });

        res.status(201).json({ message: "User registered successfully" });
      } catch (error) {
        console.error("Unable to register user:", error);
        res.status(500).json({ message: "Server error while registering user" });
      }
    },

    login: async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
        if (!user) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      } catch (error) {
        console.error("Unable to sign in user:", error);
        res.status(500).json({ message: "Server error while signing in" });
      }
    }
  };
};
