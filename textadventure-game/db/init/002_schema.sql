-- Insert data for the text adventure game

-- Insert skins
INSERT INTO skins (name, personality, description, resource_path) VALUES
('Gelehrter', 'neugierig, rational', 'Gurkelbert sucht nicht nach Sicherheit, sondern nach Antworten. Alte Symbole faszinieren ihn mehr, als sie ihm Angst machen. Er glaubt, dass alles erklärbar ist, selbst Dinge, die besser unbeantwortet bleiben.', '/skins/gelehrter.png'),
('Koch','chaotisch, enthusiastisch','Probiert alles, auch wenn es komisch klingt, und rührt ständig in Töpfen herum und ist Immer mit Schürze unterwegs', '/skins/koch.png'),
('Philosoph', 'ruhig, nachdenklich', 'Geht alles langsam an und denkt über alles nach, sogar über das Wetter oder die Farbe von Steinen.', '/skins/philosoph.png'),
('Optimist', 'freundlich, fröhlich', 'Sieht immer das Gute, selbst in Pfützen oder Schuhkartons, Lacht viel, auch über Dinge, die niemand lustig findet.', '/skins/optimist.png');


-- Insert story nodes
INSERT INTO story_nodes (id, title, content) VALUES
(1, 'Der tiefe dunkle Wald endet abrupt.', 'Wo eben noch knorrige Stämme standen, öffnet sich nun eine runde Lichtung, als hätte jemand die Bäume mit Absicht zurückgedrängt. Der Boden ist weich und dunkel, durchzogen von Wurzeln. In der Mitte erhebt sich ein niedriger Steinaltar, schwarz verfärbt, mit eingeritzten Symbolen, die älter wirken, als jede euch bekannte Sprache.
Die Luft ist schneidend und kalt, zu kalt für diese Jahreszeit.
Ihr seid nicht gemeinsam zu dieser Lichtung gekommen und doch steht ihr nun zusammen auf ihr. Der Wald hinter euch scheint dichter als zuvor. Der Rückweg ist sichtbar, aber er fühlt sich komisch an. Etwas ist dort. Etwas lauert in der Dunkelheit.
'),
(2, 'Der Altar', 'Ihr tretet näher, hinaus aus der Dunkelheit und hinein in das Licht. Die Symbole sind
tief eingeritzt, als hätte sie jemand in den Stein gerissen. Moos bedeckt
die Ränder, doch die Vertiefungen sind mit einer dunklen Flüssigkeit befüllt.
Es sieht aus wie getrocknetes Blut.
Als einer von euch noch näher tritt und langsam seine Hand nach den Symbolen
ausstreckt, durchzuckt ihn ein stechender Schmerz. Für einen Moment glaubt
ihr, Stimmen zu hören.
'),
(3, 'Flucht', 'Ihr dreht euch um. Der Weg zurück ist klar erkennbar. Ihr geht. Schritt für Schritt.
	Doch der Wald hat sich verändert. Die Bäume stehen dichter, noch weniger Licht fällt
durch die Baumkronen hinab. Der Nebel wird schwerer. Nach einer Weile des
Bezwingens des Dickichts öffnet sich der Wald erneut. Wieder steht ihr vor einer
Lichtung und wieder steht in ihrer Mitte ein steinerner Altar. Der Wald lässt euch nicht
gehen.
'),
(4, 'Der Ruf', 'Eure Stimme hallt über die Lichtung. Außer einem leichten Knacken und Rascheln
passiert nichts. Vermutlich ein Hase, denkt ihr euch. Dann wird es still. Unheimlich
still. Sekunden vergehen. Dann antwortet etwas. Es ist keine Stimme, sondern ein
tiefes Vibrieren, das durch den Boden in eure Körper fährt. Auf einmal
fliegen Vögel aus den umliegenden Bäumen. Einer von euch zeigt in den Wald. Es
nähert sich etwas, groß, unklar.
Die einsame Lichtung ist nun nicht mehr einsam, irgendwas ist erwacht.
'),
(5, 'Die Beobachtung', 'Ihr bleibt stehen. Der Wind zieht über die Lichtung. Die Schatten verschieben sich.
Einer von euch sieht für einen Wimpernschlag lang eine Gestalt zwischen den
Steinen am anderen Ende der Lichtung, aber keiner kann es bestätigen.
Warten fühlt sich zwar falsch an, aber im Moment haltet ihr es für sicherer als zu
handeln.
'),
(6, '','Der Nebel wird dichter. Der Wald verändert sich nicht sichtbar, aber er fühlt sich anders an. Jeder Schritt wirkt schwerer. Jedes Geräusch hallt länger nach, als es sollte. Ihr seid noch zusammen, aber ihr seid nicht mehr gleich.
Der Wald öffnet sich zu einem schmalen Pfad, der sich teilt.'),
(7, 'Der dunkle Pfad', 'Der Pfad fällt steil ab. Wurzeln ragen aus dem Boden wie Finger. Der Nebel hängt
tief. Plötzlich gibt der Boden unter euch nach. Ein Aufschrei. Einer von euch
verschwindet im Nebel. Ihr könnt einen Atem vernehmen, aber er ist schwach.
'),
(8, 'Hinterherspringen', 'Im Bruchteil einer Sekunde entscheidet ihr euch eurem Gefährten zu folgen
und springt ihm hinterher. Der Nebel verschluckt euch. Der Fall ist kurz, aber
hart. Ihr schlagt auf. Unter euch fühlt ihr Stein, Erde und Knochen.
'),
(9, 'Etwas zum rausziehen nutzen', 'Ihr blickt euch hektisch um. Die Atemzüge im Nebel werden schwächer. Ihr
müsst jetzt handeln.
'),
(10, 'Ein Seil', 'Ihr zieht das Seil hervor. Es ist klamm. Einer von euch knotet ein Ende
um eine Wurzel. Seine Finger zittern durch die Kälte. Das andere
verschwindet im Nebel. Ein Ruck. Dann noch einer. Ihr stemmt euch
dagegen, zieht gemeinsam. Als eure Kraft auszugehen erscheint, seht
ihr ihn. Ihr zieht euren  Gefährten nach oben. Er liegt auf dem Boden.
Keuchend. Zitternd. Ihr erkennt Blut. Aber er lebt. Nach einer kurzen
Rast entscheidet ihr, weiter zu gehen. Euer Kamerad stützt sich
schwer auf euch.
'),
(11, 'einen Gürtel ', 'Ihr reißt euch den Gürtel von der Hüfte. Er ist ausgeleiert. Aber er ist besser als nichts. Ihr verknotet ihn hastig. Verlängert ihn mit euren Händen. Der Gürtel verschwindet im Nebel. Unten greift jemand danach. Ein Zug. Der Gürtel spannt sich, schneidet in eure Finger. Er hält. Gerade so. Mit Mühe zieht ihr euren Gefährten nach oben. Er bricht keuchend zusammen. Sein Bein ist verletzt, der Körper zittert. Aber er lebt. Niemand sagt etwas. Ihr geht weiter. Langsam'),
(12, 'ein Ast', 'Ihr brecht einen Ast von einem nahen Baum. Er ist länger, als er aussieht. Doch auch dünner. Ihr stoßt ihn in den Nebel. Euer Gefährte greift danach. Für einen Moment glaubt ihr, es geschafft zu haben. Dann knackt das Holz. Der Ast bricht. Euer Griff löst sich. Ein Schrei hallt kurz auf. Gefolgt von einem dumpfen Aufprall. Danach Stille. Ein schweres Gefühl ist nun euer neuer Begleiter.'),
(13, 'Loslassen', 'Einer von euch greift in den Nebel und kann den Fallenden noch erwischen.
	Eure Blicke treffen sich. Dann senkt sich einer. Die Hände eures Kameradens
	zittern, sie rutschen aus dem Griff. “Bitte…”, dann löst sich der Griff. Der
Nebel verschluckt den lauten Aufprall. Ihr geht weiter. Verfolgt von einer
Entscheidung, die ihr nicht mehr rückgängig machen könnt.
'),
(14, 'Der überwachsene Pfad', 'Der Pfad wird schmaler, aber ruhiger. Moos überwuchert den Boden. Alte Steinreste
ragen zwischen Wurzeln hervor. Der Wald wirkt hier älter, müder. Nach einer Weile
öffnet sich der Weg zu einer kleinen Lichtung. Dort steht eine verfallene Kapelle. Das
Dach ist eingestürzt, Efeu wächst wie schwarze Adern an den Mauern. Vor dem
Gebäude liegt etwas. Bei näherer Betrachtung erkennt ihr einen Körper.
'),
(15, 'Körper untersuchen', 'Ihr tretet näher. Der Körper trägt einfache Kleidung. Kein Wappen, keinen
Schmuck. Die Haut ist kalt, aber noch nicht starr. Die Augen sind geöffnet.
Als einer von euch den Körper berührt, zuckt dieser leicht. Nicht lebendig,
irgendwie anders.
Als ihr euch vom Körper entfernt, fällt euer Blick auf die Außenwand der
Kapelle. Zwischen Moos und bröckelndem Stein ist ein Symbol eingeritzt.
Dasselbe Zeichen wie auf dem Altar der Lichtung, doch es ist nicht alt, nicht
verwittert. Es ist frisch.
'),
(16, 'den Ort ignorieren und weitergehen', 'Ihr geht weiter, ohne euch umzudrehen. Der Körper bleibt liegen, die Augen
		folgen euch nicht. Aber euch begleitet ein Gefühl von Schwere. Der Pfad
wird schmaler. Die Bäume stehen dichter. Als ihr kurz zurückblickt, seht ihr
die Kapelle nicht mehr.
'),
(17, 'Den Toten bestatten', 'hr arbeitet schweigend. Der Boden ist weich, die Erde feucht. Als ihr den
Körper anhebt, fühlt er sich leichter an, als er es sollte. Ihr legt ihn in die Erde.
Ein schlichtes Grab. Als die letzte Handvoll Erde fällt, geht ein leiser
Windstoß durch die Ruine. Als würde etwas zurückkehren wollen. Das
Symbol an der Außenwand scheint dunkler als zuvor.
'),
(18, 'Das Lager', 'Ihr entscheidet euch zu bleiben. Ein kleines Feuer wird entfacht. Es gibt zwar kaum
Wärme, aber sein Licht gibt euch ein Gefühl von Sicherheit. Die Nacht fällt schnell.
In der Nacht bewegt sich etwas außerhalb des Feuerscheins. Zweige knacken. Ein
Schatten huscht zwischen den Bäumen.
'),
(19, 'Jemand geht nachsehen', 'Einer von euch tritt in die Dunkelheit. Das Feuer liegt bald außer Sicht. Dann
ist es still.
'),
(20, 'Alle bleiben am Feuer', 'Ihr rückt enger zusammen. Das Geräusch verschwindet. Keiner von euch
macht diese Nacht ein Auge zu.
'),
(21, 'Feuer löschen und verstecken', 'Das Licht erlischt. Um euch herum taucht alles in Dunkelheit. Ihr könnt eure
eigene Hand vor Augen nicht erkennen. Aber ihr hört etwas. Etwas, das näher kommt. 	Auf einmal ein Schrei. Ihr verliert euch im Wald.'),
(22, 'Das letzte Siegel der Lichtung', 'Der Wald ist still. Zu still. Der Nebel lichtet sich ein letztes Mal. Vor euch eröffnet sich erneut eine Lichtung. Auf den ersten Blick wirkt sie identisch wie bei eurer ersten Begegnung. Aber sie ist es doch nicht. Der Altar hat sich verändert. Er wirkt größer, dunkler. Die Symbole scheinen tiefer im Stein zu liegen. Ihr spürt es alle, dieser Ort lässt euch nicht einfach so gehen. Ihr müsst eine letzte, folgenschwere Entscheidung treffen, wenn ihr hier wieder rauskommen wollt. Der Altar beginnt langsam zu grollen, ihr vermerkt ein Vibrieren. Ihr erkennt: das hier ist kein Opferplatz, es ist ein Siegel. Irgendetwas wird hier verschlossen und es will hinaus. '),
(23, 'Kämpfen', 'Der Boden unter der Lichtung bebt. Der Altar bewegt sich. Langsam. Widerwillig. Als
würde er versuchen, das Folgende zu verhindern. Erde fällt in die Tiefe. Ihr hört das
Knacken von berechnenden Wurzeln. Ein feuchter, modriger Geruch steigt euch in
die Nase. Der Wald hält den Atem an. Etwas erhebt sich aus der Erde. Ihr erkennt
keine klare Form. Es besteht aus zu vielen Gliedmaßen, Gesichtern. Knochen,
Rinde, Stoffreste. Es ist ein Monster. Es ist das, was der Wald behalten hat.
'),
(24, 'gemeinsam angreifen', 'Euer Angriff ist effektiv. Er ist koordiniert. Er fügt dem Wesen
    erheblichen Schaden zu.
'),
(25, 'zurückweichen und Abstand halten', 'Ihr weicht zurück. Schritt für Schritt. Das Wesen richtet sich
    weiter auf. Es nutzt den gewonnenen Raum. Ein langer Arm
 		    schlägt aus dem Nebel hervor.'),
(26, 'Ende 2', 'Nun bist du allein. Allein hast du keine Chance. Du
schließt die Augen. Du akzeptierst dein Schicksal. Der
Wald behält nun auch dich für immer bei sich
'),
(27, 'aufteilen, um es zu verwirren', 'Ihr trennt euch. Der Nebel verschluckt einen von euch fast sofort.
		     Das Wesen reagiert schneller, als ihr dachtet. Es wendet sich
einem von euch zu. Euer, vom Nebel verschluckter Gefährte stirbt. Es herrscht Chaos. Einer von euch ergreift die Chancen. Er landet einen Angriff.
'),
(28, 'Der Bruch des Siegels', 'Das Wesen bricht ein. Es wirkt instabil. Der Boden der Lichtung beginnt
einzustürzen.
'),
(29, 'Die Chance nutzen - Ende 2', 'Mit letzter Kraft zwingt ihr das Wesen zurück in die Tiefe. Der
Altar bricht zusammen. Erde, Stein und Wurzeln stürzten mit ihm in
die Tiefe. Das Wesen verschwindet. Der Wald erhellt sich. Ihr hört
Geräusche. Vögel. Den Wind. Tiere. Der Wald ist befreit.
'),
(30, 'Rückzug - Ende 3', 'hr erkennt, dass ihr es nicht halten könnt. Nicht länger. Nicht so. Ihr
weicht zurück.
Ihr dreht euch um. Zu spät. Das Wesen nutzt euren Rückzug. Der Boden unter euch gibt nach. Einer von euch verschwindet. Dann noch einer.  Die Ordnung bricht. Rufe überschneiden sich. Niemand versteht sich mehr. Der Wald schließt. Unaufhaltsam. Ihr fallt. Einer nach dem anderen. Dann schließt sich der Boden. Die Lichtung steht still. Der Altar wieder auf ihr. Der Wald hat bekommen, was er wollte.
'),
(31, 'Siegel erneuern', 'Der Wald verlangt keinen Kampf. Er verlangt, dass jemand hier bleibt. Das Siegel
kann nur durch ein Opfer erneuert werden. Nicht als Opfer im Blut, nicht als Strafe.
Als Teil des Verschlusses. Der Wald ist verstummt. Kein Tiergeräusch weit und breit.
Keine Stimmen, kein Drängen. Nur ihr. Der Wald fordert eine Entscheidung ein.
'),
(32, 'Bewusstes Opfer', 'Die Entscheidung ist gefallen. Ein Name wurde häufiger genannt als die
anderen. Der Betroffene nickt langsam. Sein Schicksal wurde ihm eröffnet. Er
tritt an den Altar. Die Symbole glimmen. Als er die Hand auf den Stein legt,
hört das Vibrieren auf. Der Wald atmet aus.
'),
(33, 'Zufallsentscheid', 'Die Stimmen überschneiden sich. Niemand gibt nach. Der Boden unter euch
vibriert stärker. Die Symbole auf dem Altar leuchten auf. Eines davon pulsiert
heller als die anderen. Ein Name formt sich in euren Gedanken. Nicht
gesprochen, nicht gewählt. Bestimmt. Der Betroffene spürt es zuerst. Dann
die anderen. Der Wald hat entschieden.
'),
(34, 'Ende 4', 'Der Zurückbleibende dreht sich noch einmal um. Kein Heldentum. Kein Versprechen.
Nur ein Blick, der lange anhält. Dann löst sich sein Körper langsam im Licht des
Altars auf. Es ist nicht grausam. nicht schmerzhaft. Es wirkt, als würde er in etwas
zurückkehren, das älter ist als er selbst.

Der Altar wird wieder zu Stein. Alt. Rissig. Still. Der Nebel zieht sich zurück. Die
Bäume stehen reglos. Die Lichtung wirkt wieder ganz normal. Niemand sagt etwas.
Niemand bleibt stehen. Als ihr euch entfernt, hört ihr hinter euch ein dumpfes
Geräusch. Nicht laut, als hätte sich etwas endgültig gesetzt. Ihr verlasst den Wald
und ihr wisst: Dieser Ort ist nicht geheilt. Er ist nur wieder verschlossen. Und ihr wart
diejenigen, die entschieden haben, was zwischen ihm und der Welt steht.
'),
(35, 'Flucht', 'Niemand sagt es laut, aber ihr wisst es alle. Ihr wollt gehen, diesem Ort entfliehen.
Der Altar bebt noch immer leicht, doch der Wald hält inne. Als würde er euch
beobachten. Prüfen. Ihr dreht euch um. Und lauft. Zuerst wirkt es wie zuvor. Bäume,
tief hängender Nebel, Kälte. Doch dann wird der Boden fester. Die Luft wärmer. Ihr
hört Vögel. Den Wind. Leben. Die Angst verliert an Gewicht. Vor euch erkennt ihr
eine Gabelung.
'),
(36, 'Nach rechts - Ende 5', 'Ihr brecht aus dem Dickicht. Vor euch liegt freies Land. Ihr könnt den Himmel
wieder sehen. Als ihr euch umdreht, ist der Wald wie jeder andere. Keine
Spur von dem Nebel, der Kälte. Er hat euch gehen lassen. Was auch immer
im Wald war, bleibt im Wald. Ihr seid frei.
'),
(37, 'Nach links - Ende 6', 'Ihr lauft. Doch der Nebel wird wieder dichter. Einer von euch stolpert über
eine der, den Boden durchziehenden, Wurzeln. Als ihr euch nach eurem
Gefährten umdreht, ist er nicht mehr da. Ihr habt nichts gehört. Trotzdem ist
er weg. Ihr wollt zurück zur Lichtung. Aber der Wald hat sich bereits
geschlossen. Ihr rennt. Weiter, immer weiter. Ohne euch umzudrehen. Ihr
erreicht den Waldrand. Ihr habt es geschafft. Ihr seid frei. Aber ihr seid
gezeichnet. Von Opfern. Von Verlust. Vom Wald. Alles, was ihr
zurückgelassen habt, wird der Wald für immer behalten.
');



-- Insert decisions
INSERT INTO decisions (content, hope_value, coming_from, going_to) VALUES
('Den Steinaltar untersuchen', 0, 1, 2),
('Den Rückweg antreten', -10, 1, 3),
('Laut rufen, um Aufmerksamkeit zu erregen', 0, 1, 4),
('Abwarten und die Umgebung beobachten', +5, 1, 5),
('Weitergehen', 0, 2, 6),
('Weitergehen', 0, 3, 6),
('Weitergehen', 0, 4, 6),
('Weitergehen', 0, 5, 6),
('Der dunkle Pfad', 0,6, 7),
('Der überwachsene Pfad', 0, 6, 14),
('Hierbleiben und ein Lager errichten', 0, 6, 18),
('Hinterherspringen', -10, 7, 8),
('Etwas zum rausziehen nutzen', 0, 7, 9),
('Loslassen', -20, 7, 13),
('Ein Seil', +5, 9, 10),
('Einen Gürtel', 0, 9, 11),
('Ein Ast', -15, 9, 12),
('Körper untersuchen', -10, 14, 15),
('den Ort ignorieren und weitergehen', -10, 14, 16),
('Den Toten bestatten', +10, 14, 17),
('Jemand geht nachsehen', -10, 18, 19),
('Alle bleiben am Feuer', -5, 18, 20),
('Feuer löschen und verstecken', 0, 18, 21),
('Kämpfen', 0, 22, 23),
('Gemeinsam angreifen', +10, 23, 24),
('Zurückweichen und Abstand halten', -15, 23, 25),
('Aufteilen, um es zu verwirren', -20, 23, 27),
('Die Chance nutzen - Ende 2', 0, 28, 29),
('Rückzug - Ende 3', 0, 28, 30),
('Siegel erneuern', 0, 22, 31),
('Bewusstes Opfer', 0, 31, 32),
('Zufallsentscheid', 0, 31, 33),
('Ende 4', 0, 32, 34),
('Versuchen zu fliehen', 0, 22, 35),
('Nach rechts - Ende 5', 0, 35, 36),
('Nach links - Ende 6', 0, 35, 37);


-- Insert stories
INSERT INTO stories (id, title, description, lobby_id, start_story_node_id) VALUES
(1,'Der Wald','Ein düsteres kooperatives Textadventure über Hoffnung, Opfer und Entscheidungen.',null, 1),
(2, 'Das Siegel', 'Eine vergessene Macht regt sich, und jede Entscheidung hat ihren Preis.', null, 2),
(3, 'Der Bruch', 'Wenn das Verborgene erwacht und der Wald seine letzte Wahrheit offenbart.', null, 3);