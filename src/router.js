const fetch    = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs       = require('fs')
const path     = require('path')
const crypto   = require('crypto');
const api      = require('./api.js');
const db       = require('./database.js'); 
const uploader = require('./uploader.js'); 
const utils    = require('./utils.js'); 


function hit(req, ...args){ 
  console.warn(new Date().toJSON().substr(5,14).replace('T',' '), req.path, ...args) 
  //console.warn('MEM', process.memoryUsage())
}

async function index(req, res){ 
  hit(req)
  try {
    let session = utils.getSession(req)
    res.render('index', {session})
  } catch(ex) {
    console.error(new Date(), 'Server error', ex.message)
    return res.status(500).render('servererror', {session})
  }
}

async function login(req, res){
  hit(req)
  let session = utils.getSession(req)
  res.render('login', {session})
}

async function setup(req, res){
  hit(req)
  let session = utils.getSession(req)
  res.render('setup', {session})
}

async function drive(req, res){
  //hit(req)
  let session = utils.getSession(req)
  if(!session.account){ return res.redirect('/login') }
  let user = await db.getUserByAccount(session.account)
  if(!user){
    let recid = await api.newUser(session.account)
    if(!recid || recid.error){ return res.redirect('/login') }
    user = {account:session.account}
  }
  let drive   = req.params.id || 'personal'
  let storage = await db.getStorage(user.account)
  if(!storage || storage.error){
    return res.redirect('/setup')
  }
  let drives  = await db.getDrives(storage)
  let driveid = await db.getDriveId(storage, drive)
  let folders = await db.getFolders(driveid)
  let files   = await db.getFiles(driveid)
  session.storage = storage
  session.driveid = driveid
  hit(req, storage, driveid)
  let mapDrives  = {}
  for (var i = 0; i < drives.length; i++) {
    mapDrives[drives[i].driveid] = drives[i]
  }
  let mapFolders  = {}
  for (var i = 0; i < folders.length; i++) {
    mapFolders[folders[i].folderid] = folders[i]
  }
  let mapFiles = {}
  for (var i = 0; i < files.length; i++) {
    mapFiles[files[i].fileid] = files[i]
  }
  //console.log({mapFolders})
  //console.log({mapFiles})
  let folder  = {name:'root', folderid:driveid, parentid:null}
  session.driveName = drive
  session.drives = mapDrives
  session.drive  = mapDrives[driveid]
  session.dir = {folder, folders:mapFolders, files:mapFiles}
  let data = {session, user, drive, utils}
  res.render('drive', data)
}

async function test(req, res){
  hit(req)
  let session = utils.getSession(req)
  session.account = '0xc8cc6148a40a09e70dec5b8b03976bd577f90675'
  let user = await db.getUserByAccount(session.account)
  let drive   = req.params.id || 'personal'
  let storage = await db.getStorage(user.account)
  let drives  = await db.getDrives(storage)
  let driveid = await db.getDriveId(storage, drive)
  let folders = await db.getFolders(driveid)
  let files   = await db.getFiles(driveid)
  session.storage = storage
  session.driveid = driveid
  let mapDrives  = {}
  for (var i = 0; i < drives.length; i++) {
    mapDrives[drives[i].driveid] = drives[i]
  }
  let mapFolders  = {}
  for (var i = 0; i < folders.length; i++) {
    mapFolders[folders[i].folderid] = folders[i]
  }
  let mapFiles = {}
  for (var i = 0; i < files.length; i++) {
    mapFiles[files[i].fileid] = files[i]
  }
  let folder  = {name:'root', folderid:driveid, parentid:null}
  session.test = true
  session.driveName = drive
  session.drives = mapDrives
  session.drive  = mapDrives[driveid]
  session.dir = {folder, folders:mapFolders, files:mapFiles}
  let data = {session, user, drive, utils}
  res.render('drive', data)
}

async function faq(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  res.render('notready', {session})
}

async function terms(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  res.render('notready', {session})
}

async function privacy(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  res.render('notready', {session})
}

async function support(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  res.render('notready', {session})
}


//---- API

async function apiTest(req, res){ 
  hit(req)
  res.end('{"success":true}')
}

async function apiStorage(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  if(!session.account){
    return res.end(JSON.stringify({success:false, error:'User account not found'}))
  }
  let uid = session.account
  let adr = req.params.id
  let inf = await db.setStorage({address:adr, account:uid})
  console.warn('Storage', adr, 'for user', uid, inf)
  res.end(JSON.stringify({success:true}))
}

async function apiSetup(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  if(!session.account){
    return res.end(JSON.stringify({success:false, error:'User account not found'}))
  }
  let uid = session.account
  let dat = req.body
  let rx1 = await db.newDrive({owner:uid, contract:dat.contract, driveid:dat.drive1, name:'personal' , encrypt:false})
  let rx2 = await db.newDrive({owner:uid, contract:dat.contract, driveid:dat.drive2, name:'encrypted', encrypt:true })
  console.warn('Setup', dat, rx1, rx2)
  res.end(JSON.stringify({success:true}))
}

async function apiNewFolder(req, res){ 
  hit(req)
  let session = utils.getSession(req)
  if(!session.account){
    return res.end(JSON.stringify({success:false, error:'User account not found'}))
  }
  let dat = req.body
  dat.owner = session.account
  console.warn('New Folder', dat)
  let rx1 = await db.newFolder(dat)
  let rx2 = await api.newFolder(dat.contract, dat.driveid, dat.folderid, dat.parentid, dat.name)
  console.warn('RES', rx1)
  res.end(JSON.stringify({success:true, data:rx1, txid:rx2}))
}

