txreader
=========

description
------------
Handling transcript information data.
(e.g. knownGene.txt)

installation
-------------

    $ npm install txreader

usage
------
    var TxReader = require('txreader');
    var tx = new TxReader('knownGene.txt', {
      xref: 'kgXref.txt' // gene name info (optional)
    });
    var info = tx.getInfo('uc001acn.2'); // info object (explains later)
    var formattedExons = tx.getExons('uc001acn.2'); // get list of formatted exons (e.g. chr1:2345-6789,+)
    var transcripts = tx.getTxsByExon(formattedExons[0]); // get hash of transcripts which has the given formatted exon
    Object.keys(transcripts).forEach(function(txname) {
      console.log(txname, transcripts[txname]); // transcript name, the exon number of the given exon in the transcript
    });
    var BCRs = tx.getTxsByGene('BCR'); // get list of transcripts whose gene name is 'BCR' ( this is NOT hash, but list)
    var NMs  = tx.getTxsByRefSeqId('NM_033487'); // get list of transcripts whose refseq id is 'NM_033487' ( this is NOT hash, but list)

info?
------

<table>
<tr><th>key name</th>
<td>description</td>
<td>example</td></tr>

<tr><th>name</th>
<td>name of the transcript</td>
<td></td>uc011msz.1</tr>

<tr><th>chrom</th>
<td>chromosome name</td>
<td>chr11</td></tr>

<tr><th>strand</th>
<td>strand of the transcript (+/-)</td>
<td>+</td></tr>

<tr><th>isMinus</th>
<td>if strand is minus (boolean)</td>
<td>false</td></tr>

<tr><th>txStart</th>
<td>transcription start position (0-based coordinate system)</td>
<td>12345880</td></tr>

<tr><th>txEnd</th>
<td>transcription end position (0-based coordinate system)</td>
<td>12346880</td></tr>

<tr><th>cdsStart</th>
<td>coding region start position (0-based coordinate system)</td>
<td>12345880</td></tr>

<tr><th>cdsEnd</th>
<td>coding region end position (0-based coordinate system)</td>
<td>12346880</td></tr>

<tr><th>proteinID</th>
<td>protein ID</td>
<td>B7ZGX9</td></tr>

<tr><th>exons</th>
<td>list of exons. (Array)</td>
<td>[{start: xxx, end: xxx}, ...]</td></tr>

<tr><th>gene</th>
<td>gene name</td>
<td>ALG13</td></tr>

<tr><th>refseqId</th>
<td>refseq ID</td>
<td>NM_033487</td></tr>



</table>
