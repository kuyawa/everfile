const path       = require('path')
const ejs        = require('ejs')
const express    = require('express')
const uploader   = require('express-fileupload')
const bodyParser = require('body-parser')
const cookies    = require('cookie-parser')
const router     = require('./router.js') 

async function main(){
  console.warn(new Date(), 'App is running')
  let tmp = path.join(__dirname,'/public/uploads/tmp') // temp dir to upload files
  const app = express()
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(uploader({useTempFiles:true, tempFileDir:tmp}))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cookies())
  app.set('views', path.join(__dirname, 'public/views'))
  app.set('view engine', 'html')
  app.engine('html', ejs.renderFile)

  //-- ROUTER
  app.get('/',                    router.index)
  app.get('/login',               router.login)
  app.get('/setup',               router.setup)
  app.get('/drive',               router.drive)
  app.get('/drive/:id',           router.drive)
  app.get('/test',                router.test)
  app.get('/faq',                 router.faq)
  app.get('/terms',               router.terms)
  app.get('/privacy',             router.privacy)
  app.get('/support',             router.support)
  app.get('/api/test',            router.apiTest)
  app.get('/api/storage/:id',     router.apiStorage)      // creates a new storage contract for owner id
  app.post('/api/setup',          router.apiSetup)        // creates new drives for contract id
  app.post('/api/newfolder',      router.apiNewFolder)
  app.post('/api/newfile',        router.apiNewFile)
  app.get('/api/dir/:folder',     router.apiDir)
  app.get('/api/*',               router.apiCatchAll)
  app.get('/logs',                router.logsView)
  app.get('/logx',                router.logsClear)
  app.get('/notfound',            router.notFound)
  app.listen(5000)
}

main()

// END