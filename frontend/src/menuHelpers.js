
window.defaultListMenu = [
	{ text: 'Todo', function: (e) => { insertTodo() }},
	{ text: 'Current Date', function: () => { insertCurrentDate() }},
	{ text: 'Current Time', function: () => { insertCurrentTime() }},
	{ text: 'Date Picker', function: () => { alert('"Date Picker" is undeveloped'); }},
	{ text: 'Make a Reference', function: () => { alert('"Make a Reference" is undeveloped'); }},
	{ text: 'Bold', function: () => { insertBold() }},
	{ text: 'Italic', function: () => { insertItalic(); }},
	{ text: 'Strikeout', function: () => { insertStrikeout() }},
];

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

window.updateMenu = function(list) {
	window.resetMenu();

	list.forEach(item => {
		let itemElement = document.createElement('div');
		itemElement.classList.add('item');
		itemElement.innerHTML = item.text;
		itemElement.onclick = () => {
			item.function();
			destroyMenu();
		}
		menuElement.appendChild(itemElement);
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
}

window.destroyMenu = function() {
	$$('.menu-context').forEach(element => {
		element.remove();
	});
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
	const selectedIndex = (Array.from(selectedElement.parentNode.children).indexOf(selectedElement) + 1);
	let futureIndex = selectedIndex + change;
	if(itemsElements.length < futureIndex) {
		futureIndex = 1;
		console.log('More then '+itemsElements.length);
	} else if(futureIndex < 1) {
		futureIndex = itemsElements.length;
		console.log('Lest then zero');
	}
	selectedElement.classList.remove('selected');
	console.log({futureIndex, selectedIndex, length: itemsElements.length});
	window.menuElement.querySelector(`.item:nth-child(${futureIndex})`).classList.add('selected');
}

window.callSelectItemMenu = function() {
	menuElement.querySelector('.selected').onclick();
}

window.insertTodo = function(){
	const textarea = $('textarea');
	const selectionStart = textarea.selectionStart;
	const prepend = '[[TODO]] ';
	textarea.value = prepend + textarea.value
	textarea.selectionStart = textarea.selectionEnd = selectionStart + prepend.length;
	removeSlash();
	setInputHeight(textarea);
}

window.removeSlash = function(){
	const textarea = $('textarea');
	if(textarea.value[textarea.selectionStart-1]=='/'){
		const selectionStart = textarea.selectionStart;
		textarea.value = textarea.value.substring(0,textarea.selectionStart-1)+textarea.value.substring(textarea.selectionStart);
		textarea.selectionStart = textarea.selectionEnd = selectionStart-1;
	}
}

window.insertCurrentDate = function(){
	const textarea = $('textarea');
	const date = new Date();
	const year = date.getFullYear();
	const month = ('0'+(date.getMonth()+1)).substr(-2);
	const day = ('0'+(date.getDate())).substr(-2);
	const dateStr = `[[${year}-${month}-${day}]]`;
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart-1) + dateStr + textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart + dateStr.length -1;
	setInputHeight(textarea);
}

window.insertCurrentTime = function(){
	const textarea = $('textarea');
	const date = new Date();
	const hours = ('0'+(date.getHours()+1)).substr(-2);
	const minutes = ('0'+(date.getMinutes()+1)).substr(-2);
	const timeStr = `${hours}:${minutes}`;
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart-1) + timeStr + textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart + timeStr.length -1;
	setInputHeight(textarea);
}

window.insertBold = function(){
	const textarea = $('textarea');
	const append = '****';
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart-1) + append + textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
	setInputHeight(textarea);
}

window.insertItalic = function(){
	const textarea = $('textarea');
	const append = '**';
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart-1) + append + textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart;
	setInputHeight(textarea);
}

window.insertStrikeout = function(){
	const textarea = $('textarea');
	const append = '~~~~';
	const selectionStart = textarea.selectionStart;
	textarea.value = textarea.value.substring(0,selectionStart-1) + append + textarea.value.substring(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
	setInputHeight(textarea);
}
