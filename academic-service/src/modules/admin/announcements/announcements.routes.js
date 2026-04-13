const express = require("express");
const composeRoutes = require("./compose/compose.routes");
const templatesRoutes = require("./templates/templates.routes");

const router = express.Router();

// Mount compose routes
router.use("/compose", composeRoutes);

// Mount templates routes
router.use("/templates", templatesRoutes);

// TODO: Mount history routes
// router.use("/history", historyRoutes);

module.exports = router;
