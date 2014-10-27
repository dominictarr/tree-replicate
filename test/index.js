

var Tree = require('../')

//probability of making an edit,
//probability of replicating.

//how many hashes must be sent to compare replication.

//extend the tree by one edit, referencing all known heads.
var nodes = [], l = 5

while(l--)
  nodes.push(Tree())

function edit(tree) {

  var h = tree.heads()

  var obj = {}

  for(var i in h) {
    obj['foo'+i] = h[i]
  }

  obj.value = Math.random()

  tree.add(obj)
}

var reps = 0, copies = 0, full = 0, depth = 0

//group edits at the same depth into one.
function merge (hist) {
  var key = '', value = '', merged = []
  hist.forEach(function (v) {
    var _key = /^\w+-/.exec(v)[0]
    if(_key != key) {
      key = _key
      if(value) merged.push(value)
      value = v
    }
    else
      value += ',' + v
  })
  merged.push(value)
  return merged
}

function count(a, l) {
  var out = []
  return a.slice(0, l).forEach(function (v) {
    out = out.concat(v.split(','))
  }) || []
}

function compare (a, b) {
  if(a === b)
    throw new Error('should not be called with self')
  var ha = a.history()
  var hb = b.history()
  console.log(ha, hb)
  var ma = merge(ha)
  var mb = merge(hb)
  var c = 0
  for(var i in ma) {
    var j = mb.indexOf(ma[i])
    if(~j)
      return count(ma, +i + 1).concat(count(mb, j+1))
  }
  return ha.concat(hb)
}

function replicate(node) {
  var r
  do {
    r = nodes[~~(nodes.length*Math.random())]
  } while(r === node)

  if(r.heads().length > 1)
    edit(r)
  if(node.heads().length > 1)
    edit(node)

  var added = []
  console.log('replicate')

//  console.log('ADDED', added.length, added)
  reps ++
  full += Object.keys(node.store).length + Object.keys(r.store).length
  var unmatched = compare(node, r)
  depth += unmatched.length

  for(var k in r.store) {
    if(!node.store[k]) added.push(k)
    node.store[k] = r.store[k]
  }

  for(var k in node.store) {
    if(!r.store[k]) added.push(k)
    r.store[k] = node.store[k]
  }

  console.log('UNMATCHED', unmatched)
  console.log('ADDED    ', added)
  copies += added.length

}

EDIT_PROB = 0.2
REPL_PROB = 0.6

for(var i = 0; i < 250; i++) {
  nodes.forEach(function (node) {
    if(Math.random() < EDIT_PROB)
      edit(node)
    if(Math.random() < REPL_PROB) {
      replicate(node)
    }
  })
}

console.log(reps, copies/reps, full/reps, depth/reps)

//console.log(nodes.map(function (e) { return e.store }))
