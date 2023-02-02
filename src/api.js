let db    = require('./database.js')
let utils = require('./utils.js')
let WEB3  = require('web3')
let web3  = new WEB3(process.env.RPCURL)
let abi   = require('./contracts/drive-abi.json')
let bin   = require('./contracts/drive-bin.json')

let config = {
  wallet: process.env.WALLET,
  prvkey: process.env.SECRET
}

async function newUser(account){
  let rec = {account}
  console.log('New user', rec)
  res = await db.newUser(rec)
}

async function deploy(arg=[]){
  try {
    let byt = '0x'+bin.object
    let ctr = new web3.eth.Contract(abi)
    ctr.defaultAccount = config.wallet
    let ctd = ctr.deploy({ arguments: arg, data: byt })
    //let gax = await ctd.estimateGas()
    //console.log('GAX', gax)
    let gap = '0x'+(5000000000).toString(16)
    let gal = '0x'+(60000000).toString(16)
    let gam = '0x'+(60000000).toString(16)
    //let dat = { from: config.wallet, data: ctd.encodeABI(), gasPrice: gap, gasLimit: gal, value: '0x0', nonce: '0x1' }
    let dat = { from: config.wallet, data: ctd.encodeABI(), gasLimit: gal, maxPriorityFeePerGas: gam }
    let sgn = await web3.eth.accounts.signTransaction(dat, config.prvkey)
    //console.log('SGN', sgn)
    let txi = sgn.transactionHash
    console.log('TX', txi)
    let rec = web3.eth.sendSignedTransaction(sgn.rawTransaction) // NOWAIT
    return txi
  } catch(ex){
    console.error(ex)
    return {error:ex.message}
  }
}

async function sendMethod(adr, met, arg=[]){
  try {
    let ctr = new web3.eth.Contract(abi, adr)
    ctr.defaultAccount = config.wallet
    let gas = { gasPrice: 4000000000, gasLimit: 21000000, maxFee: 21000000 }
    //let gax = await ctr.methods[met](...arg).estimateGas()
    //console.log('GAX', gax)
    let dat = await ctr.methods[met](...arg).encodeABI()
    console.log('DAT', dat)
    let txn = { from: config.wallet, to: adr, data: dat, gas: gas.gasLimit, maxPriorityFeePerGas: gas.maxFee }
    console.log('TXN', txn)
    let sgn = await web3.eth.accounts.signTransaction(txn, config.prvkey);
    console.log('SGN', sgn)
    let txi = sgn?.transactionHash
    console.log('TXI', txi)
    let res = web3.eth.sendSignedTransaction(sgn.rawTransaction); // NOWAIT
    return txi;
  } catch(ex){
    console.error(ex)
    return {error:ex.message}
  }
}

async function callMethod(adr, met, arg=[]){
  try {
    let ctr = new web3.eth.Contract(abi, adr)
    ctr.defaultAccount = config.wallet
    let gas = { gasPrice: 4000000000, gasLimit: 10000000 }
    //let gax = await ctr.methods[met](...arg).estimateGas()
    //console.log('GAX', gax)
    let res = await ctr.methods[met](...arg).call()
    console.log('RES', res)
    return res;
  } catch(ex){
    console.error(ex)
    return {error:ex.message}
  }
}


//deploy(['0xC8cC6148A40A09e70DEc5B8B03976Bd577f90675'])
//callMethod(adr, 'getDir',['0xe473144d6e7235e2148b9155Dd48235865eAd620'])
//sendMethod(adr, 'newFile', ['0x1888d5af952a210cb4b1e4b475c71465ca083eda', '0xe473144d6e7235e2148b9155Dd48235865eAd620', 'test,jpg', 'Q1234567890', '123456'])

async function newContract(owner){
  let res = await deploy([owner])
  return res
}

async function setupDrives(adr){
  let res = await sendMethod(adr, 'setup')
  return res
}

async function newDrive(adr, driveid, name, encrypt){
  let res = await sendMethod(adr, 'newDrive', [driveid, name, encrypt])
  return res
}

async function newFolder(adr, driveid, folderid, parentid, name){
  let res = await sendMethod(adr, 'newFolder', [driveid, folderid, parentid, name])
  return res
}

async function newFile(adr, fileid, folderid, name, cid, mime, size){
  let res = await sendMethod(adr, 'newFile', [fileid, folderid, name, cid, mime, size])
  return res
}

async function getDrives(adr){
  let res = await callMethod(adr, 'getDrives')
  return res
}

async function getFolders(adr, folderid){
  let res = await callMethod(adr, 'getFolders', [folderid])
  return res
}

async function getFiles(adr, folderid){
  let res = await callMethod(adr, 'getFiles', [folderid])
  return res
}

async function getDir(adr, folderid){
  let res = await callMethod(adr, 'getDir', [folderid])
  return res
}


module.exports = {
  newUser,
  newContract,
  setupDrives,
  newDrive,
  newFolder,
  newFile,
  getDrives,
  getFolders,
  getFiles,
  getDir
}

// END