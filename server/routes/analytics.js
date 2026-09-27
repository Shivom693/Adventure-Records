import express from 'express';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET ANALYTICS SUMMARY
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const releases = await db.releases.find({ userId: user._id || user.id });

    const hasReleases = releases.length > 0;
    const currentStreams = hasReleases ? (user.streams || 0) : 0;
    const currentListeners = hasReleases ? (user.listeners || 0) : 0;

    // Stream performance chart data (last 7 months)
    const streamHistory = [
      { month: 'Dec', streams: Math.floor(currentStreams * 0.4), listeners: Math.floor(currentListeners * 0.38) },
      { month: 'Jan', streams: Math.floor(currentStreams * 0.5), listeners: Math.floor(currentListeners * 0.45) },
      { month: 'Feb', streams: Math.floor(currentStreams * 0.6), listeners: Math.floor(currentListeners * 0.58) },
      { month: 'Mar', streams: Math.floor(currentStreams * 0.75), listeners: Math.floor(currentListeners * 0.7) },
      { month: 'Apr', streams: Math.floor(currentStreams * 0.85), listeners: Math.floor(currentListeners * 0.82) },
      { month: 'May', streams: Math.floor(currentStreams * 0.95), listeners: Math.floor(currentListeners * 0.9) },
      { month: 'Jun', streams: currentStreams, listeners: currentListeners }
    ];

    // Platform distribution
    const platformData = [
      { name: 'Spotify', value: Math.floor(currentStreams * 0.48), percentage: currentStreams > 0 ? 48 : 0, color: '#1DB954' },
      { name: 'Apple Music', value: Math.floor(currentStreams * 0.22), percentage: currentStreams > 0 ? 22 : 0, color: '#FC3C44' },
      { name: 'YouTube Music', value: Math.floor(currentStreams * 0.18), percentage: currentStreams > 0 ? 18 : 0, color: '#FF0000' },
      { name: 'Amazon Music', value: Math.floor(currentStreams * 0.08), percentage: currentStreams > 0 ? 8 : 0, color: '#00A8E1' },
      { name: 'Others', value: Math.floor(currentStreams * 0.04), percentage: currentStreams > 0 ? 4 : 0, color: '#A855F7' }
    ];

    // Geographic distribution
    const countryData = [
      { name: 'India', value: Math.floor(currentStreams * 0.45), flag: '🇮🇳' },
      { name: 'United States', value: Math.floor(currentStreams * 0.25), flag: '🇺🇸' },
      { name: 'United Kingdom', value: Math.floor(currentStreams * 0.12), flag: '🇬🇧' },
      { name: 'Germany', value: Math.floor(currentStreams * 0.08), flag: '🇩🇪' },
      { name: 'Brazil', value: Math.floor(currentStreams * 0.06), flag: '🇧🇷' },
      { name: 'Japan', value: Math.floor(currentStreams * 0.04), flag: '🇯🇵' }
    ];

    // Recent activities (releases status updates, payouts, etc.)
    const recentActivity = [];

    // Add release activity
    releases.forEach(release => {
      recentActivity.push({
        type: 'Release',
        title: `Release "${release.title}" uploaded`,
        description: `Status: ${release.status}`,
        timestamp: release.createdAt || new Date().toISOString()
      });
    });

    // Add payouts activity
    if (user.payouts && user.payouts.length > 0) {
      user.payouts.forEach(payout => {
        recentActivity.push({
          type: 'Payout',
          title: `Payout Requested: ₹${payout.amount}`,
          description: `Status: ${payout.status}`,
          timestamp: payout.date || new Date().toISOString()
        });
      });
    }

    // Sort by timestamp desc
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      summary: {
        totalStreams: user.streams,
        monthlyListeners: user.listeners,
        balance: user.balance,
        totalRoyalties: user.totalRoyalties
      },
      streamHistory,
      platformData,
      countryData,
      recentActivity: recentActivity.slice(0, 10) // Limit to top 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating analytics summary.', error: error.message });
  }
});

export default router;
