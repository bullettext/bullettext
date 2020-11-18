import axios from "axios";
import store from '@/store';
import Router from '@/router';

var note_id;
var history = [];
var selectedBlock = null;

window.$$ = window.$$ || function(selector, context) {
	context = context || document;
	var elements = context.querySelectorAll(selector);
	return Array.prototype.slice.call(elements);
}
window.$ = window.$ || function(selector, context) {
	context = context || document;
	return context.querySelector(selector);
}

window.addHistory = function(data){
	if(!data) return;

	if(history.length && JSON.stringify(data) == JSON.stringify(history[history.length-1])) return; //same
	history.push(data);
	console.log('history added',data);

	if(history.length>10) {
		history.shift();
	}

}

window.revertHistory = function(){
	var data = history.pop();
	console.log('history data',data);
	if(!data) return;
	hydrate(window.note_id,data);
}


window.getData = function(){


	var textarea = $('textarea');
	if(textarea){
		var p = textarea.nextSibling;
		if(p && p.tagName=='P') p.innerHTML = marked(textarea.value);
	}

	var data = $$('[data-block]').map(block=>{
		var parent = block.parentNode.closest('[data-block]');
		var parent_id = null;
		if(parent){
			parent_id = parent.getAttribute('data-block');
			if(!parent_id) parent_id = parent.getAttribute('data-temp-id');
		}
		return {
			id:block.getAttribute('data-block'),
			parent_id:parent_id,
			order:getBlockOrder(block),
			temp_id:block.getAttribute('data-temp-id'),
			text:unmarked($('p',block).innerHTML),
		}
	});

	return data;

}

document.addEventListener('click',function(e){
	console.log(e.target);
	if(e.target.classList.contains('reference')) {
		console.log('link reference clicked');
		e.preventDefault();
		e.stopPropagation();
		console.log(Router);
		Router.push(e.target.getAttribute('href'));
	} else if(e.target.classList.contains('checkbox')) {
		console.log('checkbox clicked');
		toggleCheckbox(e);
	} else if(e.target.matches('textarea')) {
		console.log('textarea clicked');
		console.log(e);
		e.stopPropagation();
	} else {
		var blockDom = e.target.closest('[data-block]');
		if(!blockDom) return;

		clickedBlock(blockDom,e)
	}
})


window.getTempId = function(){
	if(!window.tempId) window.tempId = new Date().getTime();
	return 'temp-'+(window.tempId++);
}


window.newBlock = function(note_id){
	var li = document.createElement('li');
	li.setAttribute('data-block','');
	li.setAttribute('data-temp-id',getTempId());
	var p = document.createElement('p');
	li.appendChild(p);
	var container = $(`[data-note="${note_id}"] .vanilla`);
	var parent =  $('ul',container);
	if(!parent) {
		var parent = document.createElement('ul');
		container.appendChild(parent);
	}
	parent.appendChild(li);
	editBlock(li);
}

window.clickedBlock = function(block,e){

	var x = e.clientX - e.target.getBoundingClientRect().x;
	var y = e.clientY - e.target.getBoundingClientRect().y;

	var clickPos = window.getSelection().getRangeAt(0).endOffset;
	editBlock(block);

	console.log('clickPos',clickPos);

	var textareaDom = $('textarea');
	textareaDom.focus();
	textareaDom.selectionStart = clickPos;
	textareaDom.selectionEnd = clickPos;

}

window.editBlock = function(block){
	console.log('editBlock');

	selectedBlock = block;

	var p = block.querySelector('p');
	var prev = p.previousSibling;
	if(prev && prev.tagName=='TEXTAREA') return prev.focus();

	removeTextareas()

	var textareaDom = document.createElement('textarea');
	textareaDom.value = unmarked(p.innerHTML);
	block.insertBefore(textareaDom,p);
	textareaDom.focus();
	setInputHeight(textareaDom);

}

window.updateBlocksRefs = function(data){

	for(var temp_id in data){
		var block_id = data[temp_id]
		var block = document.querySelector(`[data-temp-id="${temp_id}"]`);
		if(!block) continue;
		block.removeAttribute('data-temp-id');
		block.setAttribute('data-block',block_id);
	}

}

window.saveAll = function(){

	console.log('saving');

	var note_id = $('[data-note]').getAttribute('data-note');

	var data = getData();
	addHistory(data);

	axios({
			method:'post',
			url:'/api/notes/save-blocks/'+note_id,
			data:data,
	}).then(res=>{
		console.log(res);
			updateBlocksRefs(res.data.temp_ids);
			store.state.notes = [...res.data.new_notes, ...store.state.notes];
	}).catch(res=>{
			console.error('save error');
			console.error(res);
	});
}

window.getBlockOrder = function(block){
	var blocks = $$('[data-block]');
	return blocks.indexOf(block)+1;
}

