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

<!--
<tr><th>exonCount</th>
<td>the number of exons</td>
<td>5</td></tr>

<tr><th>exonStarts</th>
<td>exon start positions (0-based) (Array)</td>
<td>[1234, 2345]</td></tr>

<tr><th>exonEnds</th>
<td>exon end positions (0-based) (Array)</td>
<td>[1245, 3456]</td></tr>
-->

<tr><th>proteinID</th>
<td>protein ID</td>
<td>B7ZGX9</td></tr>

<tr><th>exons</th>
<td>list of exons. (Array)</td>
<td>[{start: xxx, end: xxx}, ...]</td></tr>

<tr><th>gene</th>
<td>gene name</td>
<td>ALG13</td></tr>


</table>
