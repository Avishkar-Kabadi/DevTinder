/**
 * Comment Controller Integration Tests
 * Tests: createComment, getComments, deleteComment (auth ownership)
 */
require('./setup');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const userModel = require('../models/userModel');
const commentRoutes = require('../routes/commentRoutes');
const postRoutes = require('../routes/postRoutes');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => { req.io = { to: () => ({ emit: () => {} }) }; next(); });
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const ALICE = { firstName:'Alice', lastName:'Dev', username:'alice_comment', email:'alice@comment.com', password:'Pass@1234' };
const BOB   = { firstName:'Bob',   lastName:'Dev', username:'bob_comment',   email:'bob@comment.com',  password:'Pass@1234' };

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
describe('Comments — createComment', () => {
    it('creates a comment on a post and returns populated user', async () => {
        const alice = await registerAndLogin(ALICE);
        const postRes = await request(app)
            .post('/api/posts/post').set('Cookie', alice.cookie).send({ caption: 'Commentable post' });
        const postId = postRes.body.post._id;

        const res = await request(app)
            .post('/api/comments/comment')
            .set('Cookie', alice.cookie)
            .send({ postId, text: 'Great post!' });
        expect(res.statusCode).toBe(201);
        expect(res.body.text).toBe('Great post!');
        expect(res.body.user.firstName).toBe('Alice');
    });

    it('returns 400 when text is empty', async () => {
        const alice = await registerAndLogin(ALICE);
        const postRes = await request(app)
            .post('/api/posts/post').set('Cookie', alice.cookie).send({ caption: 'Post' });
        const postId = postRes.body.post._id;

        const res = await request(app)
            .post('/api/comments/comment')
            .set('Cookie', alice.cookie)
            .send({ postId, text: '   ' });
        expect(res.statusCode).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
        const res = await request(app).post('/api/comments/comment').send({ postId: 'fake', text: 'hi' });
        expect(res.statusCode).toBe(401);
    });
});

describe('Comments — getComments', () => {
    it('returns comments for a post sorted oldest first', async () => {
        const alice = await registerAndLogin(ALICE);
        const postRes = await request(app)
            .post('/api/posts/post').set('Cookie', alice.cookie).send({ caption: 'Post' });
        const postId = postRes.body.post._id;

        await request(app).post('/api/comments/comment').set('Cookie', alice.cookie).send({ postId, text: 'First comment' });
        await request(app).post('/api/comments/comment').set('Cookie', alice.cookie).send({ postId, text: 'Second comment' });

        const res = await request(app)
            .get(`/api/comments/${postId}`)
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].text).toBe('First comment');
        expect(res.body[1].text).toBe('Second comment');
    });
});

describe('Comments — deleteComment', () => {
    it('allows the comment author to delete their comment', async () => {
        const alice = await registerAndLogin(ALICE);
        const postRes = await request(app)
            .post('/api/posts/post').set('Cookie', alice.cookie).send({ caption: 'Post' });
        const postId = postRes.body.post._id;

        const commentRes = await request(app)
            .post('/api/comments/comment').set('Cookie', alice.cookie).send({ postId, text: 'Delete me' });
        const commentId = commentRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/comments/comment/${commentId}`)
            .set('Cookie', alice.cookie);
        expect(deleteRes.statusCode).toBe(204);
    });

    it('returns 403 when non-author tries to delete', async () => {
        const alice = await registerAndLogin(ALICE);
        const bob   = await registerAndLogin(BOB);
        const postRes = await request(app)
            .post('/api/posts/post').set('Cookie', alice.cookie).send({ caption: 'Post' });
        const postId = postRes.body.post._id;

        const commentRes = await request(app)
            .post('/api/comments/comment').set('Cookie', alice.cookie).send({ postId, text: 'Alice comment' });
        const commentId = commentRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/comments/comment/${commentId}`)
            .set('Cookie', bob.cookie);
        expect(deleteRes.statusCode).toBe(403);
    });

    it('returns 404 when comment does not exist', async () => {
        const alice = await registerAndLogin(ALICE);
        const fakeId = new (require('mongoose').Types.ObjectId)();
        const res = await request(app)
            .delete(`/api/comments/comment/${fakeId}`)
            .set('Cookie', alice.cookie);
        expect(res.statusCode).toBe(404);
    });
});
