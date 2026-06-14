let velocity = new THREE.Vector3(0,0,0);

const player = {
    height: 1.8,
    radius: 0.3,
    onGround: false
};

// einfache Kollisions-Abfrage gegen Blocks
function isSolid(x,y,z){
    return worldBlocks.has(`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`);
}

// prüft ob Spieler in Block steckt
function collides(nx, ny, nz){

    const px = nx;
    const py = ny;
    const pz = nz;

    // 8 Punkte (AABB Hitbox)
    const checks = [
        [px - player.radius, py, pz - player.radius],
        [px + player.radius, py, pz - player.radius],
        [px - player.radius, py, pz + player.radius],
        [px + player.radius, py, pz + player.radius],

        [px, py + player.height, pz],
        [px, py, pz]
    ];

    for(const c of checks){
        if(isSolid(c[0], c[1], c[2]))
            return true;
    }

    return false;
}

// Bewegung + Gravitation
function updatePhysics(){

    velocity.y -= 0.02; // gravity

    let nextX = camera.position.x + velocity.x;
    let nextY = camera.position.y + velocity.y;
    let nextZ = camera.position.z + velocity.z;

    player.onGround = false;

    // X Bewegung
    if(!collides(nextX, camera.position.y, camera.position.z)){
        camera.position.x = nextX;
    }

    // Z Bewegung
    if(!collides(camera.position.x, camera.position.y, nextZ)){
        camera.position.z = nextZ;
    }

    // Y Bewegung
    if(!collides(camera.position.x, nextY, camera.position.z)){
        camera.position.y = nextY;
    } else {
        velocity.y = 0;
        player.onGround = true;
    }

    // Boden „kleben“
    if(player.onGround){
        velocity.y = 0;
    }
}

// Steuerung
document.addEventListener("keydown", (e) => {

    const speed = 0.15;

    const forward = new THREE.Vector3(
        Math.sin(camera.rotation.y),
        0,
        Math.cos(camera.rotation.y)
    );

    const right = new THREE.Vector3(
        Math.sin(camera.rotation.y + Math.PI/2),
        0,
        Math.cos(camera.rotation.y + Math.PI/2)
    );

    if(e.key.toLowerCase() === "w")
        velocity.addScaledVector(forward, -speed);

    if(e.key.toLowerCase() === "s")
        velocity.addScaledVector(forward, speed);

    if(e.key.toLowerCase() === "a")
        velocity.addScaledVector(right, -speed);

    if(e.key.toLowerCase() === "d")
        velocity.addScaledVector(right, speed);

    if(e.key === " " && player.onGround)
        velocity.y = 0.35;
});

// wird von index.html aufgerufen
window.updateChunks = (function(old){
    return function(){
        old?.();
        updatePhysics();
    };
})(window.updateChunks);
