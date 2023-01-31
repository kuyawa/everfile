// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

// EVERFILE v1.0
contract Storage {

//- LOGS

  event logInit(address indexed self, address indexed owner, address indexed admin, uint date);
  event logDrive(uint indexed driveid, string name, bool encrypt, uint date);
  event logFolder(uint indexed driveid, uint indexed folderid, uint indexed parentid, string name, uint date);
  event logFile(uint indexed folderid, uint indexed fileid, string name, string cid, string mime, uint size, uint date);

//- VARS

  address internal admin;
  address internal owner;
  
  struct Drive {
    uint   driveid;
    string name;
    bool   encrypt;
  }

  struct Folder {
    uint   driveid;
    uint   folderid;
    uint   parentid;
    string name;
  }

  struct File {
    uint   folderid;
    uint   fileid;
    string name;
    string cid;
    string mime;
    uint   size;
    uint   date;
  }
  
  struct Dir {
    Folder[] listfolders;
    File[]   listfiles;
  }


  uint[] listdrives;
  mapping(uint => Drive)  drives;
  mapping(uint => Folder) folders;
  mapping(uint => File)   files;
  mapping(uint => uint[]) foldersindrive;
  mapping(uint => uint[]) foldersinparent;
  mapping(uint => uint[]) filesinfolder;

//- MODS

  bool private mutex; // reentry check

  modifier isadmin() {
    require(msg.sender==admin || msg.sender==owner, 'ERR_UNAUTHORIZED');
    _;
  }

  modifier isowner() {
    require(msg.sender==owner, 'ERR_UNAUTHORIZED');
    _;
  }

  modifier lock() {
    require(!mutex, "ERR_INVALIDREENTRYLOCK");
    mutex = true;
    _;
    mutex = false;
  }

  modifier vlock() {
    require(!mutex, "ERR_INVALIDREENTRYVIEW");
    _;
  }

//- MAIN

  constructor(address _admin) {
    owner = msg.sender;
    if(_admin==address(0)){ _admin = owner; }
    admin = _admin;
    emit logInit(address(this), owner, admin, block.timestamp);
  }

  function newDrive(uint driveid, string memory name, bool encrypt) public isadmin {
    drives[driveid] = Drive(driveid, name, encrypt);
    listdrives.push(driveid);
    emit logDrive(driveid, name, encrypt, block.timestamp);
  }

  function newFolder(uint driveid, uint folderid, uint parentid, string memory name) public isadmin {
    folders[folderid] = Folder(driveid, folderid, parentid, name);
    foldersindrive[driveid].push(folderid);
    if(parentid>0){
      foldersinparent[parentid].push(folderid);
    }
    emit logFolder(driveid, folderid, parentid, name, block.timestamp);
  }

  function newFile(uint fileid, uint folderid, string memory name, string memory cid, string memory mime, uint size) public isadmin {
    uint date = block.timestamp;
    files[fileid] = File(folderid, fileid, name, cid, mime, size, date);
    filesinfolder[folderid].push(fileid);
    emit logFile(folderid, fileid, name, cid, mime, size, date);
  }

  function getDrives() public view returns (Drive[] memory) {
    Drive[] memory list = new Drive[](listdrives.length);
    for(uint i=0; i<listdrives.length; i++){
      list[i] = drives[listdrives[i]];
    }
    return list;
  }

  function getFolders(uint folderid) public view returns (Folder[] memory) {
    Folder[] memory list = new Folder[](foldersinparent[folderid].length);
    for(uint i=0; i<foldersinparent[folderid].length; i++){
      list[i] = folders[foldersinparent[folderid][i]];
    }
    return list;
  }

  function getFiles(uint folderid) public view returns (File[] memory) {
    File[] memory list = new File[](filesinfolder[folderid].length);
    for(uint i=0; i<filesinfolder[folderid].length; i++){
      list[i] = files[filesinfolder[folderid][i]];
    }
    return list;
  }

  function getDir(uint folderid) public view returns (Dir memory) {
    Dir memory dir = Dir(new Folder[](foldersinparent[folderid].length), new File[](filesinfolder[folderid].length));
    for(uint i=0; i<foldersinparent[folderid].length; i++){
      dir.listfolders[i] = folders[foldersinparent[folderid][i]];
    }
    for(uint i=0; i<filesinfolder[folderid].length; i++){
      dir.listfiles[i] = files[filesinfolder[folderid][i]];
    }
    return dir;
  }

  function setup(uint drive1, uint drive2) public lock isadmin {
    newDrive(drive1, "personal", false);
    newDrive(drive2, "encrypted", true);
    newFolder(drive1, drive1, 0, ""); // root
    newFolder(drive2, drive2, 0, ""); // root
  }

//- ADMIN

  function getAdmin() public view returns (address) {
    return admin;
  }

  function setAdmin(address any) public lock isowner {
    admin = any;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function setOwner(address any) public lock isowner {
    owner = any;
  }

}

//- END