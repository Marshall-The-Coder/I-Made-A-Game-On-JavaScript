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
    velocityY: 0,
    velocityX: 0
};

const House_Floor = {
    x: 400,
    y: canvas.height - 400,
    width: 200,
    height: 20
}

let GRAVITY = 0.5;
let JUMP_STRENGTH = 15;
let jumping = false;
let doubleJumpUsed = false;
let jumpPressed = false;
let terminalVelocity = 20;
let PlayerOnBlock = false;
let BlockOnPlayer = false;
let walljumpused = false;
let PlayeroffsetX = 0;
let player_house_bottom = false;
let blockonhousefloor = false;
let playeronhousefloor = false;
let floating = false;

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
    if (PlayerOnBlock && !jumping && keys['w'] && !player_house_bottom) {
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
    if (!PlayerOnBlock && keys['t'] && !jumping && !blockonhousefloor && playeronhousefloor && block.y > (player.y + player.height)) {
        const targetX = House_Floor.x + House_Floor.width;
        const dx = targetX - block.x;
        const maxSpeed = 5;
        if (Math.abs(dx) <= 0.1) {
            block.velocityX = 0;
            block.x = targetX;
            floating = true;
            if (block.y > (canvas.height - 390)) {
                block.velocityY -= 0.1;
            } 
            if (block.y <= (canvas.height - 390)) {
                block.velocityY = 0;
                block.y = House_Floor.y;
            }
        } else {
            block.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, dx * 0.2));
        }
    }
    if (player.velocityY < terminalVelocity) {
        player.velocityY += GRAVITY;
    }
    if (block.velocityY < (terminalVelocity - 15) && !PlayerOnBlock && !blockonhousefloor && !floating) {
        block.velocityY += GRAVITY;
    }

    player.y += player.velocityY;
    if (!PlayerOnBlock && !BlockOnPlayer && !blockonhousefloor) {
        block.y += block.velocityY;
    }

    if (player.y >= canvas.height - player.height) {
        jumping = false;
    } else {
        jumping = true;
    }

    block.x += block.velocityX;
    
    border();
    gravity();
    collisionBlock();
    collisionHouseFloor();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lime';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(block.x, block.y, block.width, block.height);

    ctx.fillStyle = 'brown';
    ctx.fillRect(House_Floor.x, House_Floor.y, House_Floor.width, House_Floor.height);

    requestAnimationFrame(update);
}

function border() {
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        if (jumping && doubleJumpUsed && !walljumpused) {
            doubleJumpUsed = false;
            walljumpused = true;
        }
    }
    if (player.x < 0) {
        player.x = 0;
        if (jumping && doubleJumpUsed && !walljumpused) {
            doubleJumpUsed = false;
            walljumpused = true;
        }
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
        walljumpused = false;
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

        if (minOverlap === overlapTop) {
            player.y = block.y - player.height;
            if (player.velocityY > 0) {
                player.velocityY = 0;
                jumping = false;
                walljumpused = false;
                floating = false;
            }
            PlayeroffsetX = player.x - block.x;
            PlayerOnBlock = true;
        }
        else if (minOverlap === overlapBottom) {
            player.y = block.y + block.height;
            if (player.velocityY < 0) {
                player.velocityY = 0;
            }
            BlockOnPlayer = true;
        }
        else if (minOverlap === overlapLeft) {
            player.x = block.x - player.width;
            if (jumping && doubleJumpUsed && !walljumpused) {
                doubleJumpUsed = false;
                walljumpused = true;
            }
        }
        else if (minOverlap === overlapRight) {
            player.x = block.x + block.width;
            if (jumping && doubleJumpUsed && !walljumpused) {
                doubleJumpUsed = false;
                walljumpused = true;
            }
        }
    } else {
        if (!floating) {
            PlayerOnBlock = false;
        }
            BlockOnPlayer = false;
    }
}
function collisionHouseFloor() {
    const playerColliding = player.x < House_Floor.x + House_Floor.width &&
        player.x + player.width > House_Floor.x && 
        player.y < House_Floor.y + House_Floor.height && 
        player.y + player.height > House_Floor.y;

    const blockColliding = block.x < House_Floor.x + House_Floor.width &&
        block.x + block.width > House_Floor.x && 
        block.y < House_Floor.y + House_Floor.height && 
        block.y + block.height > House_Floor.y;

    if (playerColliding) {
        const overlapTop = (player.y + player.height) - House_Floor.y;
        const overlapBottom = (House_Floor.y + House_Floor.height) - player.y;
        const overlapLeft = (player.x + player.width) - House_Floor.x;
        const overlapRight = (House_Floor.x + House_Floor.width) - player.x;
        const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

        if (minOverlap === overlapTop) {
            player.y = House_Floor.y - player.height;
            if (player.velocityY > 0) {
                player.velocityY = 0;
            }
            jumping = false;
            walljumpused = false;
            playeronhousefloor = true;
        }
        else if (minOverlap === overlapBottom) {
            player.y = House_Floor.y + House_Floor.height;
            if (player.velocityY < 0) {
                player.velocityY = 0;
            }
            player_house_bottom = true;
        }
        else if (minOverlap === overlapLeft) {
            player.x = House_Floor.x - player.width;
            if (jumping && doubleJumpUsed && !walljumpused) {
                doubleJumpUsed = false;
            }
        }
        else if (minOverlap === overlapRight) {
            player.x = House_Floor.x + House_Floor.width;
            if (jumping && doubleJumpUsed && !walljumpused) {
                doubleJumpUsed = false;
                walljumpused = true; 
            }
        }
    } else {
        player_house_bottom = false;
        playeronhousefloor = false;
    }

    if (blockColliding) {
        const overLapTopBlock = (block.y + block.height) - House_Floor.y;
        const overLapBottomBlock = (House_Floor.y + House_Floor.height) - block.y;
        const overLapLeftBlock = (block.x + block.width) - House_Floor.x;
        const overLapRightBlock = (House_Floor.x + House_Floor.width) - block.x;
        const minOverlapBlock = Math.min(overLapTopBlock, overLapBottomBlock, overLapLeftBlock, overLapRightBlock);

        if (minOverlapBlock === overLapTopBlock) {
            if (!floating || !keys['t']) {
                block.y = House_Floor.y - block.height;
                block.velocityY = 0;
                blockonhousefloor = true;
            } else {
                blockonhousefloor = false;
            }
        }
        else if (minOverlapBlock === overLapBottomBlock) {
            block.y = House_Floor.y + House_Floor.height;
            block.velocityY = 0;
        }
        else if (minOverlapBlock === overLapLeftBlock) {
            block.x = House_Floor.x - block.width;
        }
        else if (minOverlapBlock === overLapRightBlock) {
            block.x = House_Floor.x + House_Floor.width;
        }
    } else {
        blockonhousefloor = false;
    }
}

update();