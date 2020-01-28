'use strict';
// ----------- Класс управления меню -----------------//
class Menu {
  constructor(nameClass = 'menu') {
    this.menu = document.querySelector(`.${nameClass}`);
    this.new = this.menu.querySelector('.new');
    this.movedPiece = null;
  }
  // ------ Получение элементов меню
  getAll() {
    return this.menu.querySelectorAll('li');
  }
  // ------ Перемещение мкню
  moveMenu() {

    let dx = null, dy = null; //переменные хранения смещения координат
    let width; //переменная хранения ширины меню
    this.menu.style.left = localStorage.menuLeft || this.menu.style.left; //получить последнее расположение меню
    this.menu.style.top = localStorage.menuTop || this.menu.style.top; //получить последнее расположение меню

    function move(event) { //передвижение меню мышкой
      event.preventDefault();
      if (this.movedPiece) {
        this.movedPiece.style.left = `${event.pageX - dx}px`;
        this.movedPiece.style.top = `${event.pageY - dy}px`;

        width = width || this.movedPiece.offsetWidth + 1;

        if (Number.parseInt(this.movedPiece.style.top) < 0) { this.movedPiece.style.top = `${0}px`; }
        if (Number.parseInt(this.movedPiece.style.left) < 0) { this.movedPiece.style.left = `${0}px`; }
        if (Number.parseInt(this.movedPiece.style.left) + width >= window.innerWidth) {
          this.movedPiece.style.left = `${window.innerWidth - width}px`;
        }
        if (Number.parseInt(this.movedPiece.style.top) + this.movedPiece.offsetHeight >=  window.innerHeight) {
          this.movedPiece.style.top = `${ window.innerHeight - this.movedPiece.offsetHeight}px`;
        }
      }
    }

    let mousemove = move.bind(this); //Привязка this

    document.addEventListener('mousedown', (event) => { //захват меню
      if (!event.target.classList.contains('drag')) return;
      this.movedPiece = event.target.parentElement;
      dx = event.clientX - this.movedPiece.offsetLeft;
      dy = event.clientY - this.movedPiece.offsetTop;

      document.addEventListener('mousemove', mousemove); //перенос меню

      document.addEventListener('mouseup', () => { //сброс меню
        event.preventDefault();
        if (this.movedPiece) {
          localStorage.menuLeft = this.movedPiece.style.left;
          localStorage.menuTop = this.movedPiece.style.top;
          this.movedPiece = null;
          dx = null;
          dy = null;
          document.removeEventListener('mousemove', mousemove); //удалить событие переноса меню
        }
      });
    });
  }
  // ------ Установки пунктов меню
  setUp(arrayNameClass) {
    let items = this.getAll();

    this.getAll().forEach((item) => {
      item.style.display = 'none';
    });

    arrayNameClass.forEach((nameClass) => {
      this.getAll().forEach((item) => {
        if (item.classList.contains(nameClass)) {
          item.style.display = '';
        }
      });
    });
  }
  // ------ создание событий на кнопках меню
  createEvents() {
    const events = new Events();
    events.copyUrl();
    events.share();
    events.burger();
    events.comments();
    events.draw();
    const loadFile = new LoadFile();
    loadFile.loadForm();
    loadFile.loadDrop();
  }
}

// ----------- Класс загрузки файла -----------------//
class LoadFile {
  constructor (input = document.querySelector('input'), error = document.querySelector('.error')) {
    this.input = input;
    this.error = error;
  }
  // ------ Загрузка файла через форму
  loadForm() {
    this.input.addEventListener('change', () => {
      this.error.style.display = 'none';
      event.preventDefault();
      let file = event.currentTarget.files[0];
      if (file.type === 'image/jpeg' ||  file.type === 'image/png') {
        this.sendImg(file);
      } else {
        this.error.style.display = '';
        this.error.querySelector('.error__header').innerText = 'Ошибка';
        this.error.querySelector('.error__message').innerText = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';

        setTimeout(() => {
          this.error.style.display = 'none';
        }, 5000);
      }
    });
  }
  // ------ Загрузка файла перетаскиванием
  loadDrop() {
    const body = document.querySelector('body');
    body.addEventListener('drop', (event) => {
      this.error.style.display = 'none';
      event.preventDefault();

      if (localStorage.imgUrl) {
        this.error.style.display = '';
        this.error.querySelector('.error__header').innerText = 'Файл уже загружен.';
        this.error.querySelector('.error__message').innerText = 'Загрузить новый файл можно серез меню';

        setTimeout(() => {
          this.error.style.display = 'none';
        }, 5000);
        return;
      }

      let file = event.dataTransfer.files[0];
      if (file.type === 'image/jpeg' ||  file.type === 'image/png') {
        this.sendImg(file);
      } else {
        this.error.style.display = '';
      }
    });

    body.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
  }
  // ------ Отправка файла на сервер и получение данных о загрузке
  sendImg(file) {
    let loading = document.querySelector('.image-loader');
    const formData = new FormData();
    formData.append('title', file.name);
    formData.append('image', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://neto-api.herokuapp.com/pic', true);
    xhr.addEventListener('loadstart', () => {
      loading.style.display = '';
    });

    xhr.addEventListener('loadend', () => {
      loading.style.display = 'none';
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        localStorage.menuItem = ['drag', 'share', 'burger', 'share-tools'];
        new Menu().setUp(localStorage.menuItem.split(','));
        let answer = JSON.parse(xhr.response);
        console.log(answer);
        localStorage.imgUrl = answer.url;
        localStorage.id = answer.id;
        window.location.href += `?id=${localStorage.id}`;
      }
    });
    xhr.send(formData);
  }

