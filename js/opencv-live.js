let liveCap, liveFrame, hsvFrame, mask, liveResult;
let lowBound, highBound;
let isLive = false;

function opencv_live(videoElement) {
    const outputCanvas = document.getElementById('opencv-output');
    
    // บังคับยัด Attribute กว้าง/ยาว
    videoElement.width = videoElement.videoWidth || 640;
    videoElement.height = videoElement.videoHeight || 480;
    outputCanvas.width = videoElement.width;
    outputCanvas.height = videoElement.height;

    // จองหน่วยความจำให้ OpenCV (ทำครั้งเดียวเพื่อป้องกัน Memory Leak)
    if (!liveCap) {
        liveCap = new cv.VideoCapture(videoElement);
        liveFrame = new cv.Mat(outputCanvas.height, outputCanvas.width, cv.CV_8UC4);
        hsvFrame = new cv.Mat(outputCanvas.height, outputCanvas.width, cv.CV_8UC3); // โหมดสี HSV
        mask = new cv.Mat(outputCanvas.height, outputCanvas.width, cv.CV_8UC1);      // ขาวดำ
        liveResult = new cv.Mat(outputCanvas.height, outputCanvas.width, cv.CV_8UC4); // โปร่งใสได้
    }

    isLive = true;
    processLiveVideo();
}

function processLiveVideo() {
    if (!isLive) return;

    try {
        liveCap.read(liveFrame);
        
        // 1. แปลงสีจาก RGBA เป็น RGB จากนั้นแปลงเป็น HSV เพื่อตรวจจับสีเขียว
        cv.cvtColor(liveFrame, hsvFrame, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsvFrame, hsvFrame, cv.COLOR_RGB2HSV);

        // 2. กำหนดช่วงสีเขียว (HSV Range) - **คุณอาจต้องปรับตัวเลขนี้ให้ตรงกับเฉดสีผ้าและแสงในห้องคุณ**
        // เปลี่ยนตัวเลข [35, 50, 50, 0] ให้กว้างขึ้นเพื่อกินพื้นที่สีเขียวซีดๆ และเขียวมืดๆ
        lowBound = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), [30, 25, 10, 0]);

        // ขยายขอบเขตสีเขียวให้สุดทาง
        highBound = new cv.Mat(hsvFrame.rows, hsvFrame.cols, hsvFrame.type(), [90, 255, 255, 0]);

        // 3. จับคู่สีและสร้างหน้ากาก (Mask)
        cv.inRange(hsvFrame, lowBound, highBound, mask);
        
        // 4. สลับหน้ากาก (Invert) ให้สิ่งที่ "ไม่ใช่สีเขียว" เป็นสีขาว (ถูกเก็บไว้) และสีเขียวกลายเป็นสีดำ (ถูกลบ)
        cv.bitwise_not(mask, mask);

        // 5. นำภาพดั้งเดิมมาแปะทับลงบนกระดานโปร่งใส โดยอิงจากหน้ากาก
        liveResult.setTo(new cv.Scalar(0, 0, 0, 0));
        liveFrame.copyTo(liveResult, mask);

        // 6. ส่งภาพไปที่ Canvas
        cv.imshow('opencv-output', liveResult);
        
        // ล้างหน่วยความจำชั่วคราว ป้องกันเบราว์เซอร์ค้าง
        lowBound.delete();
        highBound.delete();
        
        requestAnimationFrame(processLiveVideo);
    } catch (err) {
        console.error("OpenCV Chroma Key Error: ", err);
        requestAnimationFrame(processLiveVideo);
    }
}

function stopOpenCVLiveProcessing() {
    isLive = false;
}