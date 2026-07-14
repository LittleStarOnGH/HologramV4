let peer;
let scene;
let camera;
let helperLeft, helperRight, helperTop;
let isHelperVisible = false; // ตั้งค่าเริ่มต้นให้ซ่อนไว้ก่อน
let renderer;
let objects;
let hologramGroup; // กลุ่มหลักสำหรับควบคุมโมเดลทั้ง 3 ด้าน
let currentObjects = [];
let mixers = []; // Array to hold AnimationMixers for each model
let clock = new THREE.Clock(); // Clock for animations
let isAutoSpinning = false;

const modelLibrary = {
    "sohn": "./models/sohn.glb",
    "artifact": "./models/artifact.glb",
    "dragon": "./models/dragon.glb",
    "astronaut": "./models/astronaut.glb"
};

let currentModel = "Cube"; // Default model
const angles = [0, 120, 240]; // องศาสำหรับจัดวางสามทิศทาง
const loader = new THREE.GLTFLoader();

function init() {
    const container = document.getElementById("hologram-container");
    if (!container) return;

    container.innerHTML = ''; // clear the old content

    //create black bg
    scene = new THREE.Scene();

    //การลบรอยหยัก, เปิดช่องโปร่งใส
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // ✅ ย้ายคำสั่งมาเปิดใช้งานตรงนี้! (หลังจากสร้าง renderer เสร็จแล้ว)
    renderer.localClippingEnabled = true; 

    //renderer.setClearColor(Colour code Hexadecimal, opacity 0-1 โปร่งใส และทึบ);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 0.6; 

    //เหมือนกับการเอา canvas ของ renderer ไปใส่ใน container ของ html
    container.appendChild(renderer.domElement);

    //create a camera and create the perspective of it (แกน Z) to the cenre point (0,0,0)
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    camera.position.set(0, 0, 20); //camera proscpective
    camera.lookAt(0, 0, 0);

    //create light for the glb model
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    
    directionalLight.position.set(0, 5, 5);
    scene.add(directionalLight);

    //add a group to hold the hologram models
    hologramGroup = new THREE.Group();
    scene.add(hologramGroup);
    
    Load_Model(currentModel);
    animate(); 
}

function Display_Screen() {   
    //hide the mode - add the hidden class in css
    document.getElementById('mode').classList.add('hidden');
    
    //remove hidden class in css
    document.getElementById('screen-view').classList.remove('hidden');
    
    //start the Three.js
    init(); 
    Start_Screen(); // Call the Start_Screen function to initiate the screen connection
}

function Start_Screen() {
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit room co
    const hostPeerID = roomCode;

    peer = new Peer(hostPeerID);

    peer.on('open', function (id) {
        console.log("Code: " + roomCode);
        
        //get the room code
        document.getElementById("hologram-room-number").innerText =roomCode;
    });    

    // this one still not working.. need to revisit and debug
    peer.on('connection', function (conn) {
        console.log("Guest connected with ID: " + conn.peer);
        conn.on('data', function (data) {


            if (data.action === "changeModel") {
                Load_Model(data.value);
            }
            
            else if (data.action === "rotateTouchpad") {
                if (hologramGroup) {
                    hologramGroup.rotation.z += data.valueX;
                }
            }
            else if (data.action === "rotateTouchpad-2") {
                // การหมุนด้วย Touchpad อันใหม่ สำหรับหมุนเฉพาะตัววัตถุ
                const xAxis = new THREE.Vector3(1, 0, 0); 
                const yAxis = new THREE.Vector3(0, 1, 0); 

                if (currentObjects && currentObjects.length > 0) {
                    for (let i = 0; i < currentObjects.length; i++) {
                        // หมุนรอบแกน Y (หันซ้าย-ขวา) ต้องใช้ระยะที่นิ้วปัดแนวนอน (valueX)
                        currentObjects[i].rotateOnWorldAxis(yAxis, data.valueX * 0.5);
                        
                        // หมุนรอบแกน X (คะมำ-หงายหลัง) ต้องใช้ระยะที่นิ้วปัดแนวตั้ง (valueY)
                        currentObjects[i].rotateOnWorldAxis(xAxis, data.valueY * 0.5);
                    } 
                }
            }
                        
            else if (data.action === "updateOffsetLR") {
                if (currentObjects && currentObjects.length === 3) {
                    currentObjects[0].position.x = -data.value; // ดันตัวซ้ายไปทางซ้าย
                    currentObjects[1].position.x = data.value;  // ดันตัวขวาไปทางขวา
                }
            }
            else if (data.action === "updateOffsetTop") {
                if (currentObjects && currentObjects.length === 3) {
                    currentObjects[2].position.y = data.value; // ดันตัวล่างขึ้นลงตามค่าที่ส่งมา
                }
            }

            else if (data.action === "updateScale") {
                if (currentObjects && currentObjects.length > 0) {
                    for (let i = 0; i < currentObjects.length; i++) {
                        // อัปเดตสเกล X, Y, Z พร้อมกัน
                        currentObjects[i].scale.set(data.value, data.value, data.value);
                    }
                }
            }
            else if (data.action === "updateSideY") {
                if (currentObjects && currentObjects.length === 3) {
                    currentObjects[0].position.y = data.value;
                    currentObjects[1].position.y = data.value;
                }
            }
            
            else if (data.action === "toggleLangMenu") {
                const langMenu = document.getElementById('lang-menu');
                if (langMenu) {
                    // ใช้ toggle เพื่อสลับการแสดงผล (ซ่อน/แสดง) แบบง่ายๆ
                    langMenu.classList.toggle('hidden');
                }
}
           
            // ... โค้ดรับคำสั่งเดิมของคุณ (rotateTouchpad, updateScale, ฯลฯ) ...

            // 1. รับคำสั่งเปลี่ยนสี
            else if (data.action === "changeColor") {
                if (currentObjects && currentObjects.length > 0) {
                    for (let i = 0; i < currentObjects.length; i++) {
                        // หากเป็นโมเดลที่เป็น Geometry พื้นฐาน (มี Material โดยตรง)
                        if (currentObjects[i].isMesh && currentObjects[i].material) {
                            currentObjects[i].material.color.set(data.value);
                        } 
                        // หากเป็นโมเดล GLTF ที่ซ้อนกันหลายชั้น
                        else {
                            currentObjects[i].traverse((child) => {
                                if (child.isMesh && child.material && child.material.color) {
                                    // เปลี่ยนสีเฉพาะวัสดุที่รองรับการเปลี่ยนสี
                                    child.material.color.set(data.value);
                                }
                            });
                        }
                    }
                }
            }

            // 2. รับคำสั่งเปิด/ปิด กล่องโค้ดบนจอ
            else if (data.action === "toggleCodeBox") {
                const codeBox = document.getElementById("room-code-display-box");
                if (codeBox) {
                    // สลับการตั้งค่า display ระหว่าง none (ซ่อน) และ block (แสดง)
                    if (codeBox.style.display === "none") {
                        codeBox.style.display = "block";
                    } else {
                        codeBox.style.display = "none";
                    }
                }
            }
            else if (data.action === "toggleLines") {
                isHelperVisible = !isHelperVisible; // สลับค่าระหว่าง true กับ false
                
                // อัปเดตสถานะการมองเห็นของเส้น (ถ้ามีเส้นถูกสร้างไว้แล้ว)
                if (helperLeft) helperLeft.visible = isHelperVisible;
                if (helperRight) helperRight.visible = isHelperVisible;
                if (helperTop) helperTop.visible = isHelperVisible;
            }
            
            else if (data.action === "switchMode") {
                Switch_Display_Mode(data.value);
            }
        });
    });
}