  urlOpenFile() {
    if (!window.location.search) return;
    let id = window.location.search.slice(4);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://neto-api.herokuapp.com/pic/${id}`, true);
    xhr.addEventListener('load', () =>{
      // console.log(xhr.response);
    });
    xhr.send();
    // console.log(id);

  }
}

// ----------- Класс создания событий для кнопок меню -----------------//
class Events {
  constructor () {
  }
  // ------ копирование ссылки
  copyUrl(button = document.querySelector('.menu_copy'), url =  document.querySelector('.menu__url')) {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      url.select();
      document.execCommand('copy');
    });
  }
  // ------ поделиться.
  share(share = document.querySelector('.share')) {
    // window.location.search
    share.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.menuItem = ['drag', 'burger', 'share', 'share-tools'];
      new Menu().setUp(localStorage.menuItem.split(','));
      localStorage.menuFlag = ''; //Флаг меню пустой
    });
  }

  // ------ Бургер
  burger(burger = document.querySelector('.burger')) {
    burger.addEventListener('click', (event) => {
      localStorage.menuItem = ['drag', 'new', 'comments', 'draw', 'share'];
      new Menu().setUp(localStorage.menuItem.split(','));
      localStorage.menuFlag = ''; //Флаг меню пустой
    });
  }
  // ------ комментарий
  comments(comments = document.querySelector('.comments')) {
    localStorage.menuFlag = 'comments'; //Флаг меню comments

    document.querySelector('#comments-off').addEventListener('click', (event) => {
      document.querySelectorAll('.comments__form').forEach((item) => {
        item.style.display = 'none';
      });
      localStorage.menuFlag = '';
    });

    document.querySelector('#comments-on').addEventListener('click', (event) => {
      document.querySelectorAll('.comments__form').forEach((item) => {
        item.style.display = '';
      });
      localStorage.menuFlag = 'comments'; //Флаг меню comments
    });

    comments.addEventListener('click', (event) => {
      localStorage.menuItem = ['drag', 'burger', 'comments', 'comments-tools'];
      new Menu().setUp(localStorage.menuItem.split(','));
      localStorage.menuFlag = 'comments'; //Флаг меню comments
      if (document.querySelector('#comments-off').checked === true) {
        localStorage.menuFlag = '';
      }
      document.querySelector('.my_comments').style.zIndex = '2';
      document.querySelector('canvas').style.zIndex = '1';
    });
  }

  // ------ рисовать
  draw(draw = document.querySelector('.draw')) {
    draw.addEventListener('click', (event) => {
      localStorage.menuItem = ['drag', 'burger', 'draw', 'draw-tools'];
      new Menu().setUp(localStorage.menuItem.split(','));
      localStorage.menuFlag = 'draw'; //Флаг меню draw

    });
  }
}

// ----------- Класс начальных установок -----------------//
class StartSetUp {
  constructor() {
  }

  // ------ начальные загрузки
  setup() {
    localStorage.menuItem = localStorage.menuItem || ['drag', 'new']; //начальная установка меню
    localStorage.menuFlag = localStorage.menuFlag || ''; //Флаг меню пустой
    document.querySelector('.menu__url').value = window.location.href; // установка ссылки
    document.querySelector('#comments-on').checked = true;
    new Menu().setUp(localStorage.menuItem.split(','));

    new Comment().deleteForm();
    new LoadFile().urlOpenFile();
    document.querySelectorAll('.comments__form').forEach((item) => {
      item.style.display = 'none';
    });
  }
}

