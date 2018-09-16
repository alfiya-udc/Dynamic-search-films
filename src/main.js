'use strict';

(function(){

let arrOfTags = []; //временный массив для fetch запроса
let arrOfFilms = []; //временный массив для fetch запроса
let tags = []; //сюда добавим флаги
let films = []; //сюда добавим id
let chosenTags = []; //Доп. массив для хранения выбранных тегов
let foundFilms = []; // будет обновляться только после каждого сабмита
let filteredFilms = []; //будет обновляться только после каждого клика по тегу
let selectedFilms = []; //будет обновляться только после каждого клика по вкладке "закладки"

//DOM-переменные
const listOfFilms = document.querySelector('.js-films-list');
const listOfBookmarks = document.querySelector('.js-bookmarks-list');
const containerOfFilms = document.querySelector('.js-films');
const containerOfTags = document.querySelector('.js-tags');
const containerOfBookmarks = document.querySelector('.js-bookmarks');
const tabsContainer = document.querySelector('.js-tabs'); 
const searchForm = document.querySelector('.js-search');
const buttons = Array.from(document.querySelectorAll('.js-btn'));

//Вспомогательные переменные для кнопки "показать еще"
let counterF = 0; // счетчики уже отрендеренных фильмов
let counterB = 0; // то же для закладок
let multF = 1; //множитель для фильмов
let multB = 1; //множитель для закладок
let quantity = 15; //количество фильмов, к-е рендерятся за раз

//после этого запроса в переменной arrOfFilms будет массив с фильмами
fetch('src/jsons/films.json')  
	.then(status)  
	.then(json)  
	.then(function(data) {  
		arrOfFilms = data;
	}).catch(function(error) {  
		console.log('Request failed', error);  
	});

//после этого запроса в переменной arrOfTags будет массив с тегами и пойдет основной код
fetch('src/jsons/tags.json')  
	.then(status)  
	.then(json)  
	.then(function(data) {
		arrOfTags = data;
		tags = addState(arrOfTags, 'chosen'); //преобразуем массив с тегами, добавив в каждый элемент состояние тега
		films = addId(arrOfFilms);
		foundFilms = copy(films); //эта переменная будет обновляться только после каждого сабмита!
		filteredFilms = foundFilms; //этот массив будем постоянно менять после каждого клика, пока в нем просто ссылка
		let selectedFilms = [];

		// сразу показать все на странице: и теги, и фильмы
		renderTags(tags, containerOfTags);
		renderFilms(foundFilms, listOfFilms);

		// события
		tabsContainer.addEventListener('click', createTabs);
		searchForm.addEventListener('submit', updateFilmsForSearch);
		containerOfTags.addEventListener('click', updateFilmsForTag);
		buttons.forEach(button => button.addEventListener('click', renderFilmsDecorator));
		buttons.forEach(button => button.addEventListener('click', isdisplayMoreDecorator));
		listOfFilms.addEventListener('click', toggleBookmarks);
		listOfBookmarks.addEventListener('click', toggleBookmarks);
	}).catch(function(error) {  
		console.log('Request failed', error);  
	});

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function removeChildren(elem) {
    while (elem.lastChild) {
      elem.removeChild(elem.lastChild);
    }
}

function copy(arr) {
	let output, v, key;

	output = Array.isArray(arr) ? [] : {};

	for (key in arr) {
		v = arr[key];
		output[key] = (typeof v === 'object') ? copy(v) : v;
	}

	return output;
}

function status(response) {  
	if (response.status >= 200 && response.status < 300) {  
		return Promise.resolve(response)  
	} else {  
		return Promise.reject(new Error(response.statusText))  
	}  
}
	
function json(response) {  
	return response.json()  
}

// ВСЕ ФУНКЦИИ
//добавление id
function addId(arr) {
	for (let i = 0; i < arr.length; i++) {
		arr[i].id = i;
	};
	return arr;
}

//копирование массива строк в массив с объектами с добавлением состояния
function addState(arr, stateName) {
	let arr2 = [];

	for (let i = 0; i < arr.length; i++) {
		arr2[i] = {};
		arr2[i].tagName = arr[i];
		arr2[i][stateName] = false;
	}

	return arr2;
}

//табы на заголовки
function createTabs(event) {
    if (event.target.classList.contains('js-tab-header')) {
        const tabsHeaders = Array.from(tabsContainer.querySelectorAll('.js-tab-header'));
        const tabIndex = tabsHeaders.indexOf(event.target);
        const panels = Array.from(document.querySelectorAll('.js-tab-panel'));

		containerOfTags.style.display = 'flex';
		searchForm.style.display = 'flex';

        tabsHeaders.map(tabHeader => tabHeader.classList.remove('headers-list__item--active'));
        event.target.classList.add('headers-list__item--active');
        
        for (let i = 0; i < panels.length; i++) {
            tabIndex === i ? panels[i].style.display = 'block' : panels[i].style.display = 'none';
		}
		
		if (event.target.classList.contains('js-bookmarks-header')) {
			updateFilmsForSelect();
			containerOfTags.style.display = 'none';
			searchForm.style.display = 'none';
		}
	}	
}

//фильтрует массив тегов tags после поиска по фильмам - вернет массив тегов
function updateTags() {
	const arr = [];
	const newTags = [];

	for (let film of foundFilms) {
		for (let tagEl of arrOfTags) {
			//если в подразделе tags у массива foundFilms нашли хоть одно совпадение с каждым элементом tags....
			if (film.tags.some(item => item === tagEl) 
				//и в нашем записываемом массиве результатов его тоже еще нет...
				&& arr.indexOf(tagEl) === -1) {
					arr.push(tagEl);
			}
		}
	}
	
	//преобразовали простой массив только с тегами в массив объектов с тегами и состояниями
	for (let i = 0; i < arr.length; i++) {
		newTags[i] = {};
		newTags[i].tagName = arr[i];
		newTags[i].chosen = false;
	}

	return newTags;
}

//обновляет переменные foundFilms, tags, обнуляет счетчик counter и multiplier, рендерит теги и фильмы
function updateFilmsForSearch(event) {
	event.preventDefault();
	const btn = containerOfFilms.querySelector('.js-btn');
	
	counterF = 0;
	multF = 1;
	foundFilms = searchForName(); // то же самое ф и возвращает, норм
	filteredFilms = foundFilms; //! передача по ссылке! (чтобы работала isdisplayMore)
	tags = updateTags();

	removeChildren(listOfFilms);
	renderFilms(foundFilms, listOfFilms);	
	isdisplayMore(counterF, foundFilms, btn);
	removeChildren(containerOfTags);
	renderTags(tags, containerOfTags);	
}

//обновляет переменные filteredFilms, chosenTags, рендерит фильмы
function updateFilmsForTag(event) {
	const btn = containerOfFilms.querySelector('.js-btn');
	
	counterF = 0;
	multF = 1;

	chooseTags(event);	
	//перезапишем массив с отфильтрованными фильмами filteredFilms, а foundFilms трогать не будем
	filteredFilms = searchForTag(foundFilms, chosenTags);	
	
	removeChildren(listOfFilms);
	renderFilms(filteredFilms, listOfFilms);
	isdisplayMore(counterF, filteredFilms, btn);
}

//обновляет список закладок согласно новому массиву
function updateFilmsForSelect() {
	const btn = containerOfBookmarks.querySelector('.js-btn');
	
	counterB = 0;
	multB = 1;
	selectedFilms = selectFilms();
	
	removeChildren(listOfBookmarks);
		
	renderFilms(selectedFilms, listOfBookmarks);
	isdisplayMore(counterB, selectedFilms, btn);
}

//рендерит фильмы с нужными классами и т.п. 
//каждый вызов меняет переменные счетчика и множителя
function renderFilms(arr, parentEl) {
	let counter, multiplier;
	
	//всякие проверки
	if (parentEl === listOfFilms) {
		counter = counterF;
		multiplier = multF;
	}

	if (parentEl === listOfBookmarks) {
		counter = counterB;
		multiplier = multB;
	}

	//собственно рендеринг
	while(counter < arr.length && counter < quantity * multiplier) {
		let item = document.createElement('li');
        let name = document.createElement('div');
        let bookmark = document.createElement('div');
        
		item.classList.add('films__item');
		item.dataset.id = arr[counter].id; //в каждый отрендеренный элемент добавим id
        name.classList.add('films__name');    
		bookmark.classList.add('films__bookmark', 'bookmark', 'js-bookmark');

		if (parentEl === listOfBookmarks) bookmark.classList.add('bookmark--active');

        item.appendChild(name);
        item.appendChild(bookmark);    
        name.appendChild(document.createTextNode(arr[counter].title));
		parentEl.appendChild(item);
		
		counter++;
	}

	multiplier++;

	//обновление счетчиков (противодействие замыканию)
	if (parentEl === listOfFilms) {
		counterF = counter;
		multF = multiplier;
	}

	if (parentEl === listOfBookmarks) {
		counterB = counter;
		multB = multiplier;
	}
}

//рендерит теги
function renderTags(arr, parentEl) {
    for (let i = 0; i < arr.length; i++) {
        let item = document.createElement('li');

        item.classList.add('tags__item', 'js-tag');
		item.dataset.tag = arr[i].tagName;
		item.dataset.index = i;

        item.appendChild(document.createTextNode(arr[i].tagName));
        parentEl.appendChild(item);
    }
}

//обертки для вызова по клику
function renderFilmsDecorator(event) {
	if (containerOfBookmarks.contains(event.target)) {
		renderFilms(selectedFilms, listOfBookmarks);
	}

	if (containerOfFilms.contains(event.target)) {
		renderFilms(filteredFilms, listOfFilms);
	}
}

function isdisplayMoreDecorator(event) {
	if (containerOfBookmarks.contains(event.target)) {
		isdisplayMore(counterB, selectedFilms, event.target);
	}

	if (containerOfFilms.contains(event.target)) {
		isdisplayMore(counterF, filteredFilms, event.target);
	}	
}

//ищет строку в названиях фильмов - вернет foundFilms
function searchForName() {
    let str = document.querySelector('.js-search-field').value;
	let title;

	if (str === '') return foundFilms; //чтобы лишний раз не ходить по циклу, если строка пустая

	foundFilms = [];

    for (let i = 0; i < films.length; i++) {
		title = films[i].title;        
		title = title.toLowerCase(); //если надо, то можно все к нижнему регистру
		
		if (title.indexOf(str) === -1) continue;
		
        foundFilms.push(films[i]);
	}

    return foundFilms;
}

//проходит по массиву с выбранными тегами и возвращает массив с фильмами, где есть все эти теги
function searchForTag(arr, chsnTags) {
	filteredFilms = [];

	for (let chosenTag of chsnTags) {
		filteredFilms = [];
		for (let el of arr) {
			if (el['tags'].indexOf(chosenTag) === -1) continue;
			filteredFilms.push(el);	
		}

		arr = filteredFilms;
	}

	return arr;
}

//добавляет фильм в закладки и удаляет оттуда
function toggleBookmarks(event) {
	let id = event.target.parentElement.dataset.id;

	if (!event.target.classList.contains('js-bookmark')) return;

	if (event.target.classList.contains('bookmark--active')) {
		event.target.classList.remove('bookmark--active');
		localStorage.removeItem(id);
	} else {
		localStorage[id] = id;
		event.target.classList.add('bookmark--active');
	}
} 

//маркирует теги после клика и меняет массив с выбранными тегами
function chooseTags(event) {
	const tg = event.target;

	if (!tg.classList.contains('js-tag')) return;

	let i = tg.dataset.index;

	tg.classList.toggle('tags__item--active');	
	tags[i].chosen === true ? tags[i].chosen = false : tags[i].chosen = true;
	chosenTags = [];

	for (let elem of tags) {
		if (elem.chosen === false) continue;

		chosenTags.push(elem.tagName);
	}
}

//создает массив с закладками
function selectFilms() {
	if (localStorage.length === 0) return [];

	let ls = [];

	for (let i = 0; i < localStorage.length; i++){
		let key = localStorage.key(i);
		let value = localStorage.getItem(key);
		ls.push(+value);
	}

	selectedFilms = [];	

	for (let film of films) {
		if (~ls.indexOf(film["id"])) {
            selectedFilms.push(film);
        }
	}

	return selectedFilms;
}

//проверяет, показывать ли кнопку "Показать еще"
function isdisplayMore(count, arr, elem) {
	count < arr.length ? elem.style.display = "block" : elem.style.display = "none";
}

})()