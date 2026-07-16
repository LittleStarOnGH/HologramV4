const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0); 

function animate() {
    requestAnimationFrame(animate);

    // 1. คำนวณเวลาที่ผ่านไปนับจากเฟรมที่แล้ว (Delta time)
    const delta = clock.getDelta();

    //AnimationMixer updates frame according to the time
    if (mixers && mixers.length > 0) {
        for (let i = 0; i < mixers.length; i++) {
            mixers[i].update(delta);
        }
    }

    if (isAutoSpinning && currentObjects.length > 0) {

        for (let i = 0; i < currentObjects.length; i++) {
            if (i === 0 || i === 1) {
    
                currentObjects[i].rotateOnWorldAxis(xAxis, 0.01);
            } else {
                currentObjects[i].rotateOnWorldAxis(yAxis, 0.01);
            }
        }
    }

    if (window.liveCanvasTexture) {
    window.liveCanvasTexture.needsUpdate = true;
}
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}