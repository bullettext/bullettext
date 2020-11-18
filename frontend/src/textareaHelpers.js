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

window.addLetter = function(letter) {
	const textarea = $('textarea');
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart) +
		letter +
		textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart;
	setInputHeight(textarea);
}

window.prevCharacter = function(letter) {
	const textarea = $('textarea');
	const selectionStart = textarea.selectionStart;
	let prevCharacter = textarea.value.substring(selectionStart-1,selectionStart);
	return letter == prevCharacter;
}
window.nextCharacter = function(letter) {
	const textarea = $('textarea');
	const selectionEnd = textarea.selectionEnd;
	let nextCharacter = textarea.value.substring(selectionEnd,selectionEnd+1);
	return letter == nextCharacter;
}

window.setTextFormat = function(append, event) {
	const textarea = $('textarea');
	const selectionStart = textarea.selectionStart;
	const selectionEnd = textarea.selectionEnd;
	const sizeAppend = append.length;
	textarea.value = textarea.value.substring(0,selectionStart) + append + textarea.value.substring(selectionStart);
	textarea.value = textarea.value.substring(0,selectionEnd+sizeAppend) + append + textarea.value.substring(selectionEnd+sizeAppend);
	textarea.selectionStart = selectionStart + sizeAppend;
	textarea.selectionEnd = selectionEnd + sizeAppend;
	setInputHeight(textarea);
	if(event) event.preventDefault();
}

window.setBold = function(event) {
	setTextFormat('**', event);
}

window.setItalic = function(event) {
	setTextFormat('*', event);
}

window.setStrikeout = function(event) {
	setTextFormat('~~', event);
}

window.setTodo = function(textareaDom) {
	var text = textareaDom.value;

	if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
		text = "[[TODO]] " + text;
	} else if (text.match(/^\[\[TODO\]\]/)) {
		text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
	} else if (text.match(/^\[\[DONE\]\]/)) {
		text = text.replace(/^\[\[DONE\]\] */, "");
	}

	textareaDom.value = text;
}
