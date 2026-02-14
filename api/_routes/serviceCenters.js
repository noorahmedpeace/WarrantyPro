const express = require('express');
const router = express.Router();
const ServiceCenter = require('../_models/ServiceCenter');

/**
 * GET /api/service-centers
 * Get all service centers with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { brand, city, category, search } = req.query;
        const query = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { brand: searchRegex },
                { city: searchRegex },
                { address: searchRegex }, // Added address search for specificity
                { categories: searchRegex }
            ];
        }

        if (brand) query.brand = new RegExp(brand, 'i');
        if (city) query.city = new RegExp(city, 'i');
        if (category) query.categories = category;

        let centers = await ServiceCenter.find(query)
            .sort({ authorized: -1, rating: -1 })
            .limit(50);

        // Lazy Seeding & Smart Update: If empty OR outdated (count < 10), re-seed
        if (Object.keys(query).length === 0) {
            const count = await ServiceCenter.countDocuments();
            // Old data had 5 items. New data has 12 items.
            // If count < 10, assume outdated and force update.
            if (count < 10) {
                console.log('Database empty or outdated, seeding service centers...');
                const seedServiceCenters = require('../_seeds/serviceCenters');
                await seedServiceCenters();
                // Re-fetch after seeding
                centers = await ServiceCenter.find({}).sort({ authorized: -1, rating: -1 }).limit(50);
            }
        }

        res.json({ centers });
    } catch (error) {
        console.error('Get service centers error:', error);
        res.status(500).json({ error: 'Failed to fetch service centers' });
    }
});

/**
 * POST /api/service-centers/seed
 * Manually trigger seeding (Fallback)
 */
router.post('/seed', async (req, res) => {
    try {
        const seedServiceCenters = require('../_seeds/serviceCenters');
        await seedServiceCenters();
        res.json({ success: true, message: 'Service centers seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: 'Failed to seed service centers' });
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
