let WEB3 = require('web3')
let web3 = new WEB3(process.env.RPCURL)
let sdk  = require('@lighthouse-web3/sdk')
//let pub  = process.env.WALLET
//let key  = process.env.SECRET
let apk  = process.env.LIGHTHOUSE

async function upload(path){
  try {
    let res = await sdk.upload(path, apk)
    console.log('Uploaded', res)
    return res?.data?.Hash
  } catch(ex) {
    console.error(ex)
    return {error:ex.message}
  }
}

async function signMessage(pub, key){
  let res = await sdk.getAuthMessage(pub)
  let msg = res.data.message
  let sgn = await web3.eth.accounts.sign(msg, key)
  let hsh = sgn.signature
  console.log('msg', msg)
  console.log('hsh', hsh)
  return hsh
}

async function encrypt(pkey, skey, filePath){
  let sgn = await signMessage(pkey, skey)
  let inf = await sdk.uploadEncrypted(filePath, apk, pkey, sgn)
  console.log('inf', inf)
  let cid = inf.data.Hash
  console.log('cid', cid)
  return cid
}

async function decrypt(cid, filePath){
  if(!filePath){ filePath = cid }
  let sgn = await signMessage(pkey, key)
  let inf = await sdk.fetchEncryptionKey(cid, pub, sgn)
  //console.log('inf', inf)
  let fek = inf.data.key
  console.log('fek', fek)
  let buf = await sdk.decryptFile(cid, fek)
  //fs.createWriteStream(filePath).write(Buffer.from(buf))
  return buf
}

// adr must be an array of addresses requesting access
// users should go to the gateway link and sign with metamask
async function share(cid, adr){
  if(!adr){ adr = [pub] }
  let sgn = await signMessage(pub, key)
  let res = await sdk.shareFile(pub, adr, cid, sgn)
  console.log(res) // https://files.lighthouse.storage/viewFile/QmQphYtB71bJuwpX1aMWxyV6Qk1Gj8s5E3gfe3Fjqnpem8
  if(data.status=='Success'){
    return 'https://files.lighthouse.storage/viewFile/'+cid
  }
  return null
}

module.exports = {
  upload,
  encrypt,
  decrypt,
  share
}