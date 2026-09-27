import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow images and audio files
const fileFilter = (req, file, cb) => {
    const mime = file.mimetype;
    if (
        file.fieldname === 'coverArt' &&
        (mime.startsWith('image/jpeg') || mime.startsWith('image/png') || mime.startsWith('image/webp'))
    ) {
        cb(null, true);
    } else if (
        file.fieldname === 'audio' &&
        (mime.startsWith('audio/mpeg') || mime.startsWith('audio/wav') || mime.startsWith('audio/x-wav') || mime.startsWith('audio/mp3'))
    ) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for field ${file.fieldname}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30 MB max
    }
});

const cpUpload = upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'audio', maxCount: 10 }
]);

// Identity Verification Upload Config
const verifyStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'id-' + uniqueSuffix + ext);
    }
});

const verifyFileFilter = (req, file, cb) => {
    const mime = file.mimetype;
    if (
        mime.startsWith('image/jpeg') ||
        mime.startsWith('image/png') ||
        mime.startsWith('image/webp') ||
        mime === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type for ID document. PDF, PNG, JPG, and WEBP only.'), false);
    }
};

const uploadVerify = multer({
    storage: verifyStorage,
    fileFilter: verifyFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB max
    }
});

// 1. CREATE A NEW RELEASE (Artists / Labels)
router.post('/releases', authenticateToken, cpUpload, async (req, res) => {
    try {
        const { title, artistName, releaseDate, upc, isrc, tracks: tracksJSON } = req.body;

        if (!title || !artistName) {
            return res.status(400).json({ message: 'Title and Artist Name are required.' });
        }

        const coverArtFile = req.files['coverArt'] ? req.files['coverArt'][0] : null;
        const audioFiles = req.files['audio'] || [];

        if (!coverArtFile) {
            return res.status(400).json({ message: 'Cover artwork is required.' });
        }

        let tracks = [];
        if (tracksJSON) {
            try {
                tracks = JSON.parse(tracksJSON);
            } catch (err) {
                return res.status(400).json({ message: 'Tracks metadata must be valid JSON.' });
            }
        }

        // Map audio files to tracks
        // In our upload system, if there's only one track or files match sequentially
        tracks = tracks.map((track, index) => {
            const file = audioFiles[index] || audioFiles[0] || null;
            return {
                ...track,
                audioPath: file ? `/uploads/${file.filename}` : '',
                audioUrl: file ? `/uploads/${file.filename}` : '',
                isrc: track.isrc || isrc || 'AR-' + Math.floor(Math.random() * 1e8)
            };
        });

        const newRelease = await db.releases.create({
            title,
            artistName,
            releaseDate: releaseDate || new Date().toISOString().split('T')[0],
            upc: upc || 'UPC-' + Math.floor(Math.random() * 1e12),
            coverArtPath: `/uploads/${coverArtFile.filename}`,
            coverArtUrl: `/uploads/${coverArtFile.filename}`,
            status: 'Pending',
            userId: req.user._id || req.user.id,
            tracks
        });

        res.status(201).json({
            message: 'Release uploaded successfully!',
            release: newRelease
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading release.', error: error.message });
    }
});

// 2. GET ALL RELEASES (Artists see their own, Admins see all)
router.get('/releases', authenticateToken, async (req, res) => {
    try {
        let releases;
        if (req.user.role === 'Admin') {
            releases = await db.releases.find({});
        } else {
            releases = await db.releases.find({ userId: req.user._id || req.user.id });
        }
        res.status(200).json({ releases });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching releases.' });
    }
});

// 3. GET A SINGLE RELEASE BY ID
router.get('/releases/:id', authenticateToken, async (req, res) => {
    try {
        const release = await db.releases.findById(req.params.id);
        if (!release) {
            return res.status(404).json({ message: 'Release not found.' });
        }

        // Verify ownership
        if (req.user.role !== 'Admin' && release.userId !== (req.user._id || req.user.id)) {
            return res.status(403).json({ message: 'Forbidden. Access denied.' });
        }

        res.status(200).json({ release });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching release details.' });
    }
});

// 4. UPDATE RELEASE STATUS (Admins only)
router.put('/releases/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { status } = req.body;
    if (!['Pending', 'Processing', 'Distributed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid release status.' });
    }

    try {
        const release = await db.releases.findByIdAndUpdate(req.params.id, { status });
        if (!release) {
            return res.status(404).json({ message: 'Release not found.' });
        }

        res.status(200).json({
            message: `Release status updated to ${status} successfully!`,
            release
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating release status.' });
    }
});

// 5. REQUEST Payout (Artists / Labels)
router.post('/payouts', authenticateToken, async (req, res) => {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Please specify a valid amount.' });
    }

    const currentBalance = req.user.balance || 0;
    if (amount > currentBalance) {
        return res.status(400).json({ message: 'Insufficient balance for payout.' });
    }

    try {
        const updatedPayouts = [...(req.user.payouts || [])];
        const newPayout = {
            amount: Number(amount),
            date: new Date().toISOString(),
            status: 'Pending'
        };
        updatedPayouts.push(newPayout);

        const newBalance = currentBalance - Number(amount);

        const updatedUser = await db.users.findByIdAndUpdate(req.user._id || req.user.id, {
            balance: newBalance,
            payouts: updatedPayouts
        });

        res.status(200).json({
            message: 'Payout request submitted successfully!',
            balance: newBalance,
            payouts: updatedPayouts
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payout request.', error: error.message });
    }
});

// 6. UPDATE USER BALANCES & STREAMS (Admins only - to simulate streams/royalties updates)
router.put('/users/:id/royalties', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { streams, listeners, balance, totalRoyalties } = req.body;

    try {
        const user = await db.users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updates = {};
        if (streams !== undefined) updates.streams = Number(streams);
        if (listeners !== undefined) updates.listeners = Number(listeners);
        if (balance !== undefined) updates.balance = Number(balance);
        if (totalRoyalties !== undefined) updates.totalRoyalties = Number(totalRoyalties);

        const updatedUser = await db.users.findByIdAndUpdate(req.params.id, updates);

        res.status(200).json({
            message: 'User streams and royalties updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user stats.' });
    }
});

// 7. GET ALL USERS (Admins only)
router.get('/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }
    try {
        const allUsers = await db.users.find({});
        // Remove passwords
        const sanitizedUsers = allUsers.map(user => {
            const u = { ...user };
            delete u.password;
            return u;
        });
        res.status(200).json({ users: sanitizedUsers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users list.' });
    }
});

// 8. APPROVE/DENY PAYOUT REQUESTS (Admins only)
router.put('/admin/payouts/:userId/:payoutId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { status } = req.body; // 'Paid' or 'Cancelled'
    if (!['Paid', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        const user = await db.users.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const payouts = [...(user.payouts || [])];
        const payoutIndex = req.params.payoutId; // We can match by index or date

        if (payouts[payoutIndex]) {
            const oldStatus = payouts[payoutIndex].status;
            payouts[payoutIndex].status = status;

            // If cancelled, return funds back to balance
            let newBalance = user.balance;
            if (status === 'Cancelled' && oldStatus === 'Pending') {
                newBalance += payouts[payoutIndex].amount;
            }

            const updatedUser = await db.users.findByIdAndUpdate(req.params.userId, {
                payouts,
                balance: newBalance
            });

            return res.status(200).json({ message: `Payout status updated to ${status}!`, user: updatedUser });
        }

        res.status(404).json({ message: 'Payout request not found.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payout status.' });
    }
});

// 9. ARTIST VERIFICATION ID UPLOAD
router.post('/verify-profile', authenticateToken, uploadVerify.single('idFile'), async (req, res) => {
    try {
        const { legalName } = req.body;
        if (!legalName) {
            return res.status(400).json({ message: 'Legal name is required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Verification ID scan file is required.' });
        }

        const idFilePath = `/uploads/${req.file.filename}`;

        const updatedUser = await db.users.findByIdAndUpdate(req.user._id || req.user.id, {
            legalName,
            idFilePath,
            verificationStatus: 'Pending'
        });

        res.status(200).json({
            message: 'Verification document uploaded successfully. Review pending.',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading verification document.', error: error.message });
    }
});

export default router;
