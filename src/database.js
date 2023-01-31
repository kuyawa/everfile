let DataServer = require('./dataserver.js')
let DS = new DataServer()

//---- STORAGE

async function getUserByAccount(account) {
  let sql = 'select * from users where account=$1'
  let par = [account]
  let dat = await DS.queryObject(sql, par)
  return dat
}

async function getStorage(account) {
  let sql = 'select contract as value from users where account=$1'
  let par = [account]
  let dat = await DS.queryValue(sql, par)
  return dat
}

async function getDriveId(contract, name) {
  let sql = 'select driveid as value from drives where contract=$1 and name=$2'
  let par = [contract, name]
  let dat = await DS.queryValue(sql, par)
  return dat
}

async function getDrives(contract) {
  let sql = 'select * from drives where contract=$1'
  let par = [contract]
  let dat = await DS.query(sql, par)
  return dat
}

async function getDir(folderid) {
  let folders = await getFolders(folderid)
  let files   = await getFiles(folderid)
  return {folders, files}
}

async function getFolder(folderid) {
  let sql = 'select * from folders where folderid=$1'
  let par = [folderid]
  let dat = await DS.queryObject(sql, par)
  return dat
}

async function getFolders(parentid) {
  let sql = 'select * from folders where parentid=$1'
  let par = [parentid]
  let dat = await DS.query(sql, par)
  return dat
}

async function getFiles(folderid) {
  let sql = 'select *, created as date from files where folderid=$1'
  let par = [folderid]
  let dat = await DS.query(sql, par)
  return dat
}

async function newDrive(rec) {
  let sql = 'insert into drives(owner, contract, driveid, name, encrypt) values($1, $2, $3, $4, $5) returning recid'
  let par = [rec.owner, rec.contract, rec.driveid, rec.name, rec.encrypt]
  let dat = await DS.insert(sql, par, 'recid')
  return dat
}

async function newFolder(rec) {
  let sql = 'insert into folders(contract, owner, driveid, folderid, parentid, name) values($1, $2, $3, $4, $5, $6) returning recid'
  let par = [rec.contract, rec.owner, rec.driveid, rec.folderid, rec.parentid, rec.name]
  let dat = await DS.insert(sql, par, 'recid')
  return dat
}

async function newFile(rec) {
  let sql = 'insert into files(owner, contract, driveid, folderid, fileid, cid, name, size, mime) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning recid'
  let par = [rec.owner, rec.contract, rec.driveid, rec.folderid, rec.fileid, rec.cid, rec.name, rec.size, rec.mime]
  let dat = await DS.insert(sql, par, 'recid')
  return dat
}

async function newUser(rec) {
  let sql = 'insert into users(account) values($1) returning recid'
  let par = [rec.account]
  let dat = await DS.insert(sql, par, 'recid')
  return dat
}

async function setStorage(rec) {
  let sql = 'update users set contract=$1 where account=$2'
  let par = [rec.address, rec.account]
  let dat = await DS.update(sql, par)
  return dat
}

module.exports = {
  getUserByAccount,
  getStorage,
  getDriveId,
  getDrives,
  getFolders,
  getFolder,
  getFiles,
  getDir,
  newDrive,
  newFolder,
  newFile,
  newUser,
  setStorage
}

// END