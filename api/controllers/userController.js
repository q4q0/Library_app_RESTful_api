const { User } = require('../models');
const { genSalt, hash, compare } = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  okLogger,
  createdLogger,
  badRequestLogger,
  forbiddenLogger,
  notFoundLogger,
} = require('../utils/loggerMethods');
const { validationResult } = require('express-validator');

/**
 * @description   To create a new user
 * @route         POST => api/v1/users/register
 * @access        Public
 */

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequestLogger(req);
      return res.status(400).json({
        success: false,
        msg: 'Validation errors',
        errors: errors.array(),
      });
    }
    const body = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    body.password = await hash(body.password, salt);
    const createdUser = await User.create(body);
    createdLogger(req);
    res.status(201).json({
      success: true,
      message: `User with email ${body.email} created successfully`,
      data: createdUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @description   To authorize a user to login
 * @route         POST => api/v1/users/login
 * @access        Public
 */

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequestLogger(req);
      return res.status(400).json({
        success: false,
        msg: 'Validation errors',
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    const match = await compare(password, user.password);
    if (match) {
      const accessToken = jwt.sign(
        {
          email: user.email,
          userId: user.id,
        },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );
      okLogger(req);
      res.status(200).json({
        success: true,
        message: `User with email ${email} logged in successfully`,
        accessToken: accessToken,
      });
    } else {
      forbiddenLogger(req);
      return res.status(403).json({
        success: false,
        message: 'Invalid credentials',
        data: {},
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @description   fetch all users
 * @route         GET => api/v1/users/
 * @access        Public
 */

const fetchAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    if (!users) {
      notFoundLogger(req);
      return res.status(404).json({
        success: false,
        message: 'There is no users found in the database',
        data: {},
      });
    }
    okLogger(req);
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @description   To fetch a user by id
 * @route         GET => api/v1/user/
 * @access        Public
 */

const fetchUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const fetchedUser = await User.findByPk(userId);
    if (!fetchedUser) {
      notFoundLogger(req);
      return res.status(404).json({
        success: false,
        message: `User with id ${userId} not found in the database`,
        data: {},
      });
    }
    okLogger(req);
    res.status(200).json({
      success: true,
      message: `User with id ${userId} fetched successfully`,
      data: fetchedUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @description   To delete a user by id
 * @route         POST => api/v1/users/
 * @access        Private
 */

const deleteUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.destroy({ where: { id: userId } });
    if (!deletedUser) {
      notFoundLogger(req);
      return res.status(404).json({
        success: false,
        message: `User with id ${userId} not found`,
        data: {},
      });
    }
    okLogger(req);
    res.status(200).json({
      success: true,
      message: `User with id ${userId} deleted successfully`,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @description   To delete a update by id
 * @route         POST => api/v1/users/
 * @access        Private
 */

const updateUserById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequestLogger(req);
      return res.status(400).json({
        success: false,
        msg: 'Validation errors',
        errors: errors.array(),
      });
    }
    const userId = req.params.id;
    const body = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    body.password = await hash(body.password, salt);
    const foundUser = await User.findByPk(userId);
    if (!foundUser) {
      notFoundLogger(req);
      return res.status(404).json({
        success: true,
        message: `User with id ${userId} not found`,
        data: {},
      });
    }
    await User.update(body, { where: { id: userId } });
    okLogger(req);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: body,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  fetchAllUsers,
  fetchUserById,
  deleteUserById,
  updateUserById,
};