function Hologram_Clipping(baseModel) {
    //THREE.Vector3(x, y, z)
    const planeTopRight = new THREE.Plane(new THREE.Vector3(1, 1, 0).normalize(), 0);
    const planeTopLeft = new THREE.Plane(new THREE.Vector3(-1, 1, 0).normalize(), 0);
    const planeBottomRight = new THREE.Plane(new THREE.Vector3(1, -1, 0).normalize(), 0);
    const planeBottomLeft = new THREE.Plane(new THREE.Vector3(-1, -1, 0).normalize(), 0);

    // ลบเส้นเก่าเพื่อลดความซ้ำซ้อน
    if (helperLeft) scene.remove(helperLeft);
    if (helperRight) scene.remove(helperRight);
    if (helperTop) scene.remove(helperTop);

    // สร้างเส้น Helper ดูแกนกากบาท (X)
    helperLeft = new THREE.PlaneHelper(planeTopRight, 10, 0xff0000); 
    helperRight = new THREE.PlaneHelper(planeTopLeft, 10, 0x00ff00); 

    scene.add(helperLeft);
    scene.add(helperRight);
    
    // ------------------------------------------------
    const offsetX = 9.5; 
    const offsetY = 3.5; 
    const offsetSideY = -3.0;

    for (let i = 0; i < angles.length; i++) {
        let modelClone;
        if (typeof THREE.SkeletonUtils !== 'undefined') {
            modelClone = THREE.SkeletonUtils.clone(baseModel);
        } else {
            modelClone = baseModel.clone(); 
        }
        
        let currentClips = []; 

        if (i === 0) { // ฝั่งซ้าย
            modelClone.position.x = -offsetX;
            modelClone.position.y = offsetSideY; 
            modelClone.rotation.z = THREE.MathUtils.degToRad(-90);
            currentClips = [planeTopLeft, planeBottomLeft];
        } else if (i === 1) { // ฝั่งขวา
            modelClone.position.x = offsetX;
            modelClone.position.y = offsetSideY; 
            modelClone.rotation.z = THREE.MathUtils.degToRad(90);
            currentClips = [planeTopRight, planeBottomRight];
        } else if (i === 2) { // ฝั่งบน
            modelClone.position.x = 0; 
            modelClone.position.y = offsetY;
            modelClone.rotation.z = THREE.MathUtils.degToRad(180);
            currentClips = [planeTopLeft, planeTopRight];
        }

        // ลุยเจาะลึกเข้าไปในทุกชิ้นส่วนของโมเดลเพื่อจับใส่ระนาบตัด
        modelClone.traverse((child) => {
            if ((child.isMesh || child.isLine) && child.material) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => {
                        const newMat = mat.clone();
                        newMat.clippingPlanes = currentClips;
                        newMat.clipShadows = true;
                        return newMat;
                    });
                } else {
                    child.material = child.material.clone();
                    child.material.clippingPlanes = currentClips;
                    child.material.clipShadows = true;
                }
            }
        });

        hologramGroup.add(modelClone);
        currentObjects.push(modelClone);
    }
}
// ดักจับเมื่อผู้ใช้ย่อ/ขยายหน้าต่าง Browser
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    const container = document.getElementById("hologram-container");
    if (!container || !camera || !renderer) return;

    // 1. อัปเดตอัตราส่วน (Aspect Ratio) ของกล้องใหม่
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix(); // สั่งให้กล้องคำนวณมุมมองใหม่

    // 2. ปรับขนาดของตัว Render ให้เต็ม Container เท่าขนาดปัจจุบัน
    renderer.setSize(container.clientWidth, container.clientHeight);
}
