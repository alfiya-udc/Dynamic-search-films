## Поиск по фильмам (динамический) (JS app, Pure Javascript)

# For use:
### npm i
### npm node server.js

Страница будет [здесь](http://127.0.0.1:8080)

Приложение состоит из двух разделов: “Фильмы” и “Закладки”.
(1) Табы переключения страниц. Таб “Фильмы” отображает страницу с поиском фильмов и результатом поиска. Таб “Закладки” отображает страницу со списком фильмов, которые были добавлены в закладки. Таб выделяется, если он выбран.
.
(2) Поле поиска по названию фильма. Список фильмов фильтруется по названиям, которые содержат введенный запрос. Например, при вводе запроса “Тер” отобразятся фильмы: Терминатор, Терминал и т. д.

(3) Поиск по тегам. Дополнительно фильтрует фильмы по тегам. Можно выбрать несколько тегов. Теги хранятся в отдельном JSON файле.

(4) Список фильмов. Отображает выборку фильмов в соответствии введенному запросу поиска и выбранным тегам. Отображаются первые 15 фильмов. 

(5) Иконка добавить в закладки. При нажатии на нее фильм добавляться в список закладок. При повторном нажатии фильм удаляется из закладок. Список закладок хранится в localStorage. Если фильм в закладках, то его иконка подсвечивается.

(6) Кнопка показать еще отображает следующие 15 фильмов. Если больше показать нечего, то скрываем эту кнопку.

(7) Страница закладок отображает список фильмов из закладок. При нажатии на иконку, фильм удаляется из закладок и исчезает из списка

