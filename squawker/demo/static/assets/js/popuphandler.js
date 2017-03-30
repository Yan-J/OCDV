//User-Defined Settings

var config = {
    'Overlay Background-Color' : 'rgba(0, 0, 0, .65)',
    'Overlay Z-Index' : '99',
    'Content Color' : '#777',
    'Content Width' : '300', //In Pixels Only.
	'Content Height' : '200', //In Pixels Only.
	'Content Padding' : '1em',
	'Content Background-Color' : 'rgba(255, 255, 255, 0.85)',
	'Content Z-Index' : '100',
	'Popup Timeout' : '15000' //In Milliseconds
};











//Calculate Margin
if (config['Content Width'] == NaN){
	alert("The 'Content Width' configuration is not set as a number. Please be sure that the configuration does not include 'px', the units are set automatically");
	throw new Error('Content Width NaN, Abort');
}
if (config['Content Height'] == NaN){
	alert("The 'Content Height' configuration is not set as a number. Please be sure that the configuration does not include 'px', the units are set automatically");
	throw new Error('Content Height NaN, Abort');
}
else{
	var contentWidth = config['Content Width'];
	var contentHeight = config['Content Height'];
	config['Content Width'] = config['Content Width'] + 'px';
	config['Content Height'] = config['Content Height'] + 'px';
};

var calculatedMarginTop = contentHeight / (-2);
var calculatedMarginLeft = contentWidth / (-2);
var calculatedMargin = calculatedMarginTop + 'px 0 0 ' + calculatedMarginLeft + 'px';

//Define Popup Class on Ready
$(function(){
	//Box-Sizing Fix
	$('*').css('box-sizing','border-box');
	
	//Parent of Overlay
	$('.popup').parent().css('position','relative');
	$('.popup').parent().css('box-sizing','border-box');
	
	//Overlay CSS
	$('.popup').css('display','none');
	$('.popup').css('position','absolute');
	$('.popup').css('top','0px');
	$('.popup').css('bottom','0px');
	$('.popup').css('left','0px');
	$('.popup').css('width','100%');
	$('.popup').css('background',config['Overlay Background-Color']);
	$('.popup').css('z-index',config['Overlay Z-Index']);
	
	//Content CSS
	$('.popup').children().css('display','none');
	$('.popup').children().css('color',config['Content Color']);
	$('.popup').children().css('text-align','center');
	$('.popup').children().css('width',config['Content Width']);
	$('.popup').children().css('height',config['Content Height']);
	$('.popup').children().css('position','absolute');
	$('.popup').children().css('left','50%');
	$('.popup').children().css('top','50%');
	$('.popup').children().css('margin', calculatedMargin);
	$('.popup').children().css('z-index',config['Content Z-Index']);
	$('.popup').children().css('background',config['Content Background-Color']);
	$('.popup').children().css('padding',config['Content Padding']);
	$('.popup').children().css('-webkit-touch-callout','none');
	$('.popup').children().css('-webkit-user-select','none');
	$('.popup').children().css('-khtml-user-select','none');
	$('.popup').children().css('-moz-user-select','none');
	$('.popup').children().css('-ms-user-select','none');
	$('.popup').children().css('-user-select','none');
});

//Define function for the Popup Handler
function popupHandler(e){
	if ($(e).attr('data-location') != "sibling" && $(e).attr('data-location') != "child"){
		alert("The 'data-location' Attribute is not properly set. Please make sure it is set to an acceptable value and try again.");
		return;
	}
	else if($(e).attr('data-location') == 'sibling'){
		$(e).siblings('.popup').fadeIn(1000);
		$(e).siblings('.popup').children().fadeIn(1000);
		
		if ($(e).attr('data-null') !== 'timer' && $(e).attr('data-null') !== 'both'){
			var popupTimeout = setTimeout(function() {
				$(e).siblings('.popup').fadeOut(1000);
				$(e).siblings('.popup').children().fadeOut(1000);
				
				return;
			}, config['Popup Timeout']);
		}
		if ($(e).attr('data-null') !== 'click' && $(e).attr('data-null') !== 'both'){
			$(e).siblings('.popup').click(function() {
				$(e).siblings('.popup').fadeOut(1000);
				$(e).siblings('.popup').children().fadeOut(1000);
				clearTimeout(popupTimeout);
				
				return;
			});
		}
	}
	else if($(e).attr('data-location') == 'child'){
		if ($(e).children('.popup').is(':visible') == false){
			$(e).children('.popup').fadeIn(1000);
			$(e).children('.popup').children().fadeIn(1000);
		}
		if ($(e).attr('data-null') !== 'timer' && $(e).attr('data-null') !== 'both'){
			var popupTimeout = setTimeout(function() {
				$(e).children('.popup').fadeOut(1000);
				$(e).children('.popup').children().fadeOut(1000);
				
				return;
			}, config['Popup Timeout']);
		}
		if ($(e).attr('data-null') !== 'click' && $(e).attr('data-null') !== 'both'){
			$(e).children('.popup').click(function() {
				$(e).children('.popup').fadeOut(1000);
				$(e).children('.popup').children().fadeOut(1000);
				clearTimeout(popupTimeout);
				
				return;
			});
		}
	}
}

function popupClose(e){
	$(e).fadeOut(1000);
	$(e).children().fadeOut(1000);
}