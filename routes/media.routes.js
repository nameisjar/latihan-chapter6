const router = require('express').Router();
const { imageStorage, videoStorage, documentStorage, image, video, document } = require('../libs/multer');
const { singleUpload, multiUpload, imagekit, updateProfile, generateQrCode } = require('../controllers/media.controllers');

router.post('/storage/images', imageStorage.single('image'), singleUpload);
router.post('/storage/videos', videoStorage.single('video'), singleUpload);
router.post('/storage/documents', documentStorage.single('document'), singleUpload);

router.post('/storage/multi/images', imageStorage.array('image'), multiUpload);

router.post('/imagekit/images', image.single('image'), imagekit);
router.post('/imagekit/videos', video.single('video'), imagekit);
router.post('/imagekit/documents', document.single('document'), imagekit);
router.post('/imagekit/qr-codes', generateQrCode);

router.put('/updateprofile', image.single('image'), updateProfile);


module.exports = router;