const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 3;

const loadedChunks = new Map();

// Chunk Struktur:
// cx,cz -> { blocks: [], meshes: [] }

function chunkKey(x,z){
    return `${x},${z}`;
}

// =========================
// HEIGHT GENERATION
function getHeight(x,z){

    return Math.floor(
        Math.sin(x * 0.08) * 4 +
        Math.cos(z * 0.08) * 4 +
        Math.sin((x+z) * 0.03) * 8
    );
}

// =========================
// BLOCK CREATE
function createBlock(x,y,z){

    const cube = new THREE.Mesh(
        blockGeometry,
        blockMaterial
    );

    cube.position.set(x,y,z);

    scene.add(cube);

    worldBlocks.set(`${x},${y},${z}`, cube);

    return cube;
}

// =========================
// CHUNK GENERATE
function generateChunk(cx,cz){

    const key = chunkKey(cx,cz);

    if(loadedChunks.has(key))
        return;

    const chunkData = {
        meshes: []
    };

    loadedChunks.set(key, chunkData);

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

                const cube = createBlock(wx,y,wz);
                chunkData.meshes.push(cube);
            }
        }
    }
}

// =========================
// CHUNK DELETE (WICHTIG)
function removeChunk(cx,cz){

    const key = chunkKey(cx,cz);

    const chunk = loadedChunks.get(key);

    if(!chunk) return;

    for(const mesh of chunk.meshes){

        const pos = mesh.position;
        const bKey = `${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}`;

        worldBlocks.delete(bKey);
        scene.remove(mesh);
    }

    loadedChunks.delete(key);
}

// =========================
// UPDATE CHUNKS (LOAD + UNLOAD)
function updateChunks(){

    const pcx = Math.floor(camera.position.x / CHUNK_SIZE);
    const pcz = Math.floor(camera.position.z / CHUNK_SIZE);

    const needed = new Set();

    // LOAD
    for(let x = pcx - RENDER_DISTANCE; x <= pcx + RENDER_DISTANCE; x++){
        for(let z = pcz - RENDER_DISTANCE; z <= pcz + RENDER_DISTANCE; z++){

            const key = chunkKey(x,z);
            needed.add(key);

            generateChunk(x,z);
        }
    }

    // UNLOAD
    for(const key of loadedChunks.keys()){

        if(!needed.has(key)){

            const [cx,cz] = key.split(",").map(Number);

            removeChunk(cx,cz);
        }
    }
}

// =========================
// INIT
function initChunks(){
    updateChunks();
}

window.initChunks = initChunks;
window.updateChunks = updateChunks;
