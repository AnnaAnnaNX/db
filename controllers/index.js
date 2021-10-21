const { Product } = require('../models');
const createProduct = async (req, res) => {
    try {
        console.log(req.file);

        const product = await Product.create(req.body);
        return res.status(201).json({
            product,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
module.exports = {
    createProduct
}