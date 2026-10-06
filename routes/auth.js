const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/try');
  res.render('login', { error: null, title: 'Login – Structura AI' });
});

router.post('/login', async (req, res) => {
  if (req.session.userId) return res.redirect('/try');

  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  let error = null;

  try {
    const user = await User.findOne({ username });
    const valid = user ? await user.verifyPassword(password) : false;

    if (user && valid) {
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.email = user.email;
      console.log(`[auth] Login: ${username}`);
      return req.session.save((err) => {
        if (err) {
          console.error('[auth] session save error', err);
          return res.render('login', {
            error: 'Could not start your session. Please try again.',
            title: 'Login – Structura AI',
          });
        }
        res.redirect('/try');
      });
    }
    error = 'Invalid username or password.';
  } catch (err) {
    console.error('[auth] login error', err);
    error = 'Something went wrong. Please try again.';
  }

  res.render('login', { error, title: 'Login – Structura AI' });
});

router.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/try');
  res.render('signup', { error: null, title: 'Sign Up – Structura AI' });
});

router.post('/signup', async (req, res) => {
  if (req.session.userId) return res.redirect('/try');

  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const confirm = req.body.confirm_password || '';
  let error = null;

  try {
    if (!username || !email || !password) {
      error = 'All fields are required.';
    } else if (password !== confirm) {
      error = 'Passwords do not match.';
    } else if (password.length < 6) {
      error = 'Password must be at least 6 characters.';
    } else if (await User.findOne({ username })) {
      error = 'Username already taken.';
    } else if (await User.findOne({ email })) {
      error = 'Email already registered.';
    } else {
      // Password hashing happens automatically in the User pre('save') hook.
      const user = await User.create({ username, email, password });
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.email = user.email;
      console.log(`[auth] Signup: ${username}`);
      return req.session.save((err) => {
        if (err) {
          console.error('[auth] session save error', err);
          return res.render('signup', {
            error: 'Could not start your session. Please try again.',
            title: 'Sign Up – Structura AI',
          });
        }
        res.redirect('/try');
      });
    }
  } catch (err) {
    console.error('[auth] signup error', err);
    if (err.code === 11000) {
      error = 'Username or email already registered.';
    } else {
      error = 'Something went wrong. Please try again.';
    }
  }

  res.render('signup', { error, title: 'Sign Up – Structura AI' });
});

router.get('/logout', (req, res) => {
  const username = req.session.username || 'unknown';
  req.session.destroy((err) => {
    if (err) console.error('[auth] logout error', err);
    console.log(`[auth] Logout: ${username}`);
    res.redirect('/');
  });
});

module.exports = router;
