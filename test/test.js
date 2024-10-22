var TxR = require('../txreader');
var FR  = require('fastareader');
var fr  = new FR(process.argv[2]);



var txr = TxR.load(__dirname + '/hg19_knownGene.txt', {xref: __dirname + "/hg19_kgXref.txt"});

var info = txr.getInfo("uc001agz.1");
var gene = txr.getGeneName("uc001vaz.3");
console.assert(gene == "LCP1", "wrong gene name")

console.log(info);
var seq,st,len;

seq = txr.getSeq(info, fr, {startExon: 1, endExon: 1});
console.assert(seq == fr.fetch(info.chrom, info.exons[0].start+1, info.exons[0].end - info.exons[0].start, info.isMinus))

st=10;
len=20;

seq = txr.getSeq(info, fr, {startExon: 3, endExon: 3, startBase : st, endBase: st+len});
console.assert(seq == fr.fetch(info.chrom, info.exons[2].end-st-len+1, len, info.isMinus))

st=10;
len=20;
seq = txr.getSeq(info, fr, {startExon: 1, endExon: 2, startBase : st, endBase: st+len});
var seq0 = txr.getSeq(info, fr, {startExon: 1, endExon: 1}).slice(st);
console.assert(seq == seq0 + fr.fetch(info.chrom, info.exons[1].end-st-len+1, st + len, info.isMinus))

var exons = txr.getExons("uc001agz.1");
exons.forEach(function(eformat) {
  var txs = txr.getTxsByExon(eformat);
  Object.keys(txs).forEach(function(txname) {
    console.log(txname, txs[txname], txr.getGeneName(txname));
  });
});
var txlist = txr.getTxsByGene("LCP1");
console.log(txlist);
console.assert(txlist.indexOf('uc001vaz.3') >= 0);
var nmlist = txr.getTxsByRefSeqId("NM_033487");
console.log(nmlist);
console.assert(nmlist.indexOf('uc001agz.1') >= 0);
