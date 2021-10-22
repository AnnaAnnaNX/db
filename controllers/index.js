const { Products } = require('../models');

const { getInfoFromFile } = require('../utils/helpers');

const createProduct = async (req, res) => {
    try {
        console.log(req.file);

        // get type load file - 'ym', 'ozon', 'products', 'Ост_база'


        // get product info while type file
        const content = await getInfoFromFile('ym', req.file);

        // bulk
        const addedProducts = await Products.bulkCreate(content);
        return res.status(201).json({
            readFromFile: (content && content.length) || 0,
            added: (addedProducts && addedProducts.length) || 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
module.exports = {
    createProduct
}