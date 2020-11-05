document.addEventListener("DOMContentLoaded", function() {


	document.addEventListener('input',function(e){
		if(!e.target.matches('textarea')) return;
		setInputHeight(e.target);
	});
});

window.setInputHeight = function(el){

	el.style.height = "1.5em";
	var textareaHeight = el.scrollHeight;

	el.style.height = textareaHeight + "px";
}


window.removeTextareas = function(){
	$$('textarea').forEach(textarea=>{
		var p = textarea.nextSibling;
		if(p && p.tagName=='P'){
			p.innerHTML = marked(textarea.value);
			textarea.parentNode.removeChild(textarea);
		}
	});
}



window.getSelectionEnd = function(textareaDom,x,y){
	var originalText = textareaDom.value;
	var text = originalText;

	var span = document.createElement('span');
	span.className = 'calculate';
	span.style.width = textareaDom.offsetWidth+'px';

	var inner = document.createTextNode(text);
	span.appendChild(inner);

	var carret = document.createElement('span');
	carret.id = 'carret';
	span.appendChild(carret);

	document.body.appendChild(span);

	console.time('loopx');
	while(carret.offsetLeft>x){
		text = originalText.substr(0,text.length-1);
		inner.textContent = text;
	}
	console.timeEnd('loopx');

	$$('.calculate').forEach(span=>{
		span.parentNode.removeChild(span);
	})
	return text.length;
}

window.getSelectionStart = function(textareaDom,x){

	var originalText = textareaDom.value;
	var text = '';

	var span = document.createElement('span');
	span.className = 'calculate';
	span.style.width = textareaDom.offsetWidth+'px';

	var inner = document.createTextNode(text);
	span.appendChild(inner);

	var carret = document.createElement('span');
	carret.id = 'carret';
	span.appendChild(carret);

	document.body.appendChild(span);

	while(carret.offsetLeft<x){
		text = originalText.substr(0,text.length+1);
		inner.textContent = text;
		if(originalText.length==text.length) break;
	}
	text = originalText.substr(0,text.length-1);

	$$('.calculate').forEach(span=>{
		span.parentNode.removeChild(span);
	})
	return text.length;

}
window.getCarretPositonByWindow = function() {
	const positions = getCarretPosition();
	const textareaDom = $('textarea');
	return {
		x: positions.x + textareaDom.getBoundingClientRect().x,
		y: positions.y + textareaDom.getBoundingClientRect().y
	}
}

window.getCarretPosition = function(){
	var textareaDom = $('textarea');
	var span = document.createElement('span');
	span.className = 'calculate';
	var text = textareaDom.value.substr(0,textareaDom.selectionStart);
	span.innerHTML = text + '<span id="carret"></span>';
	span.style.width = textareaDom.offsetWidth+'px';

	document.body.appendChild(span);

	var carret = span.querySelector('#carret');
	var ret = {
		x:carret.offsetLeft+4,
		y:carret.offsetTop,
	}

	$$('.calculate').forEach(span=>{
		span.parentNode.removeChild(span);
	})

	return ret;
}

window.isFirstLine = function(textareaDom){
	var pos = getCarretPosition();

	console.log('getCarretPosition first line',pos);

	return pos.y==0;
}

window.isLastLine = function(textareaDom){

	var span = document.createElement('span');
	span.className = 'calculate';
	span.style.width = textareaDom.offsetWidth+'px';
	span.innerHTML = textareaDom.value + '<span id="carret"></span>';

	document.body.appendChild(span);
	var carret = span.querySelector('#carret');
	var ret = {
		x:carret.offsetLeft,
		y:carret.offsetTop,
	}

	var pos = getCarretPosition();

	console.log('getCarretPosition last line',pos,ret);

	return pos.y == ret.y;
}
