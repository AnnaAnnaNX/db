const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { MainProducts } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');
const ExcelJS = require('exceljs');

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
        console.log('headers');
        console.log(headers);
        console.log('rows');
        console.log(rows);
        // res.status(200).json({ data: rows });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ассортимент');
        const filePath = path.join(__dirname, '../files/result (44).xlsx');

        const headersArr = headers.map(el => (el.value ? el.value : el));
        const rowsArr = rows.map(row => {
            const arr = [];
            headersArr.forEach((header) => {
                if (row && header && row[header]) {
                    arr.push(row[header]);
                } else {
                    arr.push(null);
                }
            });
            return arr;
        });
        const alf = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const rowExcel = worksheet.getRow(1);
        headersArr.forEach((header, j) => {
            rowExcel.getCell(alf[j]).value = header;
        });
        rowsArr.forEach((row, i) => {
            const rowExcel = worksheet.getRow(i + 2);
            headersArr.forEach((header, j) => {
                rowExcel.getCell(alf[j]).value = row[j];
            });
        })

    

        await workbook.xlsx.writeFile(filePath);


        // await setPricies(files[0]);
    

        res.download(filePath);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const writeMarkupInExcel = async (req, res) => {
    try {
        const headers = req && req.body && req.body.headers;
        const rows = req && req.body && req.body.rows;
        console.log('headers');
        console.log(headers);
        console.log('rows');
        console.log(rows);
        // res.status(200).json({ data: rows });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ассортимент');
        const filePath = path.join(__dirname, '../files/result (44).xlsx');

        // const headersArr = headers.map(el => (el.value));
        const headersArr = ['id', 'YMName', 'OzonName', '1CId', 'markup'];

        const rowsArr = rows.map(row => {
            const arr = [];
            headersArr.forEach((header) => {
                if (row && header && row[header]) {
                    arr.push(row[header]);
                } else {
                    arr.push(null);
                }
            });
            return arr;
        });
        const alf = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        rowsArr.forEach((row, i) => {
            const rowExcel = worksheet.getRow(i + 2);
            headersArr.forEach((header, j) => {
                if (header === 'id') {
                    rowExcel.getCell(alf[j]).value = parseInt(row[j], 10);
                } else {
                    rowExcel.getCell(alf[j]).value = row[j];
                }
            });
        })
        const rowExcel = worksheet.getRow(1);
        ['idMainProduct', 'name YM', 'name Ozon', '1C code', 'markup'].forEach((header, j) => {
            rowExcel.getCell(alf[j]).value = header;
        });
    

        await workbook.xlsx.writeFile(filePath);


        // await setPricies(files[0]);
    

        res.download(filePath);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMainProducts,
    writeRowsInExcel,
    writeMarkupInExcel
}