window.getPrevBlock = function(block){
	if(!block) block = $('textarea').closest('[data-block]');
	var blocks = $$('[data-block]');
	var index = blocks.indexOf(block)
	if(index==0) return;
	return blocks[index-1];
}

window.selectPrev = function(){
	var block = getPrevBlock(block);
	if(!block) return;
	var pos = getCarretPosition();
	editBlock(block);
	var textareaDom = $('textarea');
	var selectionStart = getSelectionEnd(textareaDom,pos.x);
	textareaDom.selectionStart = selectionStart;
	textareaDom.selectionEnd = selectionStart;
}

window.getNextBlock = function(block){
	if(!block) block = $('textarea').closest('[data-block]');
	var blocks = $$('[data-block]');
	var index = blocks.indexOf(block)
	if(index==blocks.length-1) return;
	return blocks[index+1];
}

window.selectNext = function(block){
	var block = getNextBlock(block);
	if(!block) return;
	var pos = getCarretPosition();
	editBlock(block);
	var textareaDom = $('textarea');
	var selectionStart = getSelectionStart(textareaDom,pos.x);
	textareaDom.selectionStart = selectionStart;
	textareaDom.selectionEnd = selectionStart;
}

window.hydrate = function(note_id,data){
	window.note_id = note_id;
	$(`[data-note="${note_id}"] .vanilla`).innerHTML = build_html(data);
}

window.build_html = function(data,parent_id,level) {
	parent_id = parent_id || null;
	level = level || 0;
	var output_html = ''
	data.forEach(block=>{
		if(block.parent_id==parent_id){
			output_html += `<li data-block="${block.id}">`;
			output_html += `<p>${marked(block.text)}</p>`;
			output_html += build_html(data,block.id,level+1);
			output_html += `</li>`;
		}
	})
	if(!output_html) return '';
	return `<ul>${output_html}</ul>`;
}

window.saferEval = function(expression, dataContext) {
	try{
		return (new Function(['$data'], `var result; with($data) { result = ${expression} }; return result`))(dataContext)
	} catch(e){
		console.log('Safer eval error: '+e)
		return;
	}
}

window.toastr = function(body,title,color,seconds){

	title = title || '';
	color = color || '#007aff'
	seconds = seconds || (2 + body.length/50);

	var div = document.createElement('div');
	div.className = 'toast show';
	div.setAttribute('style','min-width:200px; position: fixed; bottom: 10px; right: 10px;');
	div.innerHTML = `
	<div class="toast-header">
	<svg class="bd-placeholder-img rounded mr-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"><rect width="100%" height="100%" fill="${color}"></rect></svg>
	<strong>${title}</strong>
	</div>
	<div class="toast-body">
	${body}
	</div>`;
	document.body.appendChild(div);

	setTimeout(()=>{
		document.body.removeChild(div);
	},seconds*1000);

}

window.marked = function(text){
	if(!text) return '';
	text = text.replace(/\[\[TODO\]\]/g,'<span class="checkbox"></span>')
	text = text.replace(/\[\[DONE\]\]/g,'<span class="checkbox checked"></span>')

	text = text.replace(/\*\*([^\*]+)\*\*/g,'<strong>$1</strong>')
	text = text.replace(/__([^_]+)__/g,'<strong>$1</strong>')
	text = text.replace(/~~([^~]+)~~/g,'<del>$1</del>')

	text = text.replace(/\*([^\*]+)\*/g,'<em>$1</em>')
	text = text.replace(/_([^_]+)_/g,'<em>$1</em>')

	var matches = text.match(/\[\[([^\]]+)\]\]/g);
	if(matches) matches.forEach(match=>{
		var note_name = match.replace(/[\[\]]/g,'');
		var note = store.state.notes.find(note=>{
			return note.name == note_name
		});
		if(!note) return;
		text = text.replace(match,`<a class="reference" href="/${note.slug}">${match}</a>`);
	});

	return text;
}

window.unmarked = function(text){
	if(!text) return '';
	text = text.replace(/<span class="checkbox"><\/span>/g,'[[TODO]]')
	text = text.replace(/<span class="checkbox checked"><\/span>/g,'[[DONE]]')

	text = text.replace(/<strong>([\s\S]+?)<\/strong>/g,'**$1**')
	text = text.replace(/<em>([\s\S]+?)<\/em>/g,'*$1*')
	text = text.replace(/<del>([\s\S]+?)<\/del>/g,'~~$1~~')

	text = text.replace(/<a class="reference" href="([^"]*)">([^<]*)<\/a>/g,'$2')
	return text;
}

window.toggleCheckbox = function(event) {
	event.preventDefault();
	event.stopPropagation();
	if(event.target.classList.contains('checked')) {
		event.target.classList.remove('checked');
	} else {
		event.target.classList.add('checked');
	}
}
