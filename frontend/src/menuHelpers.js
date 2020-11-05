
window.defaultListMenu = [
	{ text: 'Todo', function: () => { alert('"Todo" is undeveloped'); }},
	{ text: 'Date Picker', function: () => { alert('"Date Picker" is undeveloped'); }},
	{ text: 'Time Picker', function: () => { alert('"Time Picker" is undeveloped'); }},
	{ text: 'Make a Reference', function: () => { alert('"Make a Reference" is undeveloped'); }},
	{ text: 'Underline', function: () => { alert('"Underline" is undeveloped'); }},
	{ text: 'Strikeout', function: () => { alert('"Strikeout" is undeveloped'); }},
	{ text: 'Italic', function: () => { alert('"Italic" is undeveloped'); }}
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