async function apiNewFile(req, res){ 
  hit(req)
  let files    = req.files
  let owner    = req.body.owner
  let contract = req.body.contract
  let driveid  = req.body.driveid
  let folderid = req.body.folderid
  let fileid   = req.body.fileid
  let encrypt  = req.body.encrypt || false

  if(!files){
    console.error('No files uploaded')
    res.send(JSON.stringify({error:'No files uploaded'}))
    return
  }
  if(!files.file){
    console.error('No file uploaded')
    res.send(JSON.stringify({error:'No file uploaded'}))
    return
  }
  if(!files.file.name){
    console.error('File name not found')
    res.send(JSON.stringify({error:'File name not found'}))
    return
  }

  //let data = files.file.data
  let date = new Date()
  let name = files.file.name
  let size = files.file.size
  let mime = files.file.mimetype
  let temp = files.file.tempFilePath

  try {
    // upload to lighthouse
    let cid = await uploader.upload(temp)
    if(!cid || cid.error){
      return res.send(JSON.stringify({error:'Error uploading: '+(cid?.error||'Unknown')}))
    }
    let rec = {owner, contract, driveid, folderid, fileid, name, cid, mime, size}
    //console.log(rec)
    // move to /public/uploads
    let dst = path.join(__dirname,'/public/uploads/'+fileid)
    // preview mime types
    if     (mime=='image/jpeg'){ dst+='.jpg' }
    else if(mime=='image/png' ){ dst+='.png' }
    else if(mime=='image/gif' ){ dst+='.gif' }
    else if(mime=='image/webp'){ dst+='.webp' }
    else if(mime=='image/svg+xml'){ dst+='.svg' }
    if(encrypt){
      fs.unlink(temp)
    } else {
      let ok1 = await req.files.file.mv(dst)
    }
    // save fileId and cid to db in contract/drive/parent folder
    let ok2 = await db.newFile(rec)
    console.log('OK2',ok2)
    let recid = ok2?.id || 0
    // upload to contract, no wait
    let txid = await api.newFile(contract, fileid, folderid, name, cid, mime, size)
    console.log('OK3',txid)
    // done
    res.end(JSON.stringify({success:true, recid, owner, contract, driveid, folderid, fileid, name, cid, mime, size, date, txid}))
  } catch(ex) {
    console.error(ex)
    return res.send(JSON.stringify({error:'Error uploading: '+ex.message}))
  }
}

async function apiEncrypt(req, res){ 
  hit(req)
  let owner    = req.body.owner
  let contract = req.body.contract
  let driveid  = req.body.driveid
  let folderid = req.body.folderid
  let fileid   = req.body.fileid
  let name     = req.body.filename
  let size     = req.body.filesize
  let mime     = req.body.filemime
  let cid      = req.body.filecid
  let date     = new Date()

  try {
    let rec = {owner, contract, driveid, folderid, fileid, name, cid, mime, size}
    console.log(rec)
    // save fileId and cid to db in contract/drive/parent folder
    let ok2 = await db.newFile(rec)
    console.log('OK2',ok2)
    let recid = ok2?.id || 0
    // upload to contract, no wait
    let txid = await api.newFile(contract, fileid, folderid, name, cid, mime, size)
    console.log('OK3',txid)
    // done
    res.end(JSON.stringify({success:true, recid, owner, contract, driveid, folderid, fileid, name, cid, mime, size, date, txid}))
  } catch(ex) {
    console.error(ex)
    return res.send(JSON.stringify({error:'Error encrypting: '+ex.message}))
  }}

async function apiDir(req, res){
  hit(req)
  let folderid = req.params.folder
  let folder = await db.getFolder(folderid)
  //console.warn('Folder', folder)
  if(folder?.error){
    return res.end(JSON.stringify({success:false, error:folder.error}))
  }
  if(!folder){
    folder = {name:'root', folderid}
  }
  let dir = await db.getDir(folderid)
  //console.warn('Dir', dir)
  if(dir?.error){
    return res.end(JSON.stringify({success:false, error:dir.error}))
  }
  let mapFolders  = {}
  for (var i = 0; i < dir.folders.length; i++) {
    mapFolders[dir.folders[i].folderid] = dir.folders[i]
  }
  let mapFiles = {}
  for (var i = 0; i < dir.files.length; i++) {
    mapFiles[dir.files[i].fileid] = dir.files[i]
  }
  res.end(JSON.stringify({success:true, folder, folders:mapFolders, files:mapFiles}))
}


//---- UTILS

async function apiCatchAll(req, res){ 
  hit(req, 'not found')
  res.status(404).end('{"error":"Resource not found"}')
}

async function logsView(req, res){ 
  let fhn = path.join(__dirname, 'stderr.log')
  let txt = fs.readFileSync(fhn, {encoding: 'utf8'})
  res.end('<body style="padding:20px;color:#AFA;background-color:#111;font-size:130%;"><pre>'+txt+'</pre></body>')
}

async function logsClear(req, res){ 
  let fn = path.join(__dirname, 'stderr.log')
  let ok = fs.writeFileSync(fn, '----\n')
  res.end('<body style="padding:20px;color:#AFA;background-color:#111;font-size:130%;"><pre>Logs cleared</pre></body>')
}

async function notFound(req, res){ 
  hit(req, 'not found')
  let session = utils.getSession(req)
  res.status(404).render('notfound', {session})
}

module.exports = {
  index,
  login,
  setup,
  drive,
  test,
  faq,
  terms,
  privacy,
  support,
  apiTest,
  apiStorage,
  apiSetup,
  apiNewFolder,
  apiNewFile,
  apiEncrypt,
  apiDir,
  apiCatchAll,
  logsView,
  logsClear,
  notFound
}

// END