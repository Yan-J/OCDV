// WebTrends SmartSource Data Collector Tag v10.4.1
// Copyright (c) 2014 Webtrends Inc.  All rights reserved.
// Tag Builder Version: 4.1.3.2
// Created: 2014.03.27
var prod_host = new RegExp("nyc.gov");
var test_host = new RegExp("nyc-tst-web");
var on_nyc_gov = prod_host.test(window.location);
var on_test_nyc_gov = test_host.test(window.location);

window.webtrendsAsyncInit=function(){
		
	
	//set default dcs & domain values
	var dcsid_val = "abcdefghijklmnopqrstuvwxyz0123";
	var domain_val = "abcd.efg.hij";
	var onsitedoms_val = "blah";
	var fpcdom_val = ".blah";
	
	//check what host we're on and use appropriate dcsid & domain info
	if (on_nyc_gov) {
		dcsid_val = "dcskn76ek00000w84iufi6inj_8l5g";
		domain_val = "statse.webtrendslive.com";
		onsitedoms_val = "nyc.gov";
		fpcdom_val = ".nyc.gov";
	} else if (on_test_nyc_gov) {
		dcsid_val = "dcs8yztfg00000ctyf6nu1whn_5o2z";
		domain_val = "statse.webtrendslive.com";
		onsitedoms_val = "csc.nycnet";
		fpcdom_val = ".csc.nycnet";
	}
	var dcsParam=getParam('portalDcsid');
	if(dcsParam.length>0){
		dcsid_val=dcsParam;
	}
	
    var dcs=new Webtrends.dcs().init({
        dcsid:dcsid_val,
        domain:domain_val,
        timezone:-5,
        i18n:true,
        offsite:true,
        download:true,
        downloadtypes:"xls,doc,pdf,txt,csv,zip,docx,xlsx,rar,gzip,3gp,arc,arj,asf,asx,edp,eps,flv,gz,ics,m3u,m4r,m4v,mov,mp3,mp4,mpeg,mpg,potx,ppam,ppsm,ppsx,ppt,pptm,pptx,psd,ram,rss,sit,tar,tif,vcf,vcs,wav,wma,wmv,xlsm,xml,z",
        anchor:true,
        javascript: true,
        onsitedoms:onsitedoms_val,
        fpcdom:fpcdom_val,
        plugins:{
            	hm:{src:"//s.webtrends.com/js/webtrends.hm.js"},
		nycgov:{src:"/assets/home/js/webtrends/webtrends.nycgov.js"}
        }
        });
		
	dcs.track();
};
(function(){
    var s=document.createElement("script"); s.async=true; s.src="/assets/home/js/webtrends/webtrends.min.js";    
    var s2=document.getElementsByTagName("script")[0]; s2.parentNode.insertBefore(s,s2);
}());

function getParam(theName){
	theName = theName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+theName+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if(results != null){
		return results[1];
	}
	return("");
}