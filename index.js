'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const { connectDB } = require('./src/db/mongoose');
const authRoutes = require('./src/routes/auth');

// const createAdmin = require('./scripts/createAdmin');

const app = express();

/*
|--------------------------------------------------------------------------
| Trust Proxy
|--------------------------------------------------------------------------
*/

app.set(
  'trust proxy',
  process.env.NODE_ENV === 'production' ? 1 : false
);

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/*
|--------------------------------------------------------------------------
| Compression
|--------------------------------------------------------------------------
*/

app.use(compression());

/*
|--------------------------------------------------------------------------
| Request ID
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:8081',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`Origin not allowed by CORS: ${origin}`)
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));

/**
 * Express 5 compatible
 */
app.options(/.*/, cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many login attempts. Please try again later.',
  },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

/*
|--------------------------------------------------------------------------
| Webhook Route
|--------------------------------------------------------------------------
| Must come BEFORE express.json()
|--------------------------------------------------------------------------
*/

app.use(
  '/api/payments/webhook',
  express.raw({
    type: 'application/json',
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '25mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '25mb',
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});



// Routes
app.use(authRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/enrollments', enrollmentRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/notifications', notificationRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error('ERROR:', {
    message: err.message,
    stack:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : undefined,
    requestId: req.requestId,
  });

  res.status(err.status || 500).json({
    success: false,
    requestId: req.requestId,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
  });
});

/*
|--------------------------------------------------------------------------
| Database + Server Startup
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(
        `✅ Server running at http://localhost:${PORT}`
      );

      // createAdmin();
    });

    /*
    |--------------------------------------------------------------------------
    | Graceful Shutdown
    |--------------------------------------------------------------------------
    */

    const shutdown = (signal) => {
      console.log(`${signal} received`);

      server.close(() => {
        console.log('HTTP Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((error) => {
    console.error(
      '❌ Failed to connect to database:',
      error.message
    );

    process.exit(1);
  });

module.exports = app;