import store from '@/store';


window.isSearchMenuOpen = false;

window.handleSearch = function(term){
	//console.log('handleSearche',e);
	console.log('handlesearch',term);
	term = term.toLowerCase().trim();
	let listNotes = [];
	store.state.notes.forEach(note=>{
		if(note.name.toLowerCase().includes(term)){
			listNotes.push(note);
		}
	});

	$('.menu-search').innerHTML = '';
	var ul = document.createElement('ul');
	listNotes.forEach(note=>{
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href',`/${note.slug}`);
		a.innerText = note.name;
		li.appendChild(a);
		ul.appendChild(li);
	})
	$('.menu-search').appendChild(ul);
}

window.openSearchMenu = function(){
	let menu = document.createElement('div');
	menu.classList.add('menu-search');
	$('.global-search').appendChild(menu);
	isSearchMenuOpen = true;
	handleSearch($('.global-search input').value);
}

window.closeSearchMenu = function(){
	console.log('closesarchMenu');
	isSearchMenuOpen = false;
	setTimeout(()=>{
		$('.global-search').removeChild($('.menu-search'))

	},50);
}
