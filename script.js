const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    height: 50,
    width: 50,
    speed: 5,
    velocityY: 0
};

const block = {
    x: canvas.width / 2 - 100,
    y: canvas.height - 200,
    width: 100,
    height: 20,
    velocityY: 0
};

let GRAVITY = 0.5;
let JUMP_STRENGTH = 15;
let jumping = false;
let doubleJumpUsed = false;
let jumpPressed = false;
let terminalVelocity = 20;
let PlayerOnBlock = false;
let BlockOnPlayer = false;

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'ArrowUp' || e.key === ' ') {
        jumpPressed = false;
    }
});

function update() {
    if (keys['ArrowLeft']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
    }
    if ((keys['ArrowUp'] || keys[' ']) && !jumpPressed) {
        jumpPressed = true;
        if (!jumping) {
            player.velocityY = -JUMP_STRENGTH;
            jumping = true;
            doubleJumpUsed = false;
        } else if (jumping && !doubleJumpUsed) {
            player.velocityY = -JUMP_STRENGTH;
            doubleJumpUsed = true;
        }
    }
    if (PlayerOnBlock && !jumping && keys['w']) {
        block.y -= 5;
        player.y = block.y - player.height;
    }
    if (PlayerOnBlock && !jumping && keys['s']) {
        block.y += 5;
        player.y = block.y - player.height;
    }
    if (PlayerOnBlock && !jumping && keys['a']) {
        block.x -= 5;
        player.x = block.x + PlayeroffsetX;
    }
    if (PlayerOnBlock && !jumping && keys['d']) {
        block.x += 5;
        player.x = block.x + PlayeroffsetX;
    }
    if (player.velocityY < terminalVelocity) {
        player.velocityY += GRAVITY;
    }
    if (block.velocityY < (terminalVelocity - 15) && !PlayerOnBlock) {
        block.velocityY += GRAVITY;
    }

    player.y += player.velocityY;
    if (!PlayerOnBlock && !BlockOnPlayer) {
        block.y += block.velocityY;
    }

    if (player.y >= canvas.height - player.height) {
        jumping = false;
    } else {
        jumping = true;
    }
    
    border();
    gravity();
    collisionBlock();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lime';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(block.x, block.y, block.width, block.height);

    requestAnimationFrame(update);
}

function border() {
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }
    if (block.x + block.width > canvas.width) {
        block.x = canvas.width - block.width;
    }
    if (block.x < 0) {
        block.x = 0;
    }
    if (block.y + block.height >= canvas.height) {
        block.y = canvas.height - block.height;
    }
    if (block.y - player.height < 0) {
        block.y = player.height;
    }
}
function gravity() {
    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
    }
    if (block.y >= canvas.height - block.height) {
        block.y = canvas.height - block.height;
        block.velocityY = 0;
    }
}

function collisionBlock() {
    if (player.x < block.x + block.width &&
         player.x + player.width > block.x && 
         player.y < block.y + block.height && 
         player.y + player.height > block.y) {

        const overlapTop = (player.y + player.height) - block.y;

        const overlapBottom = (block.y + block.height) - player.y;

        const overlapLeft = (player.x + player.width) - block.x;

        const overlapRight = (block.x + block.width) - player.x;
        
        const minOverlap = Math.min(overlapTop,
             overlapBottom, 
             overlapLeft, 
             overlapRight);
        
        // Top collision
        if (minOverlap === overlapTop) {
            player.y = block.y - player.height;
            if (player.velocityY > 0) {
                player.velocityY = 0;
                jumping = false;
            }
            PlayeroffsetX = player.x - block.x;
            PlayerOnBlock = true;
        }
        // Bottom collision
        else if (minOverlap === overlapBottom) {
            player.y = block.y + block.height;
            if (player.velocityY < 0) {
                player.velocityY = 0;
            }
            BlockOnPlayer = true;
        }
        else if (minOverlap === overlapLeft) {
            player.x = block.x - player.width;
        }
        else if (minOverlap === overlapRight) {
            player.x = block.x + block.width;
        }
    } else {
        PlayerOnBlock = false;
        BlockOnPlayer = false;
    }
}

update();