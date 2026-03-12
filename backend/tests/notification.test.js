/**
 * Notification Controller Integration Tests
 * Tests: fetchNotifications, markAsRead
 */
require('./setup');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const userModel = require('../models/userModel');
const Notification = require('../models/notificationModel');
const notificationRoutes = require('../routes/notificationRoutes');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => { req.io = { to: () => ({ emit: () => {} }) }; next(); });
app.use('/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const ALICE = { firstName:'Alice', lastName:'Dev', username:'alice_notif', email:'alice@notif.com', password:'Pass@1234' };
const BOB   = { firstName:'Bob',   lastName:'Dev', username:'bob_notif',   email:'bob@notif.com',  password:'Pass@1234' };

const registerAndLogin = async (userData) => {
    await request(app).post('/auth/register').send(userData);
    const u = await userModel.findOne({ email: userData.email });
    await request(app).post('/auth/verify-otp').send({ email: userData.email, otp: u.otp });
    const res = await request(app).post('/auth/login').send({ identifier: userData.email, password: userData.password });
    return { cookie: res.headers['set-cookie'], user: res.body.user };
};

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('Notifications — fetchNotifications', () => {
    it('returns an empty array when there are no notifications', async () => {
        const alice = await registerAndLogin(ALICE);
        const res = await request(app)
            .get('/api/notifications')
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.notifications).toEqual([]);
    });

    it('returns notifications for the logged-in user only', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        // Manually seed a notification from Bob → Alice
        await Notification.create({
            recipient: alice.user._id,
            sender: bob.user._id,
            type: 'request_received',
        });
        // Seed one for Bob, not Alice
        await Notification.create({
            recipient: bob.user._id,
            sender: alice.user._id,
            type: 'request_accepted',
        });

        const res = await request(app)
            .get('/api/notifications')
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.length).toBe(1);
        expect(res.body.notifications[0].type).toBe('request_received');
        expect(res.body.notifications[0].sender.firstName).toBe('Bob');
    });

    it('returns 401 when not authenticated', async () => {
        const res = await request(app).get('/api/notifications');
        expect(res.statusCode).toBe(401);
    });
});

describe('Notifications — markAsRead', () => {
    it('marks all unread notifications as read', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        // Seed 2 unread notifications for Alice
        await Notification.create({ recipient: alice.user._id, sender: bob.user._id, type: 'like', isRead: false });
        await Notification.create({ recipient: alice.user._id, sender: bob.user._id, type: 'comment', isRead: false });

        const markRes = await request(app)
            .post('/api/notifications/mark-read')
            .set('Cookie', alice.cookie);
        expect(markRes.statusCode).toBe(200);

        // Verify all are now read in DB
        const unread = await Notification.find({ recipient: alice.user._id, isRead: false });
        expect(unread.length).toBe(0);
    });

    it('does not affect other users\' notifications', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        await Notification.create({ recipient: bob.user._id, sender: alice.user._id, type: 'like', isRead: false });

        // Alice marks her notifications as read (she has none)
        await request(app).post('/api/notifications/mark-read').set('Cookie', alice.cookie);

        // Bob's notification should still be unread
        const bobUnread = await Notification.find({ recipient: bob.user._id, isRead: false });
        expect(bobUnread.length).toBe(1);
    });
});
