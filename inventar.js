const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedBlock = 1;

// 7 Slots (Hotbar)
const hotbar = [
    "grass",
    "grass",
    "grass",
    "grass",
    "grass",
    "grass",
    "grass"
];

// =========================
// HOTBAR UI (einfach)
const ui = document.createElement("div");
ui.style.position = "absolute";
ui.style.bottom = "20px";
ui.style.left = "50%";
ui.style.transform = "translateX(-50%)";
ui.style.display = "flex";
ui.style.gap = "6px";
document.body.appendChild(ui);

for(let i=0;i<7;i++){

    const slot = document.createElement("div");

    slot.style.width = "40px";
    slot.style.height = "40px";
    slot.style.border = "2px solid white";
    slot.style.background = "rgba(0,0,0,0.4)";
    slot.style.color = "white";
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.innerText = i+1;

    ui.appendChild(slot);
}

// Slot wechseln
document.addEventListener("keydown", (e) => {

    const n = parseInt(e.key);

    if(n >= 1 && n <= 7){
        selectedBlock = n;
    }
});

// =========================
// RAYCAST HELPERS

function getTargetBlock(){

    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);

    const intersects = raycaster.intersectObjects(
        scene.children,
        false
    );

    if(intersects.length > 0)
        return intersects[0];

    return null;
}

// =========================
// BLOCK ABBRECHEN

function breakBlock(){

    const hit = getTargetBlock();

    if(!hit) return;

    const obj = hit.object;

    const key =
        `${Math.floor(obj.position.x)},${Math.floor(obj.position.y)},${Math.floor(obj.position.z)}`;

    worldBlocks.delete(key);
    scene.remove(obj);
}

// =========================
// BLOCK SETZEN

function placeBlock(){

    const hit = getTargetBlock();

    if(!hit) return;

    const pos = hit.point;
    const normal = hit.face.normal;

    const x = Math.floor(pos.x + normal.x * 0.5);
    const y = Math.floor(pos.y + normal.y * 0.5);
    const z = Math.floor(pos.z + normal.z * 0.5);

    const key = `${x},${y},${z}`;

    if(worldBlocks.has(key)) return;

    const cube = new THREE.Mesh(
        blockGeometry,
        blockMaterial
    );

    cube.position.set(x,y,z);

    scene.add(cube);
    worldBlocks.set(key, cube);
}

// =========================
// INPUT

document.addEventListener("mousedown", (e) => {

    if(e.button === 0){
        breakBlock(); // linksklick
    }

    if(e.button === 2){
        placeBlock(); // rechtsklick
    }
});

// rechtsklick menü deaktivieren
document.addEventListener("contextmenu", e => e.preventDefault());
