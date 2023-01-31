async function onConnect(enable=true){
  console.log('Connecting...')
  //await Metamask.start(enable)
  await Metamask.connect()
  let account = await Metamask.getAccount()
  if(!account || !account.address){
    console.log('Account not found')
    return
  }
  console.log('Account', account)
  session.account = account.address.toLowerCase()
  setCookie('account', session.account)
  window.location.href = '/drive'
}

async function signMessage() {
  let act = Metamask.myaccount
  let msg = 'Log in to EverFile'
  let sgn = await web3.eth.personal.sign(msg, act)      // Metamask popup
  let vfy = await web3.eth.personal.ecRecover(msg, sgn) // Verify response
  console.log('Verify', act, '=', vfy)
  if(act==vfy){
    console.log('Signed')
    return act
  } else {
    console.log('Not signed')
    return null
  }
}

async function reconnectWallet() {
  console.log('Reconnecting...')
  session.account = Metamask.myaccount.toLowerCase()
  if(session.account){
    setCookie('account', session.account)
    window.location.href = '/drive'
  }
}

async function onLogout(){
  console.log('Logged out')
  session.account = '';
  setCookie('account', '')
  message('Reconnect Metamask to access your drive')
}

async function start(){
  console.log('Login started')
  let account = getCookie('account')
  let drive   = getCookie('drive')
  console.log('Cookies:', account, drive)
  window.Metamask = new Wallet()
  await Metamask.start()
}

// END