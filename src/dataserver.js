// DATABASE

const postgres = require('pg')
const dbconn   = process.env.DATABASE
if(!dbconn){ console.error('DATASERVER NOT AVAILABLE') }
const dbp = new postgres.Pool({ connectionString: dbconn })


class DataServer {
  dbc = null

  constructor() { this.connect() }

  async connect() {
    this.dbc = await dbp.connect()
  }

  async disconnect() {
    if(this.dbc) { this.dbc.release(); this.dbc = null; }
  }

  async insert(sql, params, key) {
    var res, recid, data = null
    try {
      //dbc = await dbp.connect()
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rowCount>0) { 
        recid = key?res.rows[0][key]:0
        data  = { status:'OK', id: recid }
      }
    } catch(ex) {
      console.error('DB-ERROR on new record:', ex.message)
      data = { error: ex.message }
    }
    return data
  }

  async update(sql, params) {
    var res, data = null
    try {
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rowCount>0) {
        data = res.rowCount
      } else { 
        data = 0
      }
    } catch(ex) {
      console.error('DB-ERROR updating records:', ex.message)
      data = { error: ex.message }
    }
    return data
  }

  async delete(sql, params) {
    var res, data = null
    try {
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rowCount>0) {
        data = res.rowCount
      } else { 
        data = 0
      }
    } catch(ex) {
      console.error('DB-ERROR deleting records:', ex.message)
      data = { error: ex.message }
    }
    return data
  }

  async query(sql, params) {
    var res, data = null
    try {
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rows.length>0) { 
        data = res.rows
      } else {
        data = []
      }
    } catch(ex) {
      console.error('DB-ERROR in query:', ex.message)
      data = { error: ex.message }
    }
    return data
  }

  async queryObject(sql, params) {
    var res, data = null
    try {
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rows.length>0) { 
        data = res.rows[0]
      }
    } catch(ex) {
      console.error('DB-ERROR getting data object:', ex.message)
      data = { error: ex.message }
    }
    return data
  }

  async queryValue(sql, params) {
    var res, data = null
    try {
      if(!this.dbc){ await this.connect() }
      res = await this.dbc.query(sql, params)
      if(res.rows.length>0) { 
        data = res.rows[0].value || null // Select should have field as value
      }
    } catch(ex) {
      console.error('DB-ERROR getting data value:', ex.message)
      data = { error: ex.message }
    }
    return data
  }
}

module.exports = DataServer

// END