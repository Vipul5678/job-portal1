 import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'

// Initialize
const app = express()

// Connect DB & Cloudinary
connectDB()
await connectCloudinary()

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://job-portal1-2zqr-client.vercel.app'
]

const configuredAllowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.ALLOWED_ORIGINS
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])

const isVercelPreviewOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin)
    return protocol === 'https:' && hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    const normalizedOrigin = origin.replace(/\/$/, '')

    if (allowedOrigins.has(normalizedOrigin) || isVercelPreviewOrigin(normalizedOrigin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}

// ===== CORS =====
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ===== BODY PARSER =====
app.use(express.json())

// ===== CLERK (safe use) =====
app.use(clerkMiddleware())

// ===== ROUTES =====
app.get('/', (req, res) => res.send("API Working"))

app.post('/webhooks', clerkWebhooks)

app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)

// ===== SENTRY =====
Sentry.setupExpressErrorHandler(app)

// ===== SERVER =====
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})