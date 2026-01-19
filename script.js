document.body.style.overflow = 'hidden';
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

let move_speed = 3;
let gravity = 0.5;
let bird_dy = 0;

let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let message = document.getElementById('message');

let startBtn = document.getElementById('startBtn');
let pauseBtn = document.getElementById('pauseBtn');
let restartBtn = document.getElementById('restartBtn');

let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');
let highScoreVal = document.getElementById('highScoreVal');

let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let game_state = 'Start';
let isCountingDown = false;

/* High Score */
let highScore = localStorage.getItem('highScore') || 0;
highScoreVal.innerText = highScore;

/* INPUT */
function flap() {
	if (game_state !== 'Play' || isCountingDown) return;
	bird_dy = -7.6;
	img.src = 'images/Bird-2.png';
	setTimeout(() => img.src = 'images/Bird.png', 150);
}

document.addEventListener('keydown', e => {
	if ((e.key === 'ArrowUp' || e.key === ' ') ) flap();

	if ((e.key === 'p' || e.key === 'P') &&
	    (game_state === 'Play' || game_state === 'Pause')) {
		togglePause();
	}
});

document.addEventListener('touchstart', flap);
document.addEventListener('mousedown', flap);

/* Countdown */
function startCountdown(callback) {
	if (isCountingDown) return;
	isCountingDown = true;

	let count = 3;
	message.style.display = 'block';
	message.classList.add('messageStyle');

	let timer = setInterval(() => {
		if (count > 0) {
			message.innerHTML = `<span class="countdown">${count}</span>`;
			count--;
		} else {
			clearInterval(timer);
			message.innerHTML = 'GO!';
			setTimeout(() => {
				message.style.display = 'none';
				isCountingDown = false;
				callback();
			}, 500);
		}
	}, 1000);
}

/* Buttons */
startBtn.addEventListener('click', () => {
	startBtn.style.display = 'none';
	startCountdown(startGame);
});

restartBtn.addEventListener('click', () => {
	restartBtn.style.display = 'none';
	startCountdown(startGame);
});

pauseBtn.addEventListener('click', togglePause);

/* Game */
function startGame() {
	document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

	bird.style.display = 'block';
	bird.style.top = '40%';
	bird_dy = 0;

	score_val.innerText = '0';
	score_title.innerText = 'Score:';

	message.style.display = 'none';
	pauseBtn.style.display = 'block';
	restartBtn.style.display = 'none';

	game_state = 'Play';
	play();
}

function togglePause() {
	if (game_state === 'Play') {
		game_state = 'Pause';
		message.style.display = 'block';
		message.innerHTML = 'Paused';
		pauseBtn.innerText = 'Resume';
	} else if (game_state === 'Pause') {
		game_state = 'Play';
		message.style.display = 'none';
		pauseBtn.innerText = 'Pause';
		play();
	}
}

function play() {
	let bird_props = bird.getBoundingClientRect();

	function gravityLoop() {
		if (game_state !== 'Play') return;

		bird_dy += gravity;
		bird.style.top = bird_props.top + bird_dy + 'px';
		bird_props = bird.getBoundingClientRect();

		if (bird_props.top <= 0 || bird_props.bottom >= window.innerHeight) {
			endGame();
			return;
		}
		requestAnimationFrame(gravityLoop);
	}

	function pipeLoop() {
		if (game_state !== 'Play') return;

		document.querySelectorAll('.pipe_sprite').forEach(pipe => {
			let p = pipe.getBoundingClientRect();

			if (p.right <= 0) pipe.remove();

			if (
				bird_props.left < p.right &&
				bird_props.right > p.left &&
				bird_props.top < p.bottom &&
				bird_props.bottom > p.top
			) endGame();

			if (p.right < bird_props.left && !pipe.scored) {
				let current = +score_val.innerText + 1;
				score_val.innerText = current;

				if (current > highScore) {
					highScore = current;
					localStorage.setItem('highScore', highScore);
					highScoreVal.innerText = highScore;
				}
				pipe.scored = true;
				sound_point.play();
			}

			pipe.style.left = p.left - move_speed + 'px';
		});

		requestAnimationFrame(pipeLoop);
	}

	let pipe_gap = 35;
	let pipe_sep = 0;

	function createPipe() {
		if (game_state !== 'Play') return;

		if (pipe_sep > 115) {
			pipe_sep = 0;
			let pos = Math.floor(Math.random() * 40) + 10;

			let top = document.createElement('div');
			top.className = 'pipe_sprite';
			top.style.top = pos - 70 + '%';

			let bottom = document.createElement('div');
			bottom.className = 'pipe_sprite';
			bottom.style.top = pos + pipe_gap + '%';

			document.body.appendChild(top);
			document.body.appendChild(bottom);
		}
		pipe_sep++;
		requestAnimationFrame(createPipe);
	}

	gravityLoop();
	pipeLoop();
	createPipe();
}

function endGame() {
	game_state = 'End';
	message.style.display = 'block';
	message.innerHTML = `
<b>പോടാ പോടാ... തരത്തിൽ പോയി കളിക്കടാ</b><br>Score: ${score_val.innerText}<br>Best: ${highScore}`;
	restartBtn.style.display = 'block';
	pauseBtn.style.display = 'none';
	bird.style.display = 'none';
	sound_die.play();
}
