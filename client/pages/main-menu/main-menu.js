$(buttonCreate).click(async e => {
   const res = await new Promise(res => createGame(res));

   if (res.status == 'OK') {
      loadPage('game');
   } else {
      alert('Ошибка во время создания игры.');
   }
});

$(buttonConnect).click(async e => {
   const gameId = prompt('Введите ID игры');
   if (gameId == null) return;
   const res = await new Promise(res => connectGame(gameId, res));

   if (res.status == 'OK') {
      loadPage('game')
   } else {
      alert('Не удалось подключится к игре. Возможно вы ввели неверный ID игры');
   }
});

$(buttonCreate).hover(
   e => logo.classList.add('logo_top'),
   e => logo.classList.remove('logo_top'), 
);
$(buttonConnect).hover(
   e => logo.classList.add('logo_bottom'),
   e => logo.classList.remove('logo_bottom'), 
);