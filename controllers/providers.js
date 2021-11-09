const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Providers } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');

const getProviders = async (req, res) => {
    try {
        const content = await Providers.findAll({
            raw: true
        });
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const newProvider = async (req, res) => {
    try {
        console.log('req.body');
        console.log(req.body);
        // const obj = JSON.parse(req.body);
        // console.log('obj');
        // console.log(obj);
        const content = await Providers.create(req.body);
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProviders,
    newProvider
}