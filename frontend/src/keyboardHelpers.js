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
			handleKeyEscape(e);
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
		if(e.key=='/'){ //arrowDown
			handleKeySlash(e);
		}
		if(e.key=='z' && e.ctrlKey){
			revertHistory();
		}
		if(e.key=='b' && e.ctrlKey) {
			setBold(e);
		}
		if(e.key=='i' && e.ctrlKey) {
			setItalic(e);
		}
		if(e.key=='[') {
			addLetter(']');
			if(prevCharacter('[') && nextCharacter(']')) {
				createMenuReference();
			}
		}
		if(e.key=='(') {
			addLetter(')');
		}
		if(e.key=='{') {
			addLetter('}');
		}
	});
});

window.handleKeyEscape = function(e) {
	if(window.hasMenu()) {
		window.destroyMenu();
		e.preventDefault();
	} else {
		removeTextareas();
	}
}

window.handleKeySlash = function(e) {
	createMenuDefault();
}

window.handleKeyArrowUp = function(e){
	if(window.hasMenu()) {
		window.prevItemSelectedMenu();
		e.preventDefault();
		return;
	}

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
	if(window.hasMenu()) {
		window.nextItemSelectedMenu();
		e.preventDefault();
		return;
	}

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

// window.handleKeyEnter = function(e){
// 	e.preventDefault();
// 	if(window.hasMenu()) {
// 		window.callSelectItemMenu();
// 		return;
// 	}
// 	var textarea = e.target;
// 	var block = textarea.closest('[data-block]');
// 	var text = textarea.value;

// 	var li = document.createElement('li');
// 	li.setAttribute('data-block','');
// 	li.setAttribute('data-temp-id',getTempId());
// 	var p = document.createElement('p');
// 	p.innerHTML = unmarked(text.substr(0,textarea.selectionStart));
// 	li.appendChild(p);

// 	block.parentNode.insertBefore(li,block);

// 	textarea.value = text.substr(textarea.selectionEnd);
// 	textarea.selectionStart = 0;
// 	textarea.selectionEnd = 0;
// }

// window.handleKeyCtrlEnter = function(e){
// 	e.preventDefault();
// 	var textarea = e.target;
// 	setTodo(textarea);
// 	setInputHeight(textarea);
// }

// window.handleKeyBackspace = function(e){
// 	var textarea = e.target;
// 	if(textarea.selectionStart == 0 && textarea.selectionEnd==0) {
// 		var block = textarea.closest('[data-block]');
// 		//get previous
// 		var prevBlock = getPrevBlock(block);
// 		if(!prevBlock) return;

// 		e.preventDefault();

// 		const prevText = unmarked(prevBlock.querySelector('p').innerHTML);
// 		const p = prevBlock.querySelector('p');


// 		const newTextarea = document.createElement('textarea');
// 		newTextarea.value = prevText + textarea.value;
// 		prevBlock.insertBefore(newTextarea, p);
// 		newTextarea.focus();
// 		newTextarea.selectionStart = prevText.length;
// 		newTextarea.selectionEnd = prevText.length;
// 		setInputHeight(newTextarea);

// 		const childrensCurrentBlock = getChildrens(block);

// 		if(childrensCurrentBlock) {
// 			let ul = prevBlock.querySelector("ul");
// 			if(ul) {
// 				ul.innerHTML = ul.innerHTML + childrensCurrentBlock;
// 			} else {
// 				ul = document.createElement('ul');
// 				ul.innerHTML = childrensCurrentBlock;
// 				prevBlock.appendChild(ul);

// 			}
// 		}

// 		block.parentNode.removeChild(block);


// 		return;
// 		//delete current block

// 	}
// }



// window.handleKeyDelete = function(e){
// 	var textarea = e.target;
// 	if(textarea.selectionStart == textarea.value.length && textarea.selectionEnd==textarea.value.length) {
// 		var block = textarea.closest('[data-block]');
// 		var text = textarea.value;

// 		//get next block
// 		var nextBlock = getNextBlock(block);
// 		if(!nextBlock) return;

// 		e.preventDefault();


// 		//if next block is a child, grab its text and merge with current block
// 		if(nextBlock == block.querySelector('[data-block]')){
// 			const childrensNextBlock = getChildrens(nextBlock);
// 			var nextvalue = unmarked(nextBlock.querySelector('p').innerHTML);
// 			nextBlock.parentNode.removeChild(nextBlock);
// 			textarea.value += nextvalue;
// 			if(childrensNextBlock) {
// 				block.querySelector("ul").innerHTML = childrensNextBlock + block.querySelector("ul").innerHTML;
// 			}
// 			setInputHeight(textarea);
// 		} else {
// 			block.parentNode.removeChild(block);
// 			editBlock(nextBlock);
// 			textarea = $('textarea');
// 			textarea.value = text + textarea.value;
// 		}
// 		textarea.selectionStart = text.length;
// 		textarea.selectionEnd = text.length;

// 	}
}



// window.handleTab = function(e){
// 	e.preventDefault();
// 	var textarea = e.target;
// 	var block = textarea.closest('[data-block]');

// 	//get prev
// 	var prevBlock = block.previousSibling;
// 	if(!prevBlock) return;

// 	var ul = prevBlock.querySelector('ul');
// 	if(!ul){
// 		ul = document.createElement('ul');
// 		prevBlock.appendChild(ul);
// 	}

// 	block.parentNode.removeChild(block);

// 	ul.appendChild(block);
// 	$('textarea').focus();

// }



// window.handleShiftTab = function(e){
// 	e.preventDefault();
// 	var textarea = e.target;
// 	var block = textarea.closest('[data-block]');

// 	var ul = block.parentNode;
// 	if(ul.tagName!='UL') return;

// 	var parentBlock = ul.closest('[data-block]');

// 	var reference = parentBlock.nextSibling;

// 	ul.removeChild(block);
// 	if(ul.querySelectorAll('li').length==0){
// 		parentBlock.removeChild(ul);
// 	}

// 	if(reference){
// 		parentBlock.parentNode.insertBefore(block,reference);
// 	} else {
// 		parentBlock.parentNode.appendChild(block);
// 	}
// 	$('textarea').focus();
// }
