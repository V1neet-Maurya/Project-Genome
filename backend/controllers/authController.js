import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// =====================================================
// REGISTER
// =====================================================

export async function register(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "firstName, email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hash = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
      email: normalizedEmail,
      password: hash,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic:
            user.profilePic || "",
          role:
            user.role || "user",
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// LOGIN
// =====================================================

export async function login(req, res, next) {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic:
            user.profilePic || "",
          role:
            user.role || "user",
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// GET CURRENT USER
// =====================================================

export async function getCurrentUser(
  req,
  res,
  next
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          firstName:
            req.user.firstName,
          lastName:
            req.user.lastName,
          email:
            req.user.email,
          profilePic:
            req.user.profilePic || "",
          role:
            req.user.role || "user",
        },
      },
    });
  } catch (error) {
    next(error);
  }
}