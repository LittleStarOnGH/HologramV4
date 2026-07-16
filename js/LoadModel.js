function Load_Model(modelName) {

    const geometricShapes = [
    "Cube", "Torus", "TrefoilKnot", "FigureEightPolynomialKnot", 
    "NewShape", "CinquefoilKnot", "GrannyKnot", "Dodecahedron", 
    "Octahedron", "HeartCurve", "VivianiCurve", "Icosahedron", 
    "ComplexKnot", "DNAPair", "KleinBottle", "ThreeTorus", "ApollonianGasket", "QuantumFluids"];
    
    const checkGeometricShape = geometricShapes.includes(modelName);

    const checkLiveCam = (modelName === "LiveCamera"); 
    if (!checkGeometricShape && !checkLiveCam && !modelLibrary[modelName]) {
        console.error("model name not found:", modelName);
        return;
    }

    currentObjects = []; 
    mixers = [];
    
    if (hologramGroup) {
        while(hologramGroup.children.length > 0){ 
            hologramGroup.remove(hologramGroup.children[0]); 
        }
        hologramGroup.rotation.set(0, 0, 0); 
    }
    
    if (checkGeometricShape) {
        Geometric_Shape(modelName);
        return;
    }

    if (checkLiveCam) {
        startLiveCameraHologram();
        return;
    }
    const modelUrl = modelLibrary[modelName];

    loader.load(modelUrl, function (gltf) {
        const baseModel = gltf.scene;
        
        // --- NEW DRAGON FIX START ---
        baseModel.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false; 

                if (modelName === "Dragon2" && child.material) {
                    const originalTexture = child.material.map; 
                    
                    //  MeshStandardMaterial -> MeshBasicMaterial
                    child.material = new THREE.MeshBasicMaterial({
                        map: originalTexture, 
                        side: THREE.DoubleSide 
                    });
                
                }
            }
        });
        
        //dragon fix 
        baseModel.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(baseModel);
        const size = new THREE.Vector3();
        box.getSize(size); 

        let maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.0; 

        let automaticScale;

        // Manual scale override
        if (modelName === "Dragon2") {
            automaticScale = 0.5; 
        } else {
            if (maxDim < 0.001) {
                console.warn("Detected missing dimensions. Applying standard scale.");
                maxDim = 1.0; 
            }
            automaticScale = targetSize / maxDim;
        }
        
        baseModel.scale.set(automaticScale, automaticScale, automaticScale);

        
        Hologram_Clipping(baseModel);
            
           if (gltf.animations && gltf.animations.length > 0) {
                console.log("all dragons animation:", gltf.animations);
                const animationIndex = 0;

                // ลูปสร้าง Mixer และเล่นอนิเมชันให้โมเดลทั้ง 3 ด้านบนโฮโลแกรม
                currentObjects.forEach((obj) => {
                    const mixer = new THREE.AnimationMixer(obj);
                    if (gltf.animations[animationIndex]) {
                        const action = mixer.clipAction(gltf.animations[animationIndex]);
                        action.play();
                    }
                    mixers.push(mixer);
            });
}
        
        console.log("Successfully loaded 3 sides of " + modelName);
        
    }, 
    undefined, 
    function (error) {
        console.error("cant load the glb file", error);
    });
}