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
const router = Router();

router.get('/', (req, res) => res.send('This is root!'))
router.post('/createProduct', upload.single('file1'), controllers.createProduct);
router.get('/getUmlYml', controllers.getUmlYml);
router.get('/getUmlOzon', controllers.getUmlOzon);
router.get('/getProducts', controllers.getProducts);
module.exports = router;