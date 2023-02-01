const previewMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

function fileExt(mime){
  let exts = {'image/jpeg':'jpg', 'image/png':'png', 'image/gif':'gif', 'image/webp':'webp', 'image/svg+xml':'svg'}
  return exts[mime]
}

function showError(text){
  console.log('Err:', text)
  $('message').innerHTML = '<warn>'+text+'</warn>'
}

function showMessage(text){
  console.log('Msg:', text)
  $('message').innerHTML = text
}

function showUpload(text, disabled=false){
  if(!text){ text = 'Upload' }
  $('buttonUpload').innerHTML = text
  $('buttonUpload').disabled  = disabled
}

function onRowClick(evt){
  let itemid = evt.target.parentNode.dataset.id
  selectFile(itemid)
  let type   = evt.target.className
  console.log(type, itemid)
  if(type=='fold'){
    loadFolder(itemid)
  } else {
    let url = '/files/'+itemid
    console.log('preview', url)
    tabPreview(itemid)
  }
}

async function loadFolder(folderid){
  session.folderid = folderid
  let url = `/api/dir/${folderid}`
  console.log(url)
  let res = await fetch(url)
  let dir = await res.json()
  console.log('DIR', dir)
  session.dir = dir
  showPath(dir.folder)
  reloadTable(session.dir)
}

async function showPath(folder){
  $('path').innerHTML = (folder.name=='root'?'/':'../')+folder.name
}

async function reloadTable(dir){
  let table = $('files')
  let tbody = table.tBodies[0]
  tbody.innerHTML = ''
  for(var key in dir.folders) {
    insertFolder(dir.folders[key])
  }
  for(var key in dir.files) {
    insertFile(dir.files[key])
  }
}

async function onParentFolder(){
  console.log('Current', session.dir.folder.folderid)
  console.log('Parent',  session.dir.folder.parentid)
  if(session.dir.folder.parentid == null){ return }
  loadFolder(session.dir.folder.parentid)
}

function toggleFolderForm(){
  let form = $('folderForm')
  console.log(folderForm.style.display)
  if(!folderForm.style.display || folderForm.style.display=='none'){
    form.style.display = 'inline-block'
    $('folderName').focus()
  } else {
    form.style.display = 'none'
  }
}

function onFormKey(evt){
  //console.log(evt)
  if(evt.key=='Enter'){
    createFolder()
  }
  if(evt.key=='Escape'){
    toggleFolderForm()
  }
}

async function createFolder(){
  let input = $('folderName')
  let name  = input.value
  console.log('New folder', name)
  input.value = ''
  if(!name){ return }
  let folder = {
    folderid: randomAddress(),
    name: name
  } 
  // save folder in contract and db
  var data = new FormData()
  data.append('owner',    session.account)
  data.append('contract', session.storage)
  data.append('driveid',  session.driveid)
  data.append('parentid', session.folderid||session.driveid)
  data.append('folderid', folder.folderid)
  data.append('name',     folder.name)
  let res = await fetch('/api/newfolder', {method: "POST", body: data})
  let inf = await res.json()
  console.log('RES', inf)
  insertFolder(folder)
  sortTable(0,1)
}

async function clearUpload(){
  showUpload()
  showMessage('Select a file to upload')
  $('uploadImage').src = '/media/selectfile.png'
  $('fileName').innerHTML = ''
  $('fileSize').innerHTML = ''
  $('fileType').innerHTML = ''
}

async function tabUpload(){
  console.log('Upload')
  $('preview').style.display = 'none'
  $('upload').style.display = 'block'
  clearUpload()
}

async function tabPreview(itemid){
  console.log('itemid', itemid)
  $('upload').style.display  = 'none'
  $('preview').style.display = 'block'
  let file = session.dir.files[itemid]
  session.selected = file
  console.log('file', file)
  $('labelName').innerHTML = file.name
  $('labelIpfs').innerHTML = `<a href="https://gateway.lighthouse.storage/ipfs/${file.cid}" target="_blank">${file.cid.substr(0,20)+'...'}</a>`
  $('labelSize').innerHTML = fileSize(file.size)
  $('labelType').innerHTML = file.mime
  $('labelDate').innerHTML = fileDate(file.date)
  if(previewMime.indexOf(file.mime)>=0){
    if(session.drive.encrypt){
      if(file.url){
        console.log('cached', file.cid)
        $('previewImage').src = file.url
      } else {
        $('previewImage').src = '/media/encrypted.png'
        $('decrypt').classList.remove('hidden')
      }
    } else {
      $('previewImage').src = `/uploads/${file.fileid}.${fileExt(file.mime)}`
    }
  } else {
    $('previewImage').src = '/media/nopreview.png'
  }
}

