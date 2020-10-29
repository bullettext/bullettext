window.edited = false;
window.timerSave = null;

document.addEventListener("DOMContentLoaded", function() {

	document.addEventListener('keydown',function(e){

		edited = true;
		clearTimeout(timerSave);
		timerSave = setTimeout(()=>{
			if(!edited) return;
			saveAll();
			edited = false;
		},5000);


		console.log(e.key)
		if(e.key=='Escape' && e.target.matches('textarea')){
			removeTextareas();
		}
		if(e.key=='Backspace' && e.target.matches('textarea')){
			handleKeyBackspace(e);
		}
		if(e.key=='Delete' && e.target.matches('textarea')){
			handleKeyDelete(e);
		}
		if(e.key=='Enter' && e.target.matches('textarea') && !e.shiftKey){
			if(e.ctrlKey){
				handleKeyCtrlEnter(e);
			} else {
				handleKeyEnter(e);
			}
		}
		if(e.key=='Tab' && e.target.matches('textarea')){
			if(e.shiftKey){
				handleShiftTab(e);
			} else {
				handleTab(e);
			}
		}

		if(e.key=='ArrowUp' && e.target.matches('textarea')){ //arrowUp
			handleKeyArrowUp(e);
		}
		if(e.key=='ArrowDown' && e.target.matches('textarea')){ //arrowDown
			handleKeyArrowDown(e);

		}
		if(e.key=='z' && e.ctrlKey){
			revertHistory();
		}

	});
});

window.handleKeyArrowUp = function(e){
	if(e.shiftKey && e.altKey){
		var block = e.target.closest('[data-block]');
		var parent = block.parentNode;
		var prev = block.previousSibling;
		if(!prev) return;
		parent.removeChild(block);
		parent.insertBefore(block,prev);
		return editBlock(block);
	}

	if(isFirstLine(e.target)) {
		e.preventDefault();
		selectPrev();
	}
}
window.handleKeyArrowDown = function(e){

	if(e.shiftKey && e.altKey){
		var block = e.target.closest('[data-block]');
		var parent = block.parentNode;
		var next = block.nextSibling;
		if(!next) return;
		parent.removeChild(block);
		var nextNext = next.nextSibling;
		if(nextNext){
			parent.insertBefore(block,nextNext);
		} else {
			parent.appendChild(block);
		}
		return editBlock(block);
	}

	if(isLastLine(e.target)) {
		e.preventDefault();
		selectNext();
	}
}

window.handleKeyEnter = function(e){
	e.preventDefault();
	var textarea = e.target;
	var text = textarea.value;
	textarea.value = text.substr(0,textarea.selectionStart).trim();

	var block = textarea.closest('[data-block]');
	var li = document.createElement('li');
	li.setAttribute('data-block','');
	li.setAttribute('data-temp-id',getTempId());
	var p = document.createElement('p');
	p.innerHTML = marked(text.substr(textarea.selectionEnd).trim());

	li.appendChild(p);
	if(block.nextSibling){
		block.parentNode.insertBefore(li,block.nextSibling);
	} else {
		block.parentNode.appendChild(li);
	}
	editBlock(li);
	var textareaDom = $('textarea');
	textareaDom.selectionStart = 0;
	textareaDom.selectionEnd = 0;
}

window.handleKeyCtrlEnter = function(e){
	e.preventDefault();
	var textarea = e.target;
	var text = textarea.value;

	if (!text.match(/^\[\[(TODO|DONE)\]\]/)) {
		text = "[[TODO]] " + text;
	} else if (text.match(/^\[\[TODO\]\]/)) {
		text = text.replace(/^\[\[TODO\]\]/, "[[DONE]]");
	} else if (text.match(/^\[\[DONE\]\]/)) {
		text = text.replace(/^\[\[DONE\]\] */, "");
	}

	textarea.value = text;
	setInputHeight(textarea);
}

window.handleKeyBackspace = function(e){
	var textarea = e.target;
	if(textarea.selectionStart == 0 && textarea.selectionEnd==0) {
		var block = textarea.closest('[data-block]');

		//grab text,
		var text = textarea.value;

		//get previous
		var prevBlock = getPrevBlock(block);
		if(!prevBlock) return;

		e.preventDefault();

		//delete current block
		block.parentNode.removeChild(block);

		//append text
		editBlock(prevBlock);

		textarea = prevBlock.querySelector('textarea');
		var oldvalue = textarea.value
		textarea.value = oldvalue + text;
		setInputHeight(textarea);

		textarea.selectionStart = oldvalue.length;
		textarea.selectionEnd = oldvalue.length;


	}
}

window.handleKeyDelete = function(e){
	var textarea = e.target;
	if(textarea.selectionStart == textarea.value.length && textarea.selectionEnd==textarea.value.length) {
		var block = textarea.closest('[data-block]');

		//get next block
		var nextBlock = getNextBlock(block);
		if(!nextBlock) return;

		e.preventDefault();

		//grab text,
		var nextvalue = unmarked(nextBlock.querySelector('p').innerHTML);

		//delete next block
		nextBlock.parentNode.removeChild(nextBlock);

		//append text

		var text = textarea.value;
		textarea.value = text + nextvalue;
		setInputHeight(textarea);

		textarea.selectionStart = text.length;
		textarea.selectionEnd = text.length;

	}
}



window.handleTab = function(e){
	e.preventDefault();
	var textarea = e.target;
	var block = textarea.closest('[data-block]');

	//get prev
	var prevBlock = block.previousSibling;
	if(!prevBlock) return;

	var ul = prevBlock.querySelector('ul');
	if(!ul){
		ul = document.createElement('ul');
		prevBlock.appendChild(ul);
	}

	block.parentNode.removeChild(block);

	ul.appendChild(block);
	$('textarea').focus();

}



window.handleShiftTab = function(e){
	e.preventDefault();
	var textarea = e.target;
	var block = textarea.closest('[data-block]');

	var ul = block.parentNode;
	if(ul.tagName!='UL') return;

	var parentBlock = ul.closest('[data-block]');

	var reference = parentBlock.nextSibling;

	ul.removeChild(block);
	if(ul.querySelectorAll('li').length==0){
		parentBlock.removeChild(ul);
	}

	if(reference){
		parentBlock.parentNode.insertBefore(block,reference);
	} else {
		parentBlock.parentNode.appendChild(block);
	}

	$('textarea').focus();


}
