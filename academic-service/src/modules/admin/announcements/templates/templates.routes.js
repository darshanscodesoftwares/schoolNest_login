const express = require("express");
const templatesController = require("./templates.controller");

const router = express.Router();

// Template routes
router.post("/", templatesController.createTemplate);
router.get("/", templatesController.getAllTemplates);
router.get("/:templateId", templatesController.getTemplateById);
router.patch("/:templateId", templatesController.updateTemplate);
router.delete("/:templateId", templatesController.deleteTemplate);

module.exports = router;
