function $(id){ return document.getElementById(id) }

function message(text, warn) {
  if(warn){ text = '<warn>'+text+'</warn>' }
  $('message').innerHTML = text
}

function setCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  let path = '; path=/';
  //document.cookie = `${name}=${value}${expires}${path}`;
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name) {
  let value = null;
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
    if (c.indexOf(nameEQ) == 0) { value = c.substring(nameEQ.length, c.length); break; }
  }
  return value;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    console.log('Copying to clipboard was successful!');
  }, function(err) {
    console.error('Could not copy to clipboard:', err);
  });
}

function randomAddress() {
  let buf = crypto.getRandomValues(new Uint8Array(20));
  let adr = '0x'+Array.from(buf).map(x=>{return x.toString(16).padStart(2,'0')}).join('');
  return adr;
}

function title(text) {
  return text[0].toUpperCase()+text.substr(1)
}

function fileSize(size) {
  if(size>1000000000){
    return (size/1000000000).toFixed(2) + ' Gb'
  } else if(size>1000000){
    return (size/1000000).toFixed(2) + ' Mb'
  } else if(size>1000) {
    return (size/1000).toFixed(2) + ' Kb'
  }
  return size + ' b'
}

function fileDate(date) {
  return new Date(date).toJSON().replace('T', ' ').substr(0,19)
}

function main(){
  console.log('EVERFILE 1.0')
  if(window['start']) { start() }
}

window.onload = main

// END