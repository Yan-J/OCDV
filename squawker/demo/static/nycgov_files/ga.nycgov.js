var _gaq = _gaq || [];

//not in use
//determine where we are and send request using appropriate id
/* var hostname = new RegExp("dev-web");
var on_nyc_gov = hostname.test(window.location);
if (on_nyc_gov) {
	_gaq.push(['_setAccount', 'xxxxx']);	
} else {
	_gaq.push(['_setAccount', 'yyyyy']);
} */	

_gaq.push(['_setAccount', 'UA-44670436-1']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; 
ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 
'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; 
s.parentNode.insertBefore(ga, s);
})();
