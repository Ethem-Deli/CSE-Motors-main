
// routes/misc.js
const express = require('express');
const router = express.Router();

router.get('/error/trigger', (req, res, next) => {
  // intentionally create a server error to test the 500 middleware
  const err = new Error('Intentional test 500 error');
  err.status = 500;
  // either throw or pass to next
  next(err);
});

module.exports = router;
