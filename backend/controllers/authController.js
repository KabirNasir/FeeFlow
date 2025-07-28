const User = require('../models/User');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail').default; 
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */

// backend/controllers/authController.js

exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with that email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: role || 'teacher'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    // --- THIS IS THE UPDATED SECTION ---
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => ({
        msg: val.message,
        path: val.path
      }));
      return res.status(400).json({ success: false, errors: messages });
    }

    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
    // --- END OF UPDATED SECTION ---
  }
};
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, phoneNumber, role } = req.body;

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with that email already exists'
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       phoneNumber,
//       role: role || 'teacher' // Default to teacher if not specified
//     });

//     sendTokenResponse(user, 201, res);
//   } catch (error) {
//     console.error('Registration error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to register user'
//     });
//   }
// };

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with that email address'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'The password you entered is incorrect'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile information'
    });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update details error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile details'
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};


/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    // const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpire = undefined;
    // await user.save({ validateBeforeSave: false });
    // res.status(500).json({ success: false, message: 'Email could not be sent' });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};


/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

/**
 * @desc    Sign in/up with Google
 * @route   POST /api/auth/googlesignin
 * @access  Public
 */
exports.googleSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, email_verified } = ticket.getPayload();

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google email is not verified.' });
    }

    let user = await User.findOne({ email });

    // If user exists, sign them in
    if (user) {
      sendTokenResponse(user, 200, res);
    } else {
      // If user doesn't exist, create a new user
      const password = email + process.env.JWT_SECRET; // Create a dummy password
      user = await User.create({ name, email, password });
      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ success: false, message: 'Google Sign-In failed.' });
  }
};