// ----------- Класс комментариев -----------------//
class Comment {
  constructor () {
  }

  // ------ Удалить комментарии из HTML (чтобы не мешались)
  deleteForm() {
    document.querySelectorAll('.comments__form').forEach((item) => {
      item.parentElement.removeChild(item);
    });
  }
  // ------ строка для создания формы комментария, не имеет пользовательских данных, должна быть безопасна
  formComment() {
    return `
      <span class="comments__marker"></span><input type="checkbox" class="comments__marker-checkbox">
      <div class="comments__body">
        <div class="comment last">
          <div class="loader" style="display: none;">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <textarea class="comments__input" type="text" placeholder="Напишите ответ..."></textarea>
        <input class="comments__close" type="button" value="Закрыть">
        <input class="comments__submit" type="submit" value="Отправить">
      </div>`;
  }
  // ------ создать комментарий по клику
  createComment() {
    document.querySelector('.my_comments').addEventListener('click', (event) => {
      event.preventDefault();
      if (localStorage.menuFlag !== 'comments') return;
      const form = document.createElement('form');
      form.classList.add('comments__form');
      form.innerHTML = this.formComment();
      form.style.top = `${event.clientY}px`;
      form.style.left = `${event.clientX}px`;

      this.closeForm(form);
      this.submit(form, Number.parseInt(form.style.left), Number.parseInt(form.style.top));
      this.markerEorm(form);

      document.querySelector('body').appendChild(form);
      form.style.zIndex = '3';
    });
  }

  // ------ должен быть открыт только один маркер
  markerEorm(form) {
    form.querySelector('.comments__marker-checkbox').addEventListener('click', (event) => {
      document.querySelectorAll('.comments__form').forEach((item) => {
        if (item.querySelector('.comments__marker-checkbox') !== event.target) {
          item.querySelector('.comments__marker-checkbox').checked = false;
        }
      });
    });
  }

  // ------ кнопка "закрыть"
  closeForm(form) {
    form.querySelector('.comments__close').addEventListener('click', (event) => {
      event.preventDefault();
      form.querySelector('.comments__marker-checkbox').checked = false;
    });
  }

  // ------ кнопка "отправить"
  submit(form, x, y, id = localStorage.id) {
    form.querySelector('.comments__submit').addEventListener('click', (event) => {
      event.preventDefault();

      if (!id) return;
      const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://neto-api.herokuapp.com/pic/${id}/comments`, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.addEventListener('load', () =>{
        });
        const messageSend = `message=${encodeURIComponent(form.querySelector('.comments__input').value)}&left=${encodeURIComponent(x)}&top=${encodeURIComponent(y)}`;
        if (form.querySelector('.comments__input').value !== '') {
          xhr.send(messageSend);
          form.querySelector('.loader').style.display = '';
        }
    });
  }

  // ------ добавить новый комментарий
  addComment(answer) {
    document.querySelectorAll('.comments__form').forEach((item) => {
      if (answer.left === Number.parseInt(item.style.left) && answer.top === Number.parseInt(item.style.top)) {
        let comment = document.createElement('div');
        comment.classList.add('comment');
        let time = document.createElement('p');
        time.classList.add('comment__time');
        time.innerText = new Date(answer.timestamp).toLocaleString('ru-RU');;
        let mess = document.createElement('p');
        mess.classList.add('comment__message');
        mess.innerText = answer.message;
        comment.appendChild(time);
        comment.appendChild(mess);

        item.querySelector('.comments__body').insertBefore(comment, item.querySelector('.last'));
        item.querySelector('.loader').style.display = 'none';
        item.querySelector('.comments__input').value = '';
      }
    });
  }

  // ------ добавить все комментарии из свойств рисунка
  addAllComment(answer) {

    for (let item in answer) {
      let flag = false;
      document.querySelectorAll('.comments__form').forEach((element) => {
        if (Number.parseInt(element.style.top) === answer[item].top && Number.parseInt(element.style.left) === answer[item].left) {
          flag = true;
        }
      });

      if (flag === false) {
        const form = document.createElement('form');
        form.classList.add('comments__form');
        form.innerHTML = form.innerHTML = this.formComment();
        form.style.top = `${answer[item].top}px`;
        form.style.left = `${answer[item].left}px`;
        this.closeForm(form);
        this.submit(form, Number.parseInt(form.style.left), Number.parseInt(form.style.top));
        this.markerEorm(form);
        document.querySelector('body').appendChild(form);

        this.addComment(answer[item]);
      }

      if (flag === true) {
        this.addComment(answer[item]);
      }
    }
  }
}

