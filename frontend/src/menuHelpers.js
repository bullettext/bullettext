import store from '@/store';

window.defaultListMenu = [
	{ text: 'Todo', function: (e) => { insertTodo() }},
	{ text: 'Current Date', function: () => { insertCurrentDate() }},
	{ text: 'Current Time', function: () => { insertCurrentTime() }},
	{ text: 'Date Picker', function: () => { alert('"Date Picker" is undeveloped'); }},
	{ text: 'Make a Reference', function: () => { createMenuReference(); }},
	{ text: 'Bold', function: () => { setBold() }},
	{ text: 'Italic', function: () => { setItalic(); }},
	{ text: 'Strikeout', function: () => { setStrikeout() }},
];
window.functionsList = null;

window.menuElement = null;

window.createMenu = function() {
	destroyMenu();
	let menu = document.createElement('div');
	menu.classList.add('menu-context');
	const positions = getCarretPositonByWindow();
	menu.style.top = `${positions.y}px`;
	menu.style.left = `${positions.x}px`;
	document.body.appendChild(menu);
	window.menuElement = menu;
}

window.createMenuDefault = function() {
	createMenu();
	updateMenu(defaultListMenu);
	changeItemSelectedMenu();
}

window.createMenuReference = function() {
	createMenu();
	let listNotes = [ ];
	store.state.notes.forEach(note=>{
		listNotes.push({
			text: note.name,
			function: () => {
				const textarea = $('textarea');
				const selectionStart = textarea.selectionStart;
				let context = textarea.value.substring(selectionStart-2,selectionStart+2);
				let str = `${note.name}`;
				if(context != '[[]]') {
					str = `[[${note.name}]]`;
				}
				insertText(str);
			}
		});
	});
	updateMenu(listNotes);
	changeItemSelectedMenu();
}

window.updateMenu = function(list, reset) {
	reset = reset || true;
	if(reset) window.resetMenu();

	list.forEach((item, index) => {
		let itemElement = document.createElement('div');
		itemElement.classList.add('item');
		itemElement.innerHTML = item.text;
		itemElement.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			clickItemMenu(index);
		}
		menuElement.appendChild(itemElement);
		functionsList[functionsList.length] = {
			function: () => {
				removeSlash();
				destroyMenu();
				item.function();
			}
		};
	});
}

window.hasMenu = function() {
	if(window.menuElement === null) {
		return false
	} else {
		return true;
	}
}

window.resetMenu = function() {
	menuElement.innerHTML = '';
	functionsList = [];
}

window.destroyMenu = function() {
	$$('.menu-context').forEach(element => {
		element.remove();
	});
	removeSlash();
	window.menuElement = null;
}

window.nextItemSelectedMenu = function() {
	changeItemSelectedMenu(+1);
}

window.prevItemSelectedMenu = function() {
	changeItemSelectedMenu(-1);
}

window.changeItemSelectedMenu = function(change) {
  const selectedElement = window.menuElement.querySelector('.selected');
	if(selectedElement == null) {
		window.menuElement.querySelector('.item').classList.add('selected');
		return;
	}
	const itemsElements = window.menuElement.querySelectorAll('.item');
	const selectedIndex = getIndexOfElement(selectedElement);
	let futureIndex = selectedIndex + change;
	if(itemsElements.length < futureIndex) {
		futureIndex = 1;
	} else if(futureIndex < 1) {
		futureIndex = itemsElements.length;
	}
	selectedElement.classList.remove('selected');
	window.menuElement.querySelector(`.item:nth-child(${futureIndex})`).classList.add('selected');
}

window.clickItemMenu = function(index) {
	functionsList[index].function();
}

window.callSelectItemMenu = function() {
	let index = getIndexOfElement(menuElement.querySelector('.selected')) -1;
	functionsList[index].function();
}

window.insertTodo = function() {
	const textarea = getTextarea();
	setTodo(textarea);
	removeSlash();
	setInputHeight(textarea);
}

window.removeSlash = function() {
	const textarea = getTextarea();
	if(textarea.value[textarea.selectionStart-1]=='/'){
		const selectionStart = textarea.selectionStart;
		textarea.value = textarea.value.substring(0,textarea.selectionStart-1)+textarea.value.substring(textarea.selectionStart);
		textarea.selectionStart = textarea.selectionEnd = selectionStart-1;
	}
}

// window.insertCurrentDate = function() {
// 	const date = new Date();
// 	const year = date.getFullYear();
// 	const month = ('0'+(date.getMonth()+1)).substr(-2);
// 	const day = ('0'+(date.getDate())).substr(-2);
// 	const dateStr = `[[${year}-${month}-${day}]]`;
// 	insertText(dateStr);
// }

// window.insertCurrentTime = function() {
// 	const date = new Date();
// 	const hours = ('0'+(date.getHours()+1)).substr(-2);
// 	const minutes = ('0'+(date.getMinutes()+1)).substr(-2);
// 	const timeStr = `${hours}:${minutes}`;
// 	insertText(timeStr);
// }

window.getIndexOfElement = function(element) {
	return (Array.from(element.parentNode.children).indexOf(element) + 1);
}

// window.insertText = function(text) {
// 	const textarea = getTextarea();
// 	const selectionStart = textarea.selectionStart;
// 	textarea.value = textarea.value.substring(0,selectionStart) + text + textarea.value.substring(selectionStart);
// 	textarea.selectionStart = textarea.selectionEnd = selectionStart + text.length;
// }

window.getTextarea = function() {
	const textarea = $('textarea');
	if(textarea == null) {
		console.error('Textarea not found');
	}
	return textarea;
}
