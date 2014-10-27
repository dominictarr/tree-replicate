var crypto = require('crypto')

function hash(obj) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(obj, null, 2), 'utf8')
    .digest('hex')
}

function pointers (obj, store) {
  var p = []
  for(var k in obj) {
    if(store[obj[k]])
      p.push(obj[k])
  }
  return p
}

function depth (b) {
  return parseInt(b.substring(0, b.indexOf('-')), 16)
}

module.exports = function () {
  var store = {}
  return {
    store: store,
    add: function (obj) {
      var p = pointers(obj, store)
      var max = p.reduce(function (a, b) {
        return Math.max(a, depth(b) + 1)
      }, 0)
      var key = (max || 0).toString(16)+'-'+hash(obj).substring(0, 16)
      store[key] = obj
      return key
    },
    keys: function () {
      return Object.keys(store)
    },
    history: function () {
      return this.keys().sort(function (a, b) {
        return depth(b) - depth(a) || (a < b ? -1 : a > b ? 1 : 0)
      })
    },
    max: function () {
      this.history()[0]
    },
    heads: function (s) {
      var refs = {}, heads = []

      for(var k in store)
        pointers(store[k], store).forEach(function (k) { refs[k] = true })
      for(var k in store)
        if(!refs[k]) heads.push(k)

      return heads
    }
  }
}


