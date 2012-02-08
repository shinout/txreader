var fs = require("fs");
var dna = require('dna');

/**
 * constructor
 **/
function TxReader(knownGene, options) {
  options || (options = {});
  this._knownGene = knownGene;
  this._fd = fs.openSync(this._knownGene, "r");
  this._index = null;
  this._infos = {};
  this._cacheInfo = !options.noCacheInfo;
  this.load();
}


/**
 * constructor (static) 
 **/
TxReader.load = function(knownGene, options) {
  return new TxReader(knownGene, options);
};

/**
 * load a knownGene file
 **/
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

/**
 * get transcript names
 **/
TxReader.prototype.getNames = function() {
  return Object.keys(this._index);
};

/**
 * get transcript lines
 **/
TxReader.prototype.getLine = function(name) {
  if (!this._index) {
    this.load();
  }

  var line = this._index[name];

  if (!line) {
    throw new Error("invalid name: " + name);
  }
  return line;
};


/**
 * get information
 **/
TxReader.prototype.getInfo = function(name) {
  if (this._infos[name]) return this._infos[name];
  var line = this.getLine(name);
  var ret = TxReader.parseLine(line);
  if (this._cacheInfo) this._infos[name] = ret;
  return ret;
};


/**
 * get sequence
 **/
TxReader.prototype.getSeq = function(name, fr, options) {
  var info = (typeof name == 'object') ? name : this.getInfo(name);

  options || (options = {});
  var startExon = options.startExon || 1;
  var startBase = options.startBase || 0;
  var endExon   = options.endExon || info.exons.length;
  var endBase   = options.endBase || info.exons[endExon].end - info.exons[endExon].start;

  return info.exons.map(function(exon, k) {
    var K = k+1;
    if (K < startExon || K > endExon) return '';

    var poslen = dna.getPosLen(exon.start, exon.end);
    var seq = fr.fetch(info.chrom, poslen[0], poslen[1], info.isMinus);

    if (K == startExon) {
      seq = seq.slice(startBase);
    }
    if (K == endExon) {
      seq = seq.slice(0, (K != startExon) ? endBase : endBase - startBase);
    }
    return seq;
  }).join('');
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
  delete ret.exonStarts;
  delete ret.exonEnds;
  delete ret.exonCount;

  return ret;
};


module.exports = TxReader;
