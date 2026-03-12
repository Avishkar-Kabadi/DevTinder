/**
 * Post Controller Integration Tests
 * Tests: createPost, fetchPosts (own), getPosts (all), like/dislike, editPost, deletePost
 * Covers: ownership enforcement, optional image, correct param names
 */
require('./setup');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const postRoutes = require('../routes/postRoutes');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
// Attach a mock io so notification emits don't throw
app.use((req, res, next) => { req.io = { to: () => ({ emit: () => {} }) }; next(); });
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const ALICE = { firstName:'Alice', lastName:'Dev', username:'alicetest', email:'alice@post.com', password:'Pass@1234' };
const BOB   = { firstName:'Bob',   lastName:'Dev', username:'bobtest',   email:'bob@post.com',  password:'Pass@1234' };

const registerAndLogin = async (userData) => {
    await request(app).post('/auth/register').send(userData);
    const u = await userModel.findOne({ email: userData.email });
    await request(app).post('/auth/verify-otp').send({ email: userData.email, otp: u.otp });
    const res = await request(app).post('/auth/login').send({ identifier: userData.email, password: userData.password });
    return res.headers['set-cookie'];
};

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('Posts — createPost', () => {
    it('creates a text-only post (no image) successfully', async () => {
        const cookie = await registerAndLogin(ALICE);
        const res = await request(app)
            .post('/api/posts/post')
            .set('Cookie', cookie)
            .send({ caption: 'Hello world!' });
        expect(res.statusCode).toBe(200);
        expect(res.body.post.caption).toBe('Hello world!');
        expect(res.body.post.image).toBeUndefined();
    });

    it('rejects post creation when not authenticated', async () => {
        const res = await request(app).post('/api/posts/post').send({ caption: 'test' });
        expect(res.statusCode).toBe(401);
    });
});

describe('Posts — getPosts (all posts feed)', () => {
    it('returns all posts sorted newest first', async () => {
        const cookie = await registerAndLogin(ALICE);
        await request(app).post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Post 1' });
        await request(app).post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Post 2' });

        const res = await request(app).get('/api/posts').set('Cookie', cookie);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        // newest first
        expect(res.body[0].caption).toBe('Post 2');
    });
});

describe('Posts — fetchPosts (my-posts)', () => {
    it('returns only the logged-in user\'s posts', async () => {
        const aliceCookie = await registerAndLogin(ALICE);
        const bobCookie   = await registerAndLogin(BOB);
        await request(app).post('/api/posts/post').set('Cookie', aliceCookie).send({ caption: 'Alice post' });
        await request(app).post('/api/posts/post').set('Cookie', bobCookie).send({ caption: 'Bob post' });

        const res = await request(app).get('/api/posts/my-posts').set('Cookie', aliceCookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBe(1);
        expect(res.body.posts[0].caption).toBe('Alice post');
    });
});

describe('Posts — like_Dislike_Post', () => {
    it('adds a like and increments likesCount', async () => {
        const cookie = await registerAndLogin(ALICE);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Likeable post' });
        const postId = createRes.body.post._id;

        const likeRes = await request(app)
            .put(`/api/posts/like-dislike/${postId}`)
            .set('Cookie', cookie);
        expect(likeRes.statusCode).toBe(200);
        expect(likeRes.body.likesCount).toBe(1);
    });

    it('removes the like on second toggle (unlike)', async () => {
        const cookie = await registerAndLogin(ALICE);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Toggle post' });
        const postId = createRes.body.post._id;

        // Like
        await request(app).put(`/api/posts/like-dislike/${postId}`).set('Cookie', cookie);
        // Unlike
        const unlikeRes = await request(app).put(`/api/posts/like-dislike/${postId}`).set('Cookie', cookie);
        expect(unlikeRes.statusCode).toBe(200);
        expect(unlikeRes.body.likesCount).toBe(0);
        expect(unlikeRes.body.likes).toHaveLength(0);
    });
});

describe('Posts — editPost', () => {
    it('allows owner to edit caption', async () => {
        const cookie = await registerAndLogin(ALICE);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Original caption' });
        const postId = createRes.body.post._id;

        const editRes = await request(app)
            .put(`/api/posts/post/${postId}`)
            .set('Cookie', cookie)
            .send({ caption: 'Updated caption' });
        expect(editRes.statusCode).toBe(200);
        expect(editRes.body.post.caption).toBe('Updated caption');
    });

    it('returns 403 when non-owner tries to edit', async () => {
        const aliceCookie = await registerAndLogin(ALICE);
        const bobCookie   = await registerAndLogin(BOB);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', aliceCookie).send({ caption: 'Alice caption' });
        const postId = createRes.body.post._id;

        const res = await request(app)
            .put(`/api/posts/post/${postId}`)
            .set('Cookie', bobCookie)
            .send({ caption: 'Bob tries to edit' });
        expect(res.statusCode).toBe(403);
    });
});

describe('Posts — deletePost', () => {
    it('allows owner to delete their post', async () => {
        const cookie = await registerAndLogin(ALICE);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', cookie).send({ caption: 'Delete me' });
        const postId = createRes.body.post._id;

        const deleteRes = await request(app)
            .delete(`/api/posts/post/${postId}`)
            .set('Cookie', cookie);
        expect(deleteRes.statusCode).toBe(200);
        expect(await postModel.findById(postId)).toBeNull();
    });

    it('returns 403 when non-owner tries to delete', async () => {
        const aliceCookie = await registerAndLogin(ALICE);
        const bobCookie   = await registerAndLogin(BOB);
        const createRes = await request(app)
            .post('/api/posts/post').set('Cookie', aliceCookie).send({ caption: 'Alice post' });
        const postId = createRes.body.post._id;

        const res = await request(app)
            .delete(`/api/posts/post/${postId}`)
            .set('Cookie', bobCookie);
        expect(res.statusCode).toBe(403);
        // Post should still exist
        expect(await postModel.findById(postId)).not.toBeNull();
    });

    it('returns 404 when post does not exist', async () => {
        const cookie = await registerAndLogin(ALICE);
        const fakeId = new (require('mongoose').Types.ObjectId)();
        const res = await request(app)
            .delete(`/api/posts/post/${fakeId}`)
            .set('Cookie', cookie);
        expect(res.statusCode).toBe(404);
    });
});