const comment = document.createElement('div');
comment.style.width = '100%';
comment.style.height = '100%';
comment.style.position = 'absolute';
comment.style.top = '0';
comment.style.left = '0';
comment.style.display = 'block';
comment.classList.add('my_comments');
document.querySelector('.app').appendChild(comment);

const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.display = 'block';

document.querySelector('.app').appendChild(canvas);
const ctx = canvas.getContext('2d');

// Установка размеров поля отрисовки
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

let points = []; // Массив точек
let drawFlag = true; // Флаг для разрешения отрисовки
let checkedColor = false;

function color(color = document.querySelectorAll('.draw-tools > input')) {
  color.forEach((item) => {
    if (item.checked) {
      checkedColor = item.value;
    }
    return checkedColor;
  });
}

//Основная ф-ия рисования линии
function mouseMove(event) {

  if (localStorage.menuFlag === 'draw') { //Проверка флага, если true то рисуем
    if (event.buttons !== 1) return; //Если рисуем не левой клавишой мышки, то выход
    ctx.lineWidth = 4; //Установка толщины линии
    ctx.lineJoin = 'round'; //сглаживание
    ctx.lineCap = 'round'; //сглаживани
    ctx.beginPath(); //Открытие патча
    if (points.length === 0) { //Если в массиве пусто
      ctx.moveTo(event.clientX, event.clientY); // установить точку начала отрисовки в точку курсора
      points.push({x: event.clientX, y: event.clientY}); // добавить первый элемент в массив
    }
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y); //Установить точку начала отрисовки с координатами последнего элемента массива
    ctx.lineTo(event.clientX, event.clientY); //Рисовать линию до курсора
    points.push({x: event.clientX, y: event.clientY}); //Занести точку куросра в массив

    ctx.closePath(); //Закрыть патч
    color();
    ctx.strokeStyle = checkedColor; // Выбираем цвет
    ctx.stroke(); //Прорисовка линии
  }
}

//Ф-ия очистки массива точек
function mouseUp() {
  points = [];
}

//Ф-ия очистки экрана
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
window.onbeforeunload = clear();

//Запуск кода

//После нажатия кнопки мыши выставляется флаг = true и начинается процесс рисования
document.addEventListener('mousedown', function() {
  drawFlag = true;
  document.addEventListener('mousemove', mouseMove);
});

//После отжатия клавиши мышки очищается массив точек
document.addEventListener('mouseup', mouseUp);

//После выхода курсора за пределы окна выставляется флаг = false запрещающий рисование
canvas.addEventListener('mouseleave', () => {
  drawFlag = false;
});

//Очистка экрана при двойном клике
// document.addEventListener('dblclick', clear);

//Очистка экрана при изменении окна и установка новых параметров canvas
window.addEventListener('resize', () => {
  // clear();
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
});



const ws = new WebSocket(`wss://neto-api.herokuapp.com/pic/${localStorage.id}`);

ws.addEventListener('open', () => {
  console.log('Вебсокет-соединение открыто');

  setInterval(() => {
    if (localStorage.id) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://neto-api.herokuapp.com/pic/${localStorage.id}`, true);
      xhr.addEventListener('load', () =>{
        // console.log(xhr.response);
      });
      xhr.send();

      canvas.toBlob(function (blob) {
        ws.send(blob);
        // console.log(blob);
        // console.log(canvas);
      });
    }
  }, 7000);

  // const xhr = new XMLHttpRequest();
  //   xhr.open('POST', `https://neto-api.herokuapp.com/pic/${localStorage.id}/comments`, true);
  //   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //   xhr.addEventListener('load', () =>{
  //   });
  //   const messageSend = `message=${encodeURIComponent('Сообщение /n сообщение 2')}&left=${encodeURIComponent('300')}&top=${encodeURIComponent('300')}`;
  //   xhr.send(messageSend);

  ws.addEventListener('message', (event) => {
    let answer = JSON.parse(event.data);
    if (answer.event === 'comment') {
      new Comment().addComment(answer.comment);
    }
    if (answer.event === 'pic') {
      new Comment().addAllComment(answer.pic.comments);
    }
  });
});

localStorage.menuItem = localStorage.menuItem || ['new', 'drag'];
localStorage.menuFlag = localStorage.menuFlag || '';
// console.log(localStorage.menuFlag);
document.querySelector('.current-image').src = localStorage.imgUrl || '';

new StartSetUp().setup();
new Comment().createComment();

const menu = new Menu();
menu.setUp(localStorage.menuItem.split(','));
menu.moveMenu();
menu.createEvents();

// const draw = new Draw();
// draw.setCanvas();
// draw.draw();
