function os_hilfe (hnr) {msg=open("","os_hilfe","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=400,width=500");msg.location = "os-hilfe/" + hnr + ".html"}
function spielerinfo (snr) {msg=open("","os_spieler","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,copyhistory=yes,width=800,height=550");msg.location = "sp.php?s=" + snr}
function teaminfo (tnr) {msg=open("","os_team","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,width=750");msg.location = "st.php?c=" + tnr}
function os_bericht (hnr,gnr,zat,saison) {msg=open("","os_bericht","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=550,width=650");msg.location = "rep/saison/" + saison + "/" + zat + "/" + hnr + "-" + gnr + ".html"}
function bieten (snr) {msg=open("","os_bericht","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=300,width=450");msg.location = "gebot.php?s=" + snr}
function vmbieten (snr) {msg=open("","os_bericht","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=320,width=500");msg.location = "vmgebot.php?s=" + snr}
function jubieten (snr) {msg=open("","os_bericht","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=320,width=500");msg.location = "juscout.php?g=" + snr}
function writePM(receiver) {msg=open("","os_pm","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=450,width=1000");msg.location = "pm.php?action=writeNew&receiver_id=" + receiver}
function tabellenplatz(team) {msg=open("","os_tabelle","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=300,width=680");msg.location = "tplatz.php?t=" + team}
function spielpreview(tnr1,tnr2,styp) {msg=open("","os_spielprev","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=390,width=630");msg.location = "spielpreview.php?t1=" + tnr1 + "&t2=" + tnr2 + "&type=" + styp}
function transferview(trnr) {msg=open("","os_transfer","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=200,width=600");msg.location = "transferview.php?tr=" + trnr}
function kommentar(sid) {msg=open("","os_comment","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=400,width=540");msg.location = "bericht.php?s=" + sid}
function os_wiki (hnr) {msg=open("","os_wiki","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=yes,height=600,width=800");msg.location = "http://os.ongapo.com/wiki/" + hnr;}
$(function() {
	if ($('input[name="livegame"]').length > 0) {
		$('input[name="livegame"]').click(function() {
			checked = []
			$("input:checkbox[name=live]:checked").each(function () {
				checked.push($(this).val())
			});
			//alert(checked.join(","))
			document.location.href="livegame/?spiele="+checked.join(",");
		});
	}
});