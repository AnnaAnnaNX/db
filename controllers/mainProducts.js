const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { MainProducts } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');

const getMainProducts = async (req, res) => {
    try {
        const content = await MainProducts.findAll();
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const writeRowsInExcel = async (req, res) => {
    try {
        const headers = req && req.body && req.body.headers;
        const rows = req && req.body && req.body.rows;
        // res.status(200).json({ data: rows });


        // await setPricies(files[0]);
    
        const filePath = path.join(__dirname, '../files/result (44).xlsx');
        res.download(filePath);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMainProducts,
    writeRowsInExcel
}