function initShareLinks(){
	/*$(".twitter_custom").each(function(){
		var theElement=this;
		$.getJSON("http://api.bitly.com/v3/shorten?callback=?", 
		    { 
		        "format": "json",
		        "apiKey": "R_aea227023758e19eebb7d4887d7bf2c5",
		        "login": "nycgov",
		        "longUrl": $(this).data().url
		    },
		    function(response){
		        var shortUrl=response.data.url;
		        var twitterDescription=$(theElement).data().title.trim();
		        if(twitterDescription.length>140-(shortUrl.length+13)){
		        	twitterDescription=twitterDescription.substring(0, 140-shortUrl.length-16).split(" ").slice(0, -1).join(" ");
		        	twitterDescription=twitterDescription + " ...";
	        	}
	        	twitterDescription=twitterDescription+" "+shortUrl;
				$(theElement).parent("a").attr("href", "http://twitter.com/home?status="+twitterDescription+" via @nycgov");
	    	});
	});*/
	$(".twitter_custom").each(function(){
        var twitterDescription=$(this).data().title.trim();
        if(twitterDescription.length>117){
        	twitterDescription=twitterDescription.substring(0, 113).split(" ").slice(0, -1).join(" ");
        	twitterDescription=twitterDescription + " ...";
    	}
		$(this).parent("a").attr("href", "http://twitter.com/home?status="+twitterDescription+" "+$(this).data().url+" via @nycgov");
	});
	$(".facebook_custom").each(function(){
		if($("meta[property='og:title']")){
			$(this).parent("a").attr("href","https://www.facebook.com/sharer/sharer.php?u="+$(this).data().url);
		}else{
			$(this).parent("a").attr("href","http://www.facebook.com/sharer/sharer.php?s=100&p[url]="+$(this).data().url+"&p[title]="+$(this).data().title);
		}
	});
	$(".googleplus_custom").each(function(){
		$(this).parent("a").attr("href","https://plus.google.com/share?url="+encodeURIComponent($(this).data().url));
	});
	$(".tumblr_custom").each(function(){
		$(this).parent("a").attr("href","http://www.tumblr.com/share/link?url="+encodeURIComponent($(this).data().url)+"&name="+encodeURIComponent($(this).data().title)+"&description=via NYC.gov");
	});
	$(".email_custom").each(function(){
		$(this).parent("a").attr("href","mailto:?subject=" + encodeURIComponent($(this).data().title)+"&body=" + encodeURIComponent($(this).data().url));
	});
}
function addLoadEvent(func) { 
	var oldonload = window.onload; 
	if (typeof window.onload != 'function') { 
		window.onload = func; 
	} else { 
		window.onload = function() { 
			if (oldonload) { 
				oldonload(); 
			} 
			func(); 
		} 
	} 
} 
addLoadEvent(initShareLinks);