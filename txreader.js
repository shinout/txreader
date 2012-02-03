var fs = require("fs");

function TxReader(knownGene) {
  this._knownGene = knownGene;
  this._fd = fs.openSync(this._knownGene, "r");
  this._index = null;
  this.load();
}

TxReader.prototype.load = function() {
  var transcripts = fs.readFileSync(this._knownGene).toString().split('\n');

  var ret = {};
  var pos = 0;

  transcripts.forEach(function(txline) {
    var data = txline.split('\t');
    var key = data[0];
    ret[key] = txline;

    // var len = txline.length;

    // ret[key] = [pos, len];

    // pos += txline.length + 1;
  });

  this._index = ret;
};

TxReader.prototype.getNames = function() {
  return Object.keys(this._index);
};

TxReader.prototype.getLine = function(name) {
  if (!this._index) {
    this.load();
  }


  var line = this._index[name];

  if (!line) {
    throw new Error("invalid name: " + name);
  }
  return line;

  // var pos = line[0];
  // var len = line[1];
  // var ret = fs.readSync(this._fd, len, pos, "utf8")[0];
  // return ret;
};


/**
 * get information
 **/
TxReader.prototype.getInfo = function(name) {
  var line = this.getLine(name);
  return TxReader.parseLine(line);
};



/**
 * get information (static)
 **/
TxReader.parseLine = function(line) {
  var vals = line.split('\t');
  if (vals.length < 12) return false;
  
  var ret = {
    name       : vals.shift(),
    chrom      : vals.shift(),
    strand     : vals.shift(),
    txStart    : vals.shift(),
    txEnd      : vals.shift(),
    cdsStart   : vals.shift(),
    cdsEnd     : vals.shift(),
    exonCount  : parseInt(vals.shift()),
    exonStarts : vals.shift().slice(0, -1).split(','),
    exonEnds   : vals.shift().slice(0, -1).split(','),
    proteinID  : vals.shift(),
    alignID    : vals.shift()
  };


  var exons = ret.exonStarts.map(function(exstart, k) {
    var exend = ret.exonEnds[k];
    return { start: Number(exstart), end: Number(exend) };
  });

  ret.isMinus = (ret.strand == '-');

  if (ret.isMinus) {
    exons = exons.reverse();
  }
  ret.exons = exons;

  return ret;
};


module.exports = TxReader;
