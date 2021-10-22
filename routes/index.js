const { Router } = require('express');

const multer = require('multer');
const upload = multer({ dest: './files' });

const controllers = require('../controllers');
const router = Router();

router.get('/', (req, res) => res.send('This is root!'))
router.post('/createProduct', upload.single('file1'), controllers.createProduct);
router.get('/getUmlYml', controllers.getUmlYml);
router.get('/getUmlOzon', controllers.getUmlOzon);
module.exports = router;