function insertFolder(folder){
  //console.log('Insert', folder)
  let table = $('files')
  let tbody = table.tBodies[0]
  let row   = tbody.insertRow()
  row.innerHTML = `<tr data-id="${folder.folderid}"><td class="fold" data-value="_${folder.name}">${folder.name}</td><td></td><td></td><td></td><td></td></tr>`
  row.dataset.id = folder.folderid
}

function insertFile(file){
  //console.log('Insert', file)
  let table = $('files')
  let tbody = table.tBodies[0]
  let row   = tbody.insertRow()
  row.innerHTML = `<tr data-id="${file.fileid}"><td class="file" data-value="${file.name}">${file.name}</td><td>${file.cid.substr(0,20)+'...'}</td><td>${fileSize(file.size)}</td><td>${file.mime}</td><td>${fileDate(file.date)}</td></tr>`
  row.dataset.id = file.fileid
}

function unselectAll(){
  let table = $('files')
  let tbody = table.tBodies[0]
  let rows  = tbody.rows
  for(var i=0; i<rows.length; i++) {
    rows[i].classList.remove('selected')
  }
}

function selectFile(id){
  let table = $('files')
  let tbody = table.tBodies[0]
  let rows  = tbody.rows
  for(var i=0; i<rows.length; i++) {
    if(rows[i].dataset.id==id && !(rows[i].classList.contains('selected'))){
      rows[i].classList.add('selected')
    } else {
      rows[i].classList.remove('selected')
    }
  }
}

function sortTable(n=0,colValue=false){
  function compare(a,b,order='asc'){
    if(order=='asc') {
      if (a > b) { return true }
    } else if(order=='desc') {
      if (a < b) { return true }
    }
    return false
  }
  var rows, i, x, y, shouldSwitch, switchcount = 0
  let table = $('files')
  let tbody = table.tBodies[0]
  let switching = true
  let sortDir = "asc"
  // First folders
  // Then files
  while (switching) {
    switching = false
    rows = tbody.rows
    for(i=0; i<(rows.length-1); i++) {
      //if(rows[i].cells[0].className=='file'){ continue; }
      shouldSwitch = false
      if(colValue){
        if(colValue==1){
          x = rows[i].cells[n].dataset.value
          y = rows[i+1].cells[n].dataset.value
        } else {
          x = Number(rows[i].cells[n].dataset.value)
          y = Number(rows[i+1].cells[n].dataset.value)
        }
      } else {
        x = rows[i].cells[n].innerHTML
        y = rows[i+1].cells[n].innerHTML
      }
      if(rows[i].cells[0].className=='fold'){
        x = (sortDir=='asc'?'#':'~')+rows[i].cells[0].dataset.value
      }
      if(rows[i+1].cells[0].className=='fold'){
        y = (sortDir=='asc'?'#':'~')+rows[i+1].cells[0].dataset.value
      }
      if(compare(x,y,sortDir)){ shouldSwitch=true; break }
    }
    if(shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i+1], rows[i])
      switching = true
      switchcount ++
    } else {
      if(switchcount==0 && sortDir=="asc") {
        sortDir = 'desc'
        switching = true
      }
    }
  }
}

