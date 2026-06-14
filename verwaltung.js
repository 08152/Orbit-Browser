let inventoryOpen = false;

// =========================
// CROSSHAIR
const crosshair = document.createElement("div");
crosshair.style.position = "absolute";
crosshair.style.left = "50%";
crosshair.style.top = "50%";
crosshair.style.width = "10px";
crosshair.style.height = "10px";
crosshair.style.transform = "translate(-50%, -50%)";
crosshair.style.border = "2px solid white";
crosshair.style.borderRadius = "2px";
crosshair.style.pointerEvents = "none";
document.body.appendChild(crosshair);

// =========================
// INVENTAR UI
const inv = document.createElement("div");
inv.style.position = "absolute";
inv.style.left = "50%";
inv.style.top = "50%";
inv.style.transform = "translate(-50%, -50%)";
inv.style.width = "600px";
inv.style.height = "350px";
inv.style.background = "rgba(0,0,0,0.85)";
inv.style.border = "2px solid white";
inv.style.display = "none";
inv.style.color = "white";
inv.style.fontFamily = "sans-serif";
inv.style.padding = "10px";
document.body.appendChild(inv);

// =========================
// HOTBAR (7 SLOTS)
const hotbar = document.createElement("div");
hotbar.style.position = "absolute";
hotbar.style.bottom = "20px";
hotbar.style.left = "50%";
hotbar.style.transform = "translateX(-50%)";
hotbar.style.display = "flex";
hotbar.style.gap = "6px";
document.body.appendChild(hotbar);

let selectedSlot = 1;

for(let i=1;i<=7;i++){

    const slot = document.createElement("div");
    slot.style.width = "42px";
    slot.style.height = "42px";
    slot.style.border = "2px solid white";
    slot.style.background = "rgba(0,0,0,0.4)";
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.innerText = i;

    hotbar.appendChild(slot);
}

// =========================
// SLOT WECHSEL
document.addEventListener("keydown", (e) => {

    const n = parseInt(e.key);

    if(n >= 1 && n <= 7){
        selectedSlot = n;
    }

    // INVENTAR TOGGLE (E)
    if(e.key.toLowerCase() === "e"){
        inventoryOpen = !inventoryOpen;
        inv.style.display = inventoryOpen ? "block" : "none";

        // Maus freigeben im Menü
        if(inventoryOpen){
            document.exitPointerLock?.();
        }
    }
});

// =========================
// BLOCK HIGHLIGHT (Raycast Preview)
const highlightBox = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01,1.01,1.01)),
    new THREE.LineBasicMaterial({ color: 0xffff00 })
);

scene.add(highlightBox);

// Raycaster
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0,0);

// =========================
// UPDATE LOOP HOOK
function updateUI(){

    // BLOCK UNDER CROSSHAIR
    raycaster.setFromCamera(center, camera);

    const hits = raycaster.intersectObjects(scene.children, false);

    if(hits.length > 0){

        const h = hits[0];

        highlightBox.position.copy(h.object.position);

        highlightBox.visible = true;

    } else {
        highlightBox.visible = false;
    }

    // INVENTAR TEXT
    if(inventoryOpen){

        inv.innerHTML = `
        <h3>Inventar</h3>
        <p>Blöcke: Grass (Demo)</p>
        <p>Slot: ${selectedSlot}</p>
        <p style="opacity:0.7">E zum schließen</p>
        `;
    }
}

// Hook in main loop
window.updateUI = updateUI;
