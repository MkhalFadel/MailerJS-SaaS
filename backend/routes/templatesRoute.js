const express = require("express");
const router = express.Router();
const { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = require("../controllers/templatesController")
const authMiddleware = require("../middleware/authMiddleware")
const { templatesValidator, templatesUpdateValidator } = require("../validators/templatesValidator");
const validate = require("../middleware/validationMiddleware")

// Fetch user's templates
router.get("/", authMiddleware, fetchTemplates);

// Create template
router.post("/", authMiddleware, templatesValidator, validate, createTemplate);

// Update template
router.put("/:id", authMiddleware, templatesUpdateValidator, validate, updateTemplate);

// Delet template
router.delete("/:id", authMiddleware, deleteTemplate);

module.exports = router;