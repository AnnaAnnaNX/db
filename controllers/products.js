const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Products } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');

const getMainProducts = async (req, res) => {
    try {
        const content = await Products.findAll({
            raw: true
        });
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMainProducts
}