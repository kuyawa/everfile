// WALLET

let web3 = null;


async function onWalletConnect(info) {
  console.log('Metamask onConnect', info);
  window.Metamask.setNetwork(info.chainId);
  //loadWallet();
}

async function onWalletDisconnect(info) {
  console.log('Metamask onDisconnect', info)
  console.log('Disconnected')
}

async function onWalletAccounts(info) {
  console.log('Metamask onAccounts', info)
  window.Metamask.accounts  = info;
  window.Metamask.myaccount = info[0];
  console.log('My account', window.Metamask.myaccount);
  reconnectWallet();
  //window.Metamask.getBalance(window.Metamask.myaccount);
}

async function onWalletChain(chainId) {
  console.log('Metamask onChain', chainId)
  if(chainId==window.Metamask.chainId) { console.log('Already on chain', chainId); return; }
  window.Metamask.setNetwork(chainId);
  //window.Metamask.loadWallet();
  //requestAccount();
  //getAccounts();
}

async function onWalletMessage(info) {
  console.log('Metamask onMessage', info)
}


class Wallet {
  constructor(){
    console.log('Wallet loaded')
    this.wallet    = null;
    this.accounts  = [];
    this.myaccount = null;
    this.chainId   = null;
    this.mainnet   = null;
    this.network   = null;
    this.neturl    = null;
    this.explorer  = null;
    this._connected = false;
  }

  async start(enable=false){
    if(window.ethereum && window.ethereum.isMetaMask){
      console.log('Metamask is present');
      web3 = new Web3(window.ethereum);
      this.wallet = window.ethereum;
      //this.wallet.getAccount = async function() {
      //  let accts = await web3.eth.getAccounts();
      //  if(accts.length>0) { return {address:accts[0].toLowerCase()}; }
      //  else { return {address:null}; }
      //}
      this.wallet.on('connect', onWalletConnect);
      this.wallet.on('disconnect', onWalletDisconnect);
      this.wallet.on('accountsChanged', onWalletAccounts);
      this.wallet.on('chainChanged', onWalletChain);
      this.wallet.on('message', onWalletMessage);
      console.log('Wallet listeners set');
        
      if(enable){ 
        //this.wallet.enable()
        this.connect()
      }

      //web3 = new Web3(this.neturl);
      //console.log('WEB3', web3);
      //console.log('VER', web3.version)

      let cid = await web3.eth.getChainId();
      console.log('ChainId', cid);
      if(cid==314 || cid==3141 || cid==31415){
        // OK
      } else {
        this.chainId = cid;
        console.log('Metamask not connected to Filecoin');
        if(enable){ alert('Metamask not connected to Filecoin'); }
      }
    } else {
        console.log('Metamask not available');
    }
  }

  async getAccount(){
    let accts = await web3.eth.getAccounts();
    if(accts.length>0) { return {address:accts[0].toLowerCase()}; }
    else { return {address:null}; }
    //return await this.wallet.getAccount()
  }

  async getBalance(adr){
    console.log('Get balance...', adr);
    let res, bal;
    try {
      res = await web3.eth.getBalance(adr);
      console.log('Balance', adr.substr(0,8), res);
      //bal = (parseInt(res)/10**18).toLocaleString('en-US', { useGrouping: true, minimumFractionDigits: 4, maximumFractionDigits: 4});
      bal = (parseInt(res)/10**18);
    } catch(ex) {
      console.log('Metamask error', ex)
      bal = 0.0;
    }
    return bal;
  }

  async getGasPrice() {
      let gas = await web3.eth.getGasPrice();
      //let gas = res.result || 10000000000;
      console.log('Average gas price:', gas, parseInt(gas,16));
      return gas;
  }

  async setNetwork(chain) {
    console.log('SetNetwork ChainID', chain, parseInt(chain, 16));
  }

  async connect() {
    console.log('Metamask connecting...');
    //window.ethereum.enable();
    //let acts = await window.ethereum.request({method:"eth_requestAccounts", params:[{eth_accounts: {}}]});
    let acts = await window.ethereum.request({method:"eth_requestAccounts"});
    console.log('ACTS', acts);
    Metamask.myaccount = acts[0];
  }
}

//window.Metamask = new Wallet();

// END