let crypto = require('crypto')

function fileSize(size) {
  if(size>1000000){
    return (size/1000000).toFixed(2) + ' Mb'
  } else if(size>1000) {
    return (size/1000).toFixed(2) + ' Kb'
  }
  return size + ' b'
}

function fileDate(date) {
  return new Date(date).toJSON().replace('T', ' ').substr(0,19)
}

function getSession(req) {
  let session = {
    apikey:    process.env.LIGHTHOUSE,
    explorer:  process.env.EXPLORER,
    network:   process.env.NETWORK,
    rpcurl:    process.env.RPCURL,
    theme:     req.cookies.theme || 'dark',
    account:   req.cookies.account,
    storage:   req.cookies.storage,
    driveid:   req.cookies.driveid,
    drive:     req.cookies.drive
  }
  return session
}

function title(text) {
  return text[0].toUpperCase()+text.substr(1)
}

async function randomAddress() {
  let buf = await crypto.randomBytes(20)
  let adr = '0x'+buf.toString('hex')
  return adr
}

module.exports = {
  fileSize,
  fileDate,
  getSession,
  randomAddress,
  title
}

// END