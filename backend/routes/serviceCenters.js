const express = require('express');
const router = express.Router();
const ServiceCenter = require('../models/ServiceCenter');

/**
 * GET /api/service-centers
 * Get all service centers with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { brand, city, category } = req.query;
        const query = {};

        if (brand) query.brand = new RegExp(brand, 'i');
        if (city) query.city = new RegExp(city, 'i');
        if (category) query.categories = category;

        const centers = await ServiceCenter.find(query)
            .sort({ authorized: -1, rating: -1 })
            .limit(50);

        res.json({ centers });
    } catch (error) {
        console.error('Get service centers error:', error);
        res.status(500).json({ error: 'Failed to fetch service centers' });
    }
});

/**
 * GET /api/service-centers/brands
 * Get list of available brands
 */
router.get('/brands', async (req, res) => {
    try {
        const brands = await ServiceCenter.distinct('brand');
        res.json({ brands: brands.sort() });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Failed to fetch brands' });
    }
});

/**
 * GET /api/service-centers/:id
 * Get single service center details
 */
router.get('/:id', async (req, res) => {
    try {
        const center = await ServiceCenter.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ error: 'Service center not found' });
        }
        res.json({ center });
    } catch (error) {
        console.error('Get center error:', error);
        res.status(500).json({ error: 'Failed to fetch service center' });
    }
});

// Admin/Seeding routes could go here (protected)

module.exports = router;
