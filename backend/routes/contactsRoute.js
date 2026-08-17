const express = require("express");
const router = express.Router()
const { createContact, fetchContacts, updateContact, deleteContact } = require("../controllers/contactsController")
const { contactValidator, contactUpdateValidator } = require("../validators/contactValidator")
const validte = require("../middleware/validationMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Fetch user's contacts
router.get("/", authMiddleware, fetchContacts);

// Create contact
router.post("/", authMiddleware, contactValidator, validte, createContact);

// Update contact
router.put("/:id", authMiddleware, contactUpdateValidator, validte, updateContact);

// Delete contact
router.delete("/:id", authMiddleware, deleteContact);

module.exports = router