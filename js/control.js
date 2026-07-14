let guestPeer; 
let connection;

function Connect_Screen() {

    const roomCode = document.getElementById("room-code-input").value.trim();
    
    if (!roomCode) {
        alert("Please enter the 4-digit room code first!");
        return;
    }
    
    guestPeer = new Peer();
    guestPeer.on("open", function () {
        const peerID = roomCode;
        connection = guestPeer.connect(peerID); 
        
        connection.on("open", function () {
            
            // สลับหน้าจอ UI ของคุณ
            document.getElementById('mode').classList.add('hidden');
            document.getElementById('controller-view').classList.remove('hidden');
            
            setupTouchpad("touchpad", "rotateTouchpad");
            setupTouchpad("touchpad-2", "rotateTouchpad-2"); 
        });

        connection.on("error", function(err) {
            alert("Connect failed. Please check the code.");
        });
    });
}

function setupTouchpad(elementId, actionName) {
    const touchpad = document.getElementById(elementId);
    if (!touchpad) {
        return;
    }

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    const handleMovement = (currentX, currentY) => {
        let deltaX = currentX - previousX;
        let deltaY = currentY - previousY;
        previousX = currentX;
        previousY = currentY;

        if (connection && connection.open) {
            // ส่ง Action ตามที่ถูกเรียกใช้งาน (rotateTouchpad หรือ rotateLocal)
            connection.send({ 
                action: actionName, 
                valueX: deltaX * 0.1,
                valueY: deltaY * 0.1
            });
        }
    };

    touchpad.addEventListener("touchstart", (event) => {
        isDragging = true;
        previousX = event.touches[0].clientX;
        previousY = event.touches[0].clientY;
    }, { passive: false });

    touchpad.addEventListener("touchmove", function(e) {
        if (!isDragging) return;
        e.preventDefault(); 
        handleMovement(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: false});

    touchpad.addEventListener("touchend", function() { isDragging = false; });

    // เผื่อใช้เมาส์ลากบนคอมพิวเตอร์ (Mouse Events)
    touchpad.addEventListener("mousedown", function(e) {
        isDragging = true;
        previousX = e.clientX;
        previousY = e.clientY;
    });
    touchpad.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        handleMovement(e.clientX,e.clientY);
    });
    touchpad.addEventListener("mouseup", function() { isDragging = false; });
    touchpad.addEventListener("mouseleave", function() { isDragging = false; });
}

function Command(actionName, value) {

    if (connection && connection.open){
        connection.send({action: actionName, value:parseFloat(value)})
    }
}


function Select_Model(modelName) {
    if (connection && connection.open) {
        const command = {
            action: "changeModel",
            value: modelName // ส่งชื่อคีย์ files.
        };
        connection.send(command);
        console.log("Sent command:", command);
    } else {
        alert("Remote disconnected. Please connect again.");
    }
}

function Change_Color(hexColor) {
    if (connection && connection.open) {
        connection.send({ action: "changeColor", value: hexColor });
    }
}

function Toggle_Code_Box() {
    if (connection && connection.open) {
        connection.send({ action: "toggleCodeBox" });
    }
}

function Toggle_Lines() {
    if (connection && connection.open) {
        connection.send({ action: "toggleLines" });
    }
}

function Toggle_Guest_Box() {
    document.getElementById("guest-code-box").classList.toggle("hidden");
}

function Toggle_Lang_Menu() {
    if (connection && connection.open) {
        connection.send({ action: "toggleLangMenu" });
    }
}

function Toggle_Color_Picker() {
    const modal = document.getElementById('color-picker-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// iro.js
document.addEventListener("DOMContentLoaded", function() {
    const colorContainer = document.getElementById("color-wheel-container");
    
    if (colorContainer && typeof iro !== 'undefined') {
        
        var colorPicker = new iro.ColorPicker(colorContainer, {
            width: 220, 
            color: "#00ffcc", 
            borderWidth: 2,
            borderColor: "#ffffff",
            layout: [
                { 
                    component: iro.ui.Wheel,
                },
                { 
                    component: iro.ui.Slider, 
                    options: { sliderType: 'value' }
                }
            ]
        });

        colorPicker.on('color:change', function(color) {
            Change_Color(color.hexString);
        });
    }
});
function Switch_Display_Mode(mode) {
    const threeContainer = document.getElementById("screen-view"); 
    const opencvContainer = document.getElementById("opencv-screen-view"); 
    
    if (mode === 'threejs') {
        threeContainer.classList.remove('hidden');
        opencvContainer.classList.add('hidden');
        isAutoSpinning = true;
        
        // แก้ชื่อฟังก์ชันให้ตรงกับในไฟล์ opencv-mapping.js
        stopOpenCVMapping(); 
        
        // ถ้ายังไม่ได้สร้างโลก 3D ให้สร้างใหม่
        if (typeof scene === 'undefined' || !scene) { init(); } 
        
    } else if (mode === 'opencv') {
        threeContainer.classList.add('hidden');
        opencvContainer.classList.remove('hidden');
        isAutoSpinning = false;
        
        startOpenCVMapping(); 
    }
}