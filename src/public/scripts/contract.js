// Contract methods

async function deploy(arg=[]){
  try {
    let byt = '0x'+bin.object
    let ctr = new web3.eth.Contract(abi)
    ctr.defaultAccount = Metamask.myaccount
    let ctd = ctr.deploy({ arguments: arg, data: byt })
    //let gax = await ctd.estimateGas()
    let gap = '0x'+(5000000000).toString(16)
    let gal = '0x'+(60000000).toString(16)
    let gam = '0x'+(60000000).toString(16)
    let dat = { from: Metamask.myaccount, data: ctd.encodeABI(), gasLimit: gal, maxPriorityFeePerGas: gam }
    let res = await ctd.send(dat)
    if(res._address){
      console.log('Deployed at', res._address)
      return {success:true, address:res._address}
    } else {
      return {success:false, error:'Contract not deployed'}
    }
  } catch(ex){
    console.error(ex)
    return {success:false, error:ex.message}
  }
}

async function sendMethod(adr, met, arg=[]){
  try {
    let ctr = new web3.eth.Contract(abi, adr)
    ctr.defaultAccount = Metamask.myaccount
    let gas = { gasPrice: 4000000000, gasLimit: 15000000, maxFee: 15000000 }
    //let gax = await ctr.methods[met](...arg).estimateGas()
    let inf = { from: Metamask.myaccount, gas: gas.gasLimit, maxPriorityFeePerGas: gas.maxFee }
    let res = await ctr.methods[met](...arg).send(inf)
    if(res.status==true){
      return {success:true}
    } else {
      return {success:false, error:'Contract call not executed'}
    }
  } catch(ex){
    console.error(ex)
    return {success:false, error: ex.message}
  }
}

async function callMethod(adr, met, arg=[]){
  try {
    let ctr = new web3.eth.Contract(abi, adr)
    ctr.defaultAccount = Metamask.myaccount
    let gas = { gasPrice: 4000000000, gasLimit: 10000000 }
    let res = await ctr.methods[met](...arg).call()
    return res;
  } catch(ex){
    console.error(ex)
    return {success:false, error: ex.message}
  }
}


async function newContract(){
  let own = Metamask.myaccount
  let res = await deploy([own])
  console.log('DEPLOYED', res)
  return res
}

async function setupDrives(adr, drive1, drive2){
  let res = await sendMethod(adr, 'setup', [drive1, drive2])
  console.log('SETUP', res)
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

async function newFile(adr, fileid, folderid, name, cid, size){
  let res = await sendMethod(adr, 'newFile', [fileid, folderid, name, cid, size])
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

// END