/**
 * Feed & Connection Controller Integration Tests
 * Tests: sendRequest, acceptRequest, declineRequest, removeConnection,
 *        fetchAllRequest, fetchAllConnections, markNotInterested, fetchFeed
 */
require('./setup');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const userModel = require('../models/userModel');
const feedRoutes = require('../routes/feedRoutes');
const postRoutes = require('../routes/postRoutes');
const authRoutes = require('../routes/authRoutes');
const ConnectionRequest = require('../models/connectionRequestModel');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => { req.io = { to: () => ({ emit: () => {} }) }; next(); });
app.use('/auth', authRoutes);
app.use('/api', feedRoutes);
app.use('/api/posts', postRoutes);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const ALICE = { firstName:'Alice', lastName:'Dev', username:'alice_feed', email:'alice@feed.com', password:'Pass@1234' };
const BOB   = { firstName:'Bob',   lastName:'Dev', username:'bob_feed',   email:'bob@feed.com',  password:'Pass@1234' };

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
describe('Feed — sendRequest', () => {
    it('creates a connection request between two users', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        const res = await request(app)
            .post(`/api/send-request/${bob.user._id}`)
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(200);

        const req = await ConnectionRequest.findOne({ senderId: alice.user._id, receiverId: bob.user._id });
        expect(req).not.toBeNull();
        expect(req.status).toBe('interested');
    });

    it('returns 400 on duplicate request', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        const res = await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(400);
    });

    it('returns 400 when sending request to self', async () => {
        const alice = await registerAndLogin(ALICE);
        const res = await request(app)
            .post(`/api/send-request/${alice.user._id}`)
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(400);
    });
});

describe('Feed — fetchAllRequest / acceptRequest / declineRequest', () => {
    it('shows pending requests to receiver, and acceptRequest changes status to accepted', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        // Alice sends Bob a request
        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);

        // Bob checks his requests
        const reqRes = await request(app).get('/api/requests').set('Cookie', bob.cookie);
        expect(reqRes.body.requests.length).toBe(1);
        expect(reqRes.body.requests[0]._id).toBe(alice.user._id);

        // Bob accepts
        const acceptRes = await request(app)
            .post(`/api/accept-request/${alice.user._id}`)
            .set('Cookie', bob.cookie);
        expect(acceptRes.statusCode).toBe(200);

        const conn = await ConnectionRequest.findOne({ senderId: alice.user._id, receiverId: bob.user._id });
        expect(conn.status).toBe('accepted');
    });

    it('declineRequest changes status to rejected', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        const declineRes = await request(app)
            .post(`/api/decline-request/${alice.user._id}`)
            .set('Cookie', bob.cookie);
        expect(declineRes.statusCode).toBe(200);

        const conn = await ConnectionRequest.findOne({ senderId: alice.user._id, receiverId: bob.user._id });
        expect(conn.status).toBe('rejected');
    });
});

describe('Feed — fetchAllConnections', () => {
    it('returns accepted connections for both sender and receiver', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        await request(app).post(`/api/accept-request/${alice.user._id}`).set('Cookie', bob.cookie);

        const aliceConns = await request(app).get('/api/connections').set('Cookie', alice.cookie);
        expect(aliceConns.body.connections.length).toBe(1);
        expect(aliceConns.body.connections[0]._id).toBe(bob.user._id);

        const bobConns = await request(app).get('/api/connections').set('Cookie', bob.cookie);
        expect(bobConns.body.connections.length).toBe(1);
        expect(bobConns.body.connections[0]._id).toBe(alice.user._id);
    });
});

describe('Feed — removeConnection', () => {
    it('removes an accepted connection', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        await request(app).post(`/api/accept-request/${alice.user._id}`).set('Cookie', bob.cookie);

        const removeRes = await request(app)
            .post(`/api/remove-connection/${bob.user._id}`)
            .set('Cookie', alice.cookie);
        expect(removeRes.statusCode).toBe(200);

        const conn = await ConnectionRequest.findOne({
            $or: [
                { senderId: alice.user._id, receiverId: bob.user._id },
                { senderId: bob.user._id, receiverId: alice.user._id }
            ]
        });
        expect(conn).toBeNull();
    });
});

describe('Feed — fetchFeed', () => {
    it('returns only posts from accepted connections (not from strangers)', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);

        // Bob creates a post
        await request(app).post('/api/posts/post').set('Cookie', bob.cookie).send({ caption: "Bob's post" });

        // Alice's feed should be empty (not connected yet)
        const feedBefore = await request(app).get('/api/feed').set('Cookie', alice.cookie);
        expect(feedBefore.body.feed.length).toBe(0);

        // Connect Alice and Bob
        await request(app).post(`/api/send-request/${bob.user._id}`).set('Cookie', alice.cookie);
        await request(app).post(`/api/accept-request/${alice.user._id}`).set('Cookie', bob.cookie);

        // Now Alice's feed should show Bob's post
        const feedAfter = await request(app).get('/api/feed').set('Cookie', alice.cookie);
        expect(feedAfter.body.feed.length).toBe(1);
        expect(feedAfter.body.feed[0].caption).toBe("Bob's post");
    });
});
