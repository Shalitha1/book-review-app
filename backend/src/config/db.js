const { Sequelize } = require("sequelize");
require("dotenv").config();

const sslEnabled = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,

    ...(sslEnabled && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
  }
);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();

    console.log(
      `Database '${process.env.DB_NAME}' connected successfully!`
    );

    return sequelize;
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

module.exports = initializeDatabase;