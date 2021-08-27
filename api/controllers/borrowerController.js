const { Borrower } = require("../models");
const { validationResult } = require("express-validator");
const {
  okLogger,
  createdLogger,
  badRequestLogger,
  notFoundLogger,
} = require("../utils/loggerMethods");

const fetchAllBorrowers = async (req, res, next) => {
  try {
    const borrowers = await Borrower.findAll();
    if (!borrowers) {
      return res.status(404).json({
        success: false,
        message: `There is no borrowers in the database right now not`,
        data: {},
      });
    }
    okLogger(req);
    res.status(200).json({
      success: true,
      message: "Borrowers fetched successfully",
      data: borrowers,
    });
  } catch (err) {
    next(err);
  }
};

const fetchBorrowerById = async (req, res, next) => {
  try {
    const borrowerId = req.params.id;
    const borrower = await Book.findByPk(borrowerId);
    if (!borrower) {
      notFoundLogger(req);
      return res.status(404).json({
        success: false,
        message: `Borrower with id ${borrowerId} not found in the database`,
        data: {},
      });
    }
    okLogger(req);
    res.status(200).json({
      success: true,
      message: `Borrower with id ${borrowerId} fetched successfully`,
      data: borrower,
    });
  } catch (err) {
    next(err);
  }
};

const fetchAllBookByBorrowerId = async (req, res, next) => {
  try {
  } catch (err) {}
};

const createBorrower = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequestLogger(req);
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }
    const body = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      issueDate: req.body.issueDate,
      dueDate: req.body.dueDate,
    };
    const createdBorrower = await Borrower.create(body);
    createdLogger(req);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: createdBorrower,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBorrower,
  fetchAllBorrowers,
  fetchBorrowerById,
  fetchAllBookByBorrowerId,
};
