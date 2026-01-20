const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = async (user, res) => {
  try {
    if (!config.JWT_SECRET) {
      throw new Error(
        "Secret key is not defined in the environment variables.",
      );
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("Inventorymanagmentsystem", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Failed to generate token");
  }
};

module.exports = generateToken;
