import express from 'express'
import cors from 'cors'
import routes from './routes/index'
import { errorHandler } from './middleware/error.middleware'

export function createApp() 
{
  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())
  app.use('/api', routes)
  app.use(errorHandler)
  return app
}
