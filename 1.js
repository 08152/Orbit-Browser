const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 3;

const loadedChunks = new Map();

function getHeight(x,z){

return Math.floor(
    Math.sin(x * 0.08) * 4 +
    Math.cos(z * 0.08) * 4 +
    Math.sin((x+z) * 0.03) * 8
);

}

function chunkKey(cx,cz){
return cx + "," + cz;
}

function createBlock(x,y,z){

const cube = new THREE.Mesh(
    blockGeometry,
    blockMaterial
);

cube.position.set(x,y,z);

scene.add(cube);

worldBlocks.set(
    `${x},${y},${z}`,
    cube
);

return cube;

}

function generateChunk(cx,cz){

const key = chunkKey(cx,cz);

if(loadedChunks.has(key))
    return;

loadedChunks.set(key,true);

const startX = cx * CHUNK_SIZE;
const startZ = cz * CHUNK_SIZE;

for(let x=0;x<CHUNK_SIZE;x++){

    for(let z=0;z<CHUNK_SIZE;z++){

        const wx = startX + x;
        const wz = startZ + z;

        let h = getHeight(wx,wz);

        if(h < 1) h = 1;
        if(h > 20) h = 20;

        for(let y=0;y<=h;y++){

            createBlock(
                wx,
                y,
                wz
            );

        }
    }
}

}

function initChunks(){

updateChunks();

}

function updateChunks(){

const cx =
    Math.floor(
        camera.position.x / CHUNK_SIZE
    );

const cz =
    Math.floor(
        camera.position.z / CHUNK_SIZE
    );

for(
    let x = cx - RENDER_DISTANCE;
    x <= cx + RENDER_DISTANCE;
    x++
){

    for(
        let z = cz - RENDER_DISTANCE;
        z <= cz + RENDER_DISTANCE;
        z++
    ){

        generateChunk(x,z);

    }
}

}

window.initChunks = initChunks;
window.updateChunks = updateChunks;
