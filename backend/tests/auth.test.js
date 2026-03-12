/**
 * Auth Controller Integration Tests
 * Tests: register → verifyOTP → login (verified/unverified) → logout → updateProfile → getUserProfile → searchUser
 */
require('./setup');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// We import the models and controller directly for unit-level assertions
const userModel = require('../models/userModel');
const blacklistModel = require('../models/blackListTokenModel');

// Build a minimal Express app for these tests (no Redis, no socket.io needed)
const authRoutes = require('../routes/authRoutes');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const VALID_USER = {
    firstName: 'Alice',
    lastName: 'Dev',
    username: 'alicedev',
    email: 'alice@example.com',
    password: 'Pass@1234',
};

/** Register then manually mark as verified so we can log in */
const registerAndVerify = async () => {
    // 1. Register (sends OTP)
    await request(app).post('/auth/register').send(VALID_USER);
    // 2. Grab the OTP from the DB
    const u = await userModel.findOne({ email: VALID_USER.email });
    // 3. Verify OTP
    await request(app).post('/auth/verify-otp').send({ email: VALID_USER.email, otp: u.otp });
    return userModel.findOne({ email: VALID_USER.email });
};

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('Auth — registerUser', () => {
    it('returns 200 and sends OTP on valid registration', async () => {
        const res = await request(app).post('/auth/register').send(VALID_USER);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/OTP sent/i);

        const dbUser = await userModel.findOne({ email: VALID_USER.email });
        expect(dbUser).not.toBeNull();
        expect(dbUser.isVerified).toBe(false);
        expect(dbUser.otp).toBeTruthy();
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app).post('/auth/register').send({ email: 'a@b.com' });
        expect(res.statusCode).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
        await request(app).post('/auth/register').send(VALID_USER);
        const res = await request(app).post('/auth/register').send(VALID_USER);
        expect(res.statusCode).toBe(409);
    });
});

describe('Auth — verifyOTP', () => {
    it('marks user as verified and sets a cookie on correct OTP', async () => {
        await request(app).post('/auth/register').send(VALID_USER);
        const u = await userModel.findOne({ email: VALID_USER.email });
        const res = await request(app).post('/auth/verify-otp').send({ email: VALID_USER.email, otp: u.otp });
        expect(res.statusCode).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();

        const updated = await userModel.findOne({ email: VALID_USER.email });
        expect(updated.isVerified).toBe(true);
        expect(updated.otp).toBeNull();
    });

    it('returns 400 on wrong OTP', async () => {
        await request(app).post('/auth/register').send(VALID_USER);
        const res = await request(app).post('/auth/verify-otp').send({ email: VALID_USER.email, otp: '000000' });
        expect(res.statusCode).toBe(400);
    });
});

describe('Auth — loginUser', () => {
    it('returns 403 when user is not verified', async () => {
        // Register but DON'T verify
        await request(app).post('/auth/register').send(VALID_USER);
        const res = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: VALID_USER.password,
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/not verified/i);
    });

    it('returns 200 and sets cookie for verified user', async () => {
        await registerAndVerify();
        const res = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: VALID_USER.password,
        });
        expect(res.statusCode).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.body.user).not.toHaveProperty('password');
    });

    it('allows login by username as well', async () => {
        await registerAndVerify();
        const res = await request(app).post('/auth/login').send({
            identifier: VALID_USER.username,
            password: VALID_USER.password,
        });
        expect(res.statusCode).toBe(200);
    });

    it('returns 401 on wrong password', async () => {
        await registerAndVerify();
        const res = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: 'wrongpassword',
        });
        expect(res.statusCode).toBe(401);
    });

    it('returns 401 on unknown user', async () => {
        const res = await request(app).post('/auth/login').send({
            identifier: 'ghost@example.com',
            password: 'whatever',
        });
        expect(res.statusCode).toBe(401);
    });
});

describe('Auth — logoutUser', () => {
    it('blacklists the token and clears the cookie', async () => {
        await registerAndVerify();
        const loginRes = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: VALID_USER.password,
        });
        const cookie = loginRes.headers['set-cookie'];

        const logoutRes = await request(app)
            .post('/auth/logout')
            .set('Cookie', cookie);
        expect(logoutRes.statusCode).toBe(200);

        // Token should now be in the blacklist
        const blacklisted = await blacklistModel.findOne({});
        expect(blacklisted).not.toBeNull();
    });
});

describe('Auth — searchUser', () => {
    it('returns empty array when no query provided', async () => {
        await registerAndVerify();
        const loginRes = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: VALID_USER.password,
        });
        const cookie = loginRes.headers['set-cookie'];

        const res = await request(app)
            .get('/auth/search')
            .set('Cookie', cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.users).toEqual([]);
    });

    it('finds users by firstName', async () => {
        await registerAndVerify();
        const loginRes = await request(app).post('/auth/login').send({
            identifier: VALID_USER.email,
            password: VALID_USER.password,
        });
        const cookie = loginRes.headers['set-cookie'];

        const res = await request(app)
            .get('/auth/search?query=Alice')
            .set('Cookie', cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.users.length).toBeGreaterThan(0);
        expect(res.body.users[0].firstName).toBe('Alice');
    });
});
