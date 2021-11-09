const path = require('path');
const { Router } = require('express');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage });

const controllers = require('../controllers');
const providerController = require('../controllers/providers');
const providerProductsController = require('../controllers/providerProducts');
const router = Router();

router.get('/', (req, res) => res.send('This is root!'))
router.post('/createProduct', upload.single('file1'), controllers.createProduct);
router.post('/readYmOrOzonExcel', upload.single('file1'), controllers.readYmOrOzonExcel);
router.get('/getUmlYml', controllers.getUmlYml);
router.get('/getUmlOzon', controllers.getUmlOzon);
router.get('/getProducts', controllers.getProducts);
router.get('/getProviders', providerController.getProviders);
router.post('/newProvider', providerController.newProvider);
router.post('/readProviderFile', upload.single('file1'), providerProductsController.readProviderFile);
router.post('/addProviderProducts', providerProductsController.addProviderProducts);

module.exports = router;