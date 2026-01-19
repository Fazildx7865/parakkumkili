let move_speed = 3;
let gravity = 0.5;
let bird_dy = 0;

let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let message = document.getElementById('message');
let restartBtn = document.getElementById('restartBtn');
let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');

let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let game_state = 'Start';
img.style.display = 'none';

/* ---------- INPUT ---------- */

function flap() {
	if (game_state !== 'Play') return;
	bird_dy = -7.6;
	img.src = 'images/Bird-2.png';
	setTimeout(() => img.src = 'images/Bird.png', 150);
}

document.addEventListener('keydown', e => {
	if (e.key === 'Enter' && game_state !== 'Play') {
		startGame();
	}
	if (e.key === 'ArrowUp' || e.key === ' ') {
		flap();
	}
});

document.addEventListener('touchstart', flap);
document.addEventListener('mousedown', flap);

/* ---------- GAME ---------- */

function startGame() {
	document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

	img.style.display = 'block';
	bird.style.top = '40vh';
	bird_dy = 0;

	score_val.innerHTML = '0';
	score_title.innerHTML = 'Score : ';

	message.style.display = 'none';
	restartBtn.style.display = 'none';

	game_state = 'Play';
	play();
}

function play() {
	let bird_props = bird.getBoundingClientRect();
	let background = document.querySelector('.background').getBoundingClientRect();

	function apply_gravity() {
		if (game_state !== 'Play') return;

		bird_dy += gravity;
		bird.style.top = bird_props.top + bird_dy + 'px';
		bird_props = bird.getBoundingClientRect();

		if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
			endGame();
			return;
		}
		requestAnimationFrame(apply_gravity);
	}

	function move_pipes() {
		if (game_state !== 'Play') return;

		document.querySelectorAll('.pipe_sprite').forEach(pipe => {
			let pipe_props = pipe.getBoundingClientRect();

			if (pipe_props.right <= 0) pipe.remove();

			if (
				bird_props.left < pipe_props.right &&
				bird_props.right > pipe_props.left &&
				bird_props.top < pipe_props.bottom &&
				bird_props.bottom > pipe_props.top
			) {
				endGame();
			}

			if (pipe_props.right < bird_props.left && !pipe.scored) {
				score_val.innerHTML = +score_val.innerHTML + 1;
				pipe.scored = true;
				sound_point.play();
			}

			pipe.style.left = pipe_props.left - move_speed + 'px';
		});

		requestAnimationFrame(move_pipes);
	}

	let pipe_gap = 35;
	let pipe_separation = 0;

	function create_pipe() {
		if (game_state !== 'Play') return;

		if (pipe_separation > 115) {
			pipe_separation = 0;

			let pipe_pos = Math.floor(Math.random() * 40) + 10;

			let top_pipe = document.createElement('div');
			top_pipe.className = 'pipe_sprite';
			top_pipe.style.top = pipe_pos - 70 + 'vh';

			let bottom_pipe = document.createElement('div');
			bottom_pipe.className = 'pipe_sprite';
			bottom_pipe.style.top = pipe_pos + pipe_gap + 'vh';

			document.body.appendChild(top_pipe);
			document.body.appendChild(bottom_pipe);
		}
		pipe_separation++;
		requestAnimationFrame(create_pipe);
	}

	apply_gravity();
	move_pipes();
	create_pipe();
}

function endGame() {
	game_state = 'End';
	message.style.display = 'block';
	message.innerHTML = 'Game Over';
	message.classList.add('messageStyle');
	restartBtn.style.display = 'block';
	img.style.display = 'none';
	sound_die.play();
}

restartBtn.addEventListener('click', () => location.reload());
