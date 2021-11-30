const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Providers, ProvidersProducts, MainProducts } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');
const { getInfoFromAllFile } = require('../utils/helpers');
const { traceDeprecation } = require('process');
const mainProducts = require('../models/mainProducts');

const readProviderFile = async (req, res) => {
    console.log('readProviderFile');
    try {
        console.log(req.file);

        const idProvider  = req && req.body && req.body.idProvider;
        if (!idProvider) {
            throw new Error('not found idProvider');
        }

        // get product info while type file
        const content = await getInfoFromAllFile(parseInt(idProvider, 10), req.file);
        res.json(content);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const addProviderProducts = async (req, res) => {
    try {
        const rows = req && req.body && req.body.rows;
        console.log(req.body);
        if (!rows) {
            throw new Error('empty content');
        }
        const idProvider = rows && rows.length && rows[0] && rows[0].idProvider;
        if (!idProvider) {
            throw new Error('not found idProvider');
        }
        const existanceProduct = await ProvidersProducts.findAll({
            where: {
                idProvider
            }
        });
        console.log('existanceProduct');
        console.log(JSON.stringify(existanceProduct));
        const obj = {};
        existanceProduct.forEach((el) => {
            obj[el.idProductProvider] = el.id;
        });
        const objKeys = Object.keys(obj);

        const provider = await Providers.findOne({
            where: {
                id: idProvider
            }
        });
        const providerName = provider && provider.nameProvider;
        console.log('providerName');
        console.log(providerName);

        let updateCount = 0;
        rows.map((el) => {            
            if (providerName === 'markup') {
                el.idMainProduct = parseInt(el.idProductProvider, 10);
            }
            if (objKeys.includes((el.idProductProvider).toString())) {
                updateCount++;
                return {
                    ...el,
                    id: (obj[(el.idProductProvider).toString()])
                }
            }
            return el;
        });

        await ProvidersProducts.bulkCreate(rows);
        res.json( {
            created: rows.length - updateCount,
            updated: updateCount
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getProviderProducts = async (req, res) => {
    try {
        const content = await ProvidersProducts.findAll({
            raw: true
        });
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const addLink = async (req, res) => {
    console.log('addLink');
    try {
        console.log(req.body);
        const idProvider = req.body && req.body.idProvider;
        const idProductProvider = req.body && req.body.idProductProvider;
        let idMainProduct = req.body && req.body.idMainProduct;
        if (!idMainProduct) {
            const result = await MainProducts.create(
                { name: 'test' },
                { raw: true }
            );
            console.log(result);
            idMainProduct = result.dataValues && result.dataValues.id;
            console.log(idMainProduct);
        }
        if (!idProvider || !idProductProvider || !idMainProduct) {
            throw new Error('not values');
        }
        const providersProduct = await ProvidersProducts.findOne({
            where: {
                idProvider,
                idProductProvider
            }
        });
        const id = providersProduct && providersProduct.dataValues && providersProduct.dataValues.id;
        
        console.log(`id ${id}`);
        await ProvidersProducts.update({
            idMainProduct
        }, {
            where: {id: id}
        });
        console.log(222);
        res.status(200).json({});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getAssort = async () => {
    try {
        const providerProducts = await ProvidersProducts.findAll({
            raw: true
        });
        const providers = await Providers.findAll({
            raw: true
        });
        const mainProducts = await MainProducts.findAll({
            raw: true
        });
        if (!mainProducts || !providerProducts || !providers) {
            return {
                rows: [],
                shortListHeaders: [],
            }
          }
          const mainIds = mainProducts.map((el) => (el.id));
          const obj = {};
          mainIds.forEach((el) => {obj[el] = {}});
          // иметь сопоставление idProvider с именем провайдера
          // nameProviderIdProviderObj {idProvider: nameProvider}
          const nameProviderIdProviderObj = {};
          providers.forEach((provider) => {
            if (provider.id) {
              nameProviderIdProviderObj[provider.nameProvider] = {
                id: provider.id,
                fieldsNames: provider.fieldsNames && JSON.parse(provider.fieldsNames)
              };
            }
          });
          const idProviderNameProviderObj = {};
          providers.forEach((provider) => {
            if (provider.id && provider.nameProvider) {
              idProviderNameProviderObj[provider.id] = provider.nameProvider;
            }
          });
          providerProducts.forEach((el) => {
            if (el.idMainProduct) {
              // obj[idMainProduct][`count #${el.idProvider}`] = el.count;
              
              if (nameProviderIdProviderObj['YM'] &&
                (el.idProvider === nameProviderIdProviderObj['YM'].id)) {
                obj[el.idMainProduct]['YMId'] = el.idProductProvider;
                const fieldsNames = nameProviderIdProviderObj['YM'].fieldsNames;
                let n = fieldsNames.indexOf('categoryInOurShope');
                let values = el.values && JSON.parse(el.values);
                obj[el.idMainProduct]['categoryInOurShope'] = values && values[n];
                
                n = fieldsNames.indexOf('name');
                 values = el.values && JSON.parse(el.values);
                obj[el.idMainProduct]['YMName'] = values && values[n];
              } else
              if (nameProviderIdProviderObj['Ozon'] &&
                (el.idProvider === nameProviderIdProviderObj['Ozon'].id)) {
                obj[el.idMainProduct]['OzonId'] = el.idProductProvider;
                const fieldsNames = nameProviderIdProviderObj['Ozon'].fieldsNames;
                const n = fieldsNames.indexOf('name');
                const values = el.values && JSON.parse(el.values); 
                obj[el.idMainProduct]['OzonName'] = values && values[n];
              } else
              if (nameProviderIdProviderObj['1C'] &&
                (el.idProvider === nameProviderIdProviderObj['1C'].id)) {
                obj[el.idMainProduct]['1CId'] = el.idProductProvider;
                const values = el.values && JSON.parse(el.values); 
                const fieldsNames = nameProviderIdProviderObj['1C'].fieldsNames;
                let n = fieldsNames.indexOf('name');
                obj[el.idMainProduct]['1CName'] = values && values[n];
                n = fieldsNames.indexOf('price');
                obj[el.idMainProduct]['1CPrice'] = values && values[n];
                obj[el.idMainProduct]['1CUpdate'] = el.updatedAt;
              } else    
              if (nameProviderIdProviderObj['markup'] &&
                (el.idProvider === nameProviderIdProviderObj['markup'].id)) {
                obj[el.idMainProduct]['markupId'] = el.idProductProvider;
                const values = el.values && JSON.parse(el.values);
                const fieldsNames = nameProviderIdProviderObj['markup'].fieldsNames;
                let n = fieldsNames.indexOf('markup');
                obj[el.idMainProduct]['markup'] = values && values[n];
              } else
              // здесь только поставщики (берем любого поставщика)
              if (!obj[el.idMainProduct]['providerName']) {            
                console.log('el.idProvider');
                console.log(el.idProvider);
                const providerName = idProviderNameProviderObj[el.idProvider];
                console.log('providerName');
                console.log(providerName);
                obj[el.idMainProduct]['providerName'] = providerName;
                const fieldsNames = nameProviderIdProviderObj[providerName]
                && nameProviderIdProviderObj[providerName].fieldsNames;
                let n = fieldsNames && fieldsNames.indexOf('name');
                const values = el.values && JSON.parse(el.values); 
                obj[el.idMainProduct]['providerProductName'] = values && values[n];
                n = fieldsNames && fieldsNames.indexOf('price');
                obj[el.idMainProduct]['providerProductprice'] = values && values[n];
                obj[el.idMainProduct]['providerProductUpdate'] = el.updatedAt;
              }
              // newPrice
              if (obj[el.idMainProduct]['providerProductprice']
                && obj[el.idMainProduct]['1CPrice']) {
                  const dataProvider = obj[el.idMainProduct]['providerProductUpdate']
                    &&  moment(obj[el.idMainProduct]['providerProductUpdate']);
                  const data1C = obj[el.idMainProduct]['1CUpdate']
                    &&  moment(obj[el.idMainProduct]['1CUpdate']);
                  console.log('dataProvider');
                  console.log(dataProvider);
                  console.log('data1C');
                  console.log(data1C);
              }
    
              // берет цену поставщика или если ее нет, то цену 1С
              if (obj[el.idMainProduct]['markup']
                || obj[el.idMainProduct]['providerProductprice']
                || obj[el.idMainProduct]['1CPrice']) {
                  const val = obj[el.idMainProduct]['markup'] * (obj[el.idMainProduct]['providerProductprice']
                || obj[el.idMainProduct]['1CPrice']);
                if (val) {
                  obj[el.idMainProduct]['newPrice'] = Math.round(val);
                }
              }   
    
            }
          });
          const rows = Object.keys(obj).map((id) => ({id: id, ...obj[id]}));
          console.log('rows');
          console.log(rows);
          const shortListHeaders = [
            'YMId',
            'YMName',
            'OzonId',
            'OzonName',
            '1CId',
            '1CName',
            '1CPrice',
            // '1CUpdate',
            'markupId',
            'markup',
            'providerName',
            'providerProductName',
            'providerProductprice',
            // 'providerProductUpdate',
            'newPrice'
          ];

          return {
            rows,
            shortListHeaders: ['id', ...shortListHeaders],
          };
    } catch (error) {
        return error;
    }
}

module.exports = {
    readProviderFile,
    addProviderProducts,
    getProviderProducts,
    addLink,
    getAssort
}