import bcrypt from "bcryptjs";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// =====================================================
// GET MY PROFILE
// =====================================================

export const getMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select(
      "-password -token -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE MY PROFILE
// =====================================================

export const updateMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const {
      firstName,
      lastName,
      email,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // Validate email
    // ---------------------------------------------

    if (
      email &&
      email.trim().toLowerCase() !== user.email
    ) {
      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: req.user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email is already registered",
        });
      }

      user.email = normalizedEmail;
    }

    // ---------------------------------------------
    // Update first name
    // ---------------------------------------------

    if (firstName !== undefined) {
      user.firstName =
        firstName.trim();
    }

    // ---------------------------------------------
    // Update last name
    // ---------------------------------------------

    if (lastName !== undefined) {
      user.lastName =
        lastName.trim();
    }

    await user.save();

    // ---------------------------------------------
    // Return updated user
    // ---------------------------------------------

    const updatedUser =
      await User.findById(
        user._id
      ).select(
        "-password -token -otp -otpExpiry"
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ---------------------------------------------
    // Validate input
    // ---------------------------------------------

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    // ---------------------------------------------
    // Validate new password
    // ---------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // Verify current password
    // ---------------------------------------------

    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ---------------------------------------------
    // Prevent same password
    // ---------------------------------------------

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ---------------------------------------------
    // Hash new password
    // ---------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE PROFILE PICTURE
// =====================================================

export const updateProfilePicture = async (
  req,
  res,
  next
) => {
  try {
    // ---------------------------------------------
    // Check uploaded file
    // ---------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // Delete old profile picture
    // ---------------------------------------------

    if (user.profilePicPublicId) {
      try {
        await cloudinary.uploader.destroy(
          user.profilePicPublicId,
          {
            resource_type: "image",
          }
        );
      } catch (error) {
        console.error(
          "Old profile picture deletion failed:",
          error
        );
      }
    }

    // ---------------------------------------------
    // Upload new image to Cloudinary
    // ---------------------------------------------

    const uploadResult =
      await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "genome/profile-pictures",
                resource_type:
                  "image",
              },
              (
                error,
                result
              ) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(
            req.file.buffer
          );
        }
      );

    // ---------------------------------------------
    // Save Cloudinary information
    // ---------------------------------------------

    user.profilePic =
      uploadResult.secure_url;

    user.profilePicPublicId =
      uploadResult.public_id;

    await user.save();

    // ---------------------------------------------
    // Get updated user
    // ---------------------------------------------

    const updatedUser =
      await User.findById(
        user._id
      ).select(
        "-password -token -otp -otpExpiry"
      );

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "Profile picture update error:",
      error
    );

    next(error);
  }
};

// =====================================================
// DELETE MY ACCOUNT
// =====================================================

export const deleteMyAccount = async (
  req,
  res,
  next
) => {
  try {
    const {
      password,
    } = req.body;

    // ---------------------------------------------
    // Validate password
    // ---------------------------------------------

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ---------------------------------------------
    // Verify password
    // ---------------------------------------------

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // ---------------------------------------------
    // Delete profile picture from Cloudinary
    // ---------------------------------------------

    if (user.profilePicPublicId) {
      try {
        await cloudinary.uploader.destroy(
          user.profilePicPublicId,
          {
            resource_type: "image",
          }
        );
      } catch (error) {
        console.error(
          "Profile image deletion failed:",
          error
        );
      }
    }

    // ---------------------------------------------
    // Delete user from MongoDB
    // ---------------------------------------------

    await User.findByIdAndDelete(
      user._id
    );

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};