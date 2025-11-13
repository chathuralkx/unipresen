const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth } = require('../middleware/auth');

// Public routes (anyone can view resources)
router.get('/', auth, resourceController.getAllResources);
router.get('/types', auth, resourceController.getResourceTypes);
router.get('/:id', auth, resourceController.getResourceById);

// Protected routes (only admin and office_staff)
router.post('/', auth, resourceController.createResource);
router.put('/:id', auth, resourceController.updateResource);
router.delete('/:id', auth, resourceController.deleteResource);

module.exports = router;