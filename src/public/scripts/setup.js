// SETUP

async function onDeploy() {
  console.log('Deploying contract...')
  $('buttonDeploy').classList.add('disabled')
  $('msgDeploy').innerHTML = 'Wait, deploying contract. It may take a minute...'
  let res = await newContract()
  if(res.success){
    session.storage = res.address.toLowerCase()
    setCookie('storage', session.storage)
    let rex = await fetch('/api/storage/'+session.storage)
    let inf = await rex.json()
    console.log('Storage', session.storage, inf)
    $('msgDeploy').innerHTML = 'Contract deployed, now set up your drives'
    $('buttonSetup').classList.remove('disabled')
  } else {
    $('msgDeploy').innerHTML = `<warn>Error deploying contract: ${res.error}</warn>`
    $('buttonDeploy').classList.remove('disabled')
  }
}

async function onSetup() {
  console.log('Setting up drives...')
  $('buttonSetup').classList.add('disabled')
  $('msgSetup').innerHTML = 'Wait, setting up drives. It may take another minute...'
  let drive1 = randomAddress()
  let drive2 = randomAddress()
  let res = await setupDrives(session.storage, drive1, drive2)
  if(res.success){
    let dat = {contract:session.storage, drive1, drive2}
    let opt = {method:'post', headers:{'content-type':'application/json'}, body:JSON.stringify(dat)}
    let rex = await fetch('/api/setup', opt)
    let inf = await rex.json()
    console.log('Setup', dat, inf)
    $('msgSetup').innerHTML = 'Drives ready, now you can access your files'
    $('buttonAccess').classList.remove('disabled')
  } else {
    $('msgSetup').innerHTML = `<warn>Error setting up your drives: ${res.error}</warn>`
    $('buttonSetup').classList.remove('disabled')
  }
}

async function onAccess() {
  console.log('Accessing files...')
  window.location.href = '/drive'
}

async function start(){
  console.log('Setup started...')
  let account = getCookie('account')
  console.log('Account:', account)
  window.Metamask = new Wallet()
  await Metamask.start()
  await Metamask.connect()
}
