const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../libs/Tokengenerator");
const logActivity = require("../libs/logger");

module.exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const duplicatedUser = await User.findOne({ email });
    if (duplicatedUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedpassword,
      role,
    });

    const savedUser = await newUser.save();
    const token = await generateToken(savedUser, res);

    res.status(201).json({
      message: "Signup successful",
      savedUser: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        token,
      },
    });

    await logActivity({
      action: "User Signup",
      description: `User ${name} signed up.`,
      entity: "user",
      entityId: savedUser._id,
      userId: savedUser._id,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(400).json({ error: "Error during signup: " + error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const duplicatedUser = await User.findOne({ email });

    if (!duplicatedUser) {
      return res.status(400).json({ error: "No user found" });
    }

    const hasedpassword = await bcrypt.compare(
      password,
      duplicatedUser.password,
    );

    if (!hasedpassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = await generateToken(duplicatedUser, res);

    await logActivity({
      action: "User Login",
      description: `User ${duplicatedUser.name} logged in.`,
      entity: "user",
      entityId: duplicatedUser._id,
      userId: duplicatedUser._id,
      ipAddress: ipAddress,
    });
    return res.status(201).json({
      message: "login successfully",
      user: {
        id: duplicatedUser.id,
        name: duplicatedUser.name,
        email: duplicatedUser.email,
        role: duplicatedUser.role,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: "Error in login to the page",
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("Inventorymanagmentsystem", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during logout. Please try again.",
      error: error.message,
    });
  }
};

module.exports.staffuser = async (req, res) => {
  try {
    const staffuser = await User.find({ role: "staff" }).select("-password");

    if (staffuser.length === 0) {
      return res
        .status(200)
        .json({ message: "There are no staff users available." });
    }

    res.status(200).json(staffuser);
  } catch (error) {
    console.log("Error in get staff Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.manageruser = async (req, res) => {
  try {
    const manageruser = await User.find({ role: "manager" }).select(
      "-password",
    );

    if (manageruser.length === 0) {
      return res
        .status(200)
        .json({ message: "There are no manager users available." });
    }

    res.status(200).json(manageruser);
  } catch (error) {
    console.log("Error in get manager Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.adminuser = async (req, res) => {
  try {
    const adminuser = await User.find({ role: "admin" }).select("-password");

    if (adminuser.length === 0) {
      return res
        .status(200)
        .json({ message: "There are no admin users available." });
    }

    res.status(200).json(adminuser);
  } catch (error) {
    console.log("Error in get admin Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.removeuser = async (req, res) => {
  try {
    const { UserId } = req.params;

    if (!UserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deleteUser = await User.findByIdAndDelete(UserId);

    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
