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
  this._exons = null;
  this._infos = {};
  this._cacheInfo = !options.noCacheInfo;

  if (options.xref) {
    this._genes   = {}; // key gene, value tx list
    this._refseqIds = {}; // key refseqId, value tx list
    this._txextra = {}; // key tx, value [gene

    require('fs').readFileSync(options.xref, "utf8").split('\n').filter(function(v) {
      return v.length
    })
    .forEach(function(v) {
      var data = v.split('\t');
      var txname = data[0];
      var refseqId = data[1];
      var gene = data[4];
      if (gene) {
        if (!this._genes[gene]) {
          this._genes[gene] = [];
        }
        this._genes[gene].push(txname);
      }

      if (refseqId) {
        if (!this._refseqIds[refseqId]) {
          this._refseqIds[refseqId] = [];
        }
        this._refseqIds[refseqId].push(txname);
      }

      this._txextra[txname] = [gene, refseqId];
    }, this);
  }

  this.load();
}


/**
 * constructor (static) 
 **/
TxReader.load = function(knownGene, options) {
  return new TxReader(knownGene, options);
};

// syntax sugar
TxReader.create = TxReader.load;

/**
 * get hash ({txname => exon number}) of the given formatted exon
 **/
TxReader.prototype.getTxsByExon = function(formattedExon) {
  this._buildExons();
  return this._exons[formattedExon];
};

/**
 * get list of the given gene
 **/
TxReader.prototype.getTxsByGene = function(geneName) {
  if (!this._genes) throw new Error('you must give xref file in constructor option to call TxReader#getTxsByGene()');
  return this._genes[geneName];
};


/**
 * get list of the given refseq id
 **/
TxReader.prototype.getTxsByRefSeqId = function(refseqId) {
  if (!this._refseqIds) throw new Error('you must give xref file in constructor option to call TxReader#getTxsByRefSeqId()');
  return this._refseqIds[refseqId];
};


/**
 * load a knownGene file
 **/
TxReader.prototype.load = function() {
  var transcripts = fs.readFileSync(this._knownGene, "utf8").split('\n');

  var ret = {};
  var pos = 0;

  transcripts.forEach(function(txline) {
    if (! txline.trim()) return;
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

TxReader.prototype.getGeneName = function(txname) {
  if (!this._txextra) throw new Error('you must give xref file in constructor option to call TxReader#getGeneName()');
  return (this._txextra[txname]) ? this._txextra[txname][0] : null;
};

TxReader.prototype.getRefSeqId = function(txname) {
  if (!this._txextra) throw new Error('you must give xref file in constructor option to call TxReader#getGeneName()');
  return (this._txextra[txname]) ? this._txextra[txname][1] : null;
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
  if (this._txextra) {
    ret.gene   = this.getGeneName(name);
    ret.refseqId = this.getRefSeqId(name);
  }
  if (this._cacheInfo) this._infos[name] = ret;
  return ret;
};

/**
 * get list of formatted exons
 **/
TxReader.prototype.getExons = function(name) {
  var info = this.getInfo(name);
  return info.exons.map(function(ex) {
    return dna.getFormat(info.chrom, ex.start, ex.end, info.strand);
  });
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
  var endBase   = options.endBase || info.exons[endExon-1].end - info.exons[endExon-1].start;

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
 * build exon info
 **/
TxReader.prototype._buildExons = function() {
  if (this._exons) return this;
  this._exons = {};
  Object.keys(this._index).forEach(function(txname) {
    this.getExons(txname).forEach(function(key, k) {
      var N = k+1;
      if (!this._exons[key]) this._exons[key] = {};
      this._exons[key][txname] = N;
    }, this);
  }, this);
  return this;
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
    return { chr: ret.chrom, start: Number(exstart), end: Number(exend), strand: ret.strand };
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