function onImagePreview(evt){
  console.log('Preview')
  let file = evt.target.files[0]
  console.log(file)
  showMessage('')
  $('fileName').innerHTML = file.name
  $('fileSize').innerHTML = fileSize(file.size)
  $('fileType').innerHTML = file.type
  if(previewMime.indexOf(file.type)>=0){
    let reader = new FileReader()
    reader.onload = function(e){
      //console.log(e.target.result.split(':')[1].split(';')[0])
      $('uploadImage').src = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    $('uploadImage').src = '/media/nopreview.png'
  }
  if(session.drive.encrypt){
    onEncrypt(evt)
  }
}

async function onUpload(){
  console.log('Uploading...')
  showMessage('Uploading, wait a moment...')
  showUpload('WAIT', true)
  try {
    let fileid = randomAddress()
    let file = $('uploadFile').files[0]
    if(!file){
      showError('No file selected')
      showUpload()
      return null
    }
    var data = new FormData()
    data.append('owner',    session.account)
    data.append('contract', session.storage)
    data.append('driveid',  session.driveid)
    data.append('folderid', session.folderid||session.driveid)
    data.append('fileid',   fileid)
    data.append('encrypt',  session.drive.encrypt || false)
    data.append('file', file)
    let res = await fetch('/api/newfile', {method: "POST", body: data})
    let inf = await res.json()
    console.log('Uploaded', inf)
    if(!inf || inf.error){
      showError('File could not be uploaded<br>'+(inf?.error||'Unknown'))
      showUpload()
      return null
    }
    let item = {recid:0, folderid:inf.folderid, fileid:inf.fileid, name:inf.name, cid:inf.cid, size:inf.size, mime:inf.mime, date:inf.date}
    session.dir.files[fileid] = item
    insertFile(item)
    sortTable()
    selectFile(fileid)
    showMessage('File uploaded')
    showUpload('DONE',true)
  } catch(ex) {
    console.error(ex)
    showError('Error uploading file<br>'+ex.message)
    showUpload()
  }
}

async function uploadEncrypted(cid){
  console.log('Uploading...')
  showMessage('Uploading, wait a moment...')
  showUpload('WAIT', true)
  try {
    let fileid = randomAddress()
    let file = $('uploadFile').files[0]
    if(!file){
      showError('No file selected')
      showUpload()
      return null
    }
    //let cid  = await encrypt(file) // sign and upload encrypted
    //if(!cid){
    //  showError('Error encrypting file')
    //  showUpload()
    //  return null
    //}
    var data = new FormData()
    data.append('owner',    session.account)
    data.append('contract', session.storage)
    data.append('driveid',  session.driveid)
    data.append('folderid', session.folderid||session.driveid)
    data.append('fileid',   fileid)
    data.append('filename', file.name)
    data.append('filesize', file.size)
    data.append('filemime', file.type)
    data.append('filecid',  cid)
    data.append('encrypt',  true)
    let res = await fetch('/api/encrypt', {method: "POST", body: data})
    let inf = await res.json()
    console.log('Uploaded', inf)
    if(!inf || inf.error){
      showError('File could not be uploaded<br>'+(inf?.error||'Unknown'))
      showUpload()
      return null
    }
    let item = {recid:0, folderid:inf.folderid, fileid:inf.fileid, name:inf.name, cid:inf.cid, size:inf.size, mime:inf.mime, date:inf.date}
    session.dir.files[fileid] = item
    insertFile(item)
    sortTable()
    selectFile(fileid)
    showMessage('File uploaded')
    showUpload('DONE',true)
  } catch(ex) {
    console.error(ex)
    showError('Error encrypting file<br>'+ex.message)
    showUpload()
  }
}

function progress(data) {
  let pct = parseInt(100 - (data?.total / data?.uploaded))
  console.log(pct, '%');
}

async function signMessage(){
  console.log('Signing message for', Metamask.myaccount)
  let pub = Metamask.myaccount
  let res = await lighthouse.getAuthMessage(pub)
  console.log('res', res)
  let msg = res.data.message
  console.log('msg', msg)
  //let sgn = await web3.eth.accounts.sign(msg)
  let sgn = await web3.eth.personal.sign(msg, pub)
  //let sgn = await web3.eth.sign(msg)
  console.log('sgn', sgn)
  return {pubkey:pub, message:sgn}
}

async function onEncrypt(evt){
  //console.log('evt', evt)
  console.log('Uploading...')
  showMessage('Uploading, wait a moment...')
  showUpload('WAIT', true)
  evt.persist = (...args)=>{ console.log('Persist', args) } // hack to make lighthouse work, this is not react
  let sgn = await signMessage()
  let inf = await lighthouse.uploadEncrypted(evt, sgn.pubkey, session.apikey, sgn.message, progress)
  console.log('inf', inf)
  let cid = inf.data.Hash
  console.log('cid', cid)
  //return cid
  if(!cid){
    showError('Error encrypting file')
    showUpload()
    return
  }
  uploadEncrypted(cid)
}

async function onDecrypt(){
  let cid = session.selected.cid
  console.log('cid', cid)
  let sgn = await signMessage()
  let inf = await lighthouse.fetchEncryptionKey(cid, sgn.pubkey, sgn.message)
  console.log('inf', inf)
  let fek = inf.data.key
  console.log('fek', fek)
  let dec = await lighthouse.decryptFile(cid, fek)
  console.log('dec', dec)
  let url = URL.createObjectURL(dec)
  console.log('url', url)
  $('previewImage').src = url
  session.dir.files[session.selected.fileid].url = url
}

async function onRename(){
  //
}

async function onDelete(){
  //
}

async function start(){
  console.log('Drive started')
  sortTable(0,1)
  let body = $('files').tBodies[0]
  body.addEventListener('click', onRowClick, true)
  window.Metamask = new Wallet()
  await Metamask.start()
  await Metamask.connect()
  console.log('Connected to', Metamask.myaccount)
}

// END