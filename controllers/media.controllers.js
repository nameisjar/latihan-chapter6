const imagekit = require('../libs/imagekit');
const path = require('path');
const qr = require('qr-image');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    singleUpload: (req, res) => {
        let folder = req.file.destination.split('public/')[1];
        const fileUrl = `${req.protocol}://${req.get('host')}/${folder}/${req.file.filename}`;

        return res.json({
            status: true,
            message: 'OK',
            error: null,
            data: { file_url: fileUrl }
        });
    },

    multiUpload: (req, res) => {
        let fileUrls = [];
        req.files.forEach(file => {
            let folder = file.destination.split('public/')[1];
            const fileUrl = `${req.protocol}://${req.get('host')}/${folder}/${file.filename}`;
            fileUrls.push(fileUrl);
        });

        return res.json({
            status: true,
            message: 'OK',
            error: null,
            data: { file_urls: fileUrls }
        });
    },


    imagekit: async (req, res, next) => {
        try {
            // contoh baca dari request multipart
            let { first_name, last_name } = req.body;

            let strFile = req.file.buffer.toString('base64');

            let { url } = await imagekit.upload({
                fileName: Date.now() + path.extname(req.file.originalname),
                file: strFile
            });

            return res.json({
                status: true,
                message: 'OK',
                error: null,
                data: { file_url: url, first_name, last_name }
            });
        } catch (err) {
            next(err);
        }
    },
    // updateProfile: async (req, res, next) => {
    //     try {
    //         // contoh baca dari request multipart
    //         let { first_name, last_name, birth_date, userId } = req.body;

    //         let strFile = req.file.buffer.toString('base64');

    //         let { url } = await imagekit.upload({
    //             fileName: Date.now() + path.extname(req.file.originalname),
    //             file: strFile
    //         });

    //         let userProfile = await prisma.userProfile.create({
    //             data: {
    //                 first_name,
    //                 last_name,
    //                 birth_date,
    //                 profile_picture: url,
    //                 user:
    //                     {
    //                         connect: {
    //                             id: Number(userId)
    //                         }
    //                     }
    //             }
    //         });

    //         return res.json({
    //             status: true,
    //             message: 'OK',
    //             error: null,
    //             data: { file_url: url, first_name, last_name, birth_date }
    //         });
    //     } catch (err) {
    //         next(err);
    //     }
    // },

    updateProfile: async (req, res, next) => {
        try {
            // Mendapatkan data dari permintaan multipart
            let { first_name, last_name, birth_date, userId } = req.body;
            let strFile = req.file.buffer.toString('base64');

            // Mengunggah gambar ke ImageKit
            let { url } = await imagekit.upload({
                fileName: Date.now() + path.extname(req.file.originalname),
                file: strFile
            });

            // Melakukan upsert pada profil pengguna
            let userProfile = await prisma.userProfile.upsert({
                where: {
                    userId: Number(userId) // Gantilah dengan kolom yang sesuai pada profil pengguna yang menunjukkan ID pengguna
                },
                create: {
                    first_name,
                    last_name,
                    birth_date,
                    profile_picture: url,
                    user: {
                        connect: {
                            id: Number(userId)
                        }
                    }
                },
                update: {
                    first_name,
                    last_name,
                    birth_date,
                    profile_picture: url
                }
            });

            return res.json({
                status: true,
                message: 'OK',
                error: null,
                data: {
                    file_url: url,
                    first_name,
                    last_name,
                    birth_date
                }
            });
        } catch (err) {
            next(err);
        }
    },

    generateQrCode: async (req, res, next) => {
        try {
            let { qr_data } = req.body;
            if (!qr_data) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    error: 'qr_data is required!',
                    data: null
                });
            }

            let qrPng = qr.imageSync(qr_data, { type: 'png' });
            let { url } = await imagekit.upload({
                fileName: Date.now() + '.png',
                file: qrPng.toString('base64')
            });

            return res.json({
                status: true,
                message: 'OK',
                error: null,
                data: { qr_code_url: url }
            });
        } catch (err) {
            next(err);
        }
    },


    authenticate: async (req, res, next) => {
        try {
            const user = req.user;
            const profile = await prisma.userProfile.findUnique({
                where: { userId: user.id }
            });
            return res.status(200).json({
                status: true,
                message: 'OK',
                error: null,
                data: { user: { ...profile, email: user.email } }
            });
        } catch (error) {
            next(error);
        }
    }
};