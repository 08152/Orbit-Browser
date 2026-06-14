const skin = new THREE.Group();
scene.add(skin);

// =========================
// MATERIAL (blau wie Minecraft Skin)
const skinMat = new THREE.MeshLambertMaterial({
    color: 0x1e90ff
});

// =========================
// KOPF
const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    skinMat
);
head.position.y = 1.6;
skin.add(head);

// =========================
// KÖRPER
const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.4),
    skinMat
);
body.position.y = 0.9;
skin.add(body);

// =========================
// ARME
const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);

const leftArm = new THREE.Mesh(armGeo, skinMat);
leftArm.position.set(-0.55, 1.0, 0);
skin.add(leftArm);

const rightArm = new THREE.Mesh(armGeo, skinMat);
rightArm.position.set(0.55, 1.0, 0);
skin.add(rightArm);

// =========================
// BEINE
const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);

const leftLeg = new THREE.Mesh(legGeo, skinMat);
leftLeg.position.set(-0.2, 0.2, 0);
skin.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeo, skinMat);
rightLeg.position.set(0.2, 0.2, 0);
skin.add(rightLeg);

// =========================
// UPDATE FUNCTION
function updateSkin() {

    // Spieler folgt Kamera POSITION
    skin.position.x = camera.position.x;
    skin.position.y = camera.position.y - 1.6;
    skin.position.z = camera.position.z;

    // nur Y-Rotation (links/rechts)
    skin.rotation.y = rotY;
}

// =========================
// EXPORT HOOK
window.updateSkin = updateSkin;
