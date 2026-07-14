function Geometric_Shape(shapeName) {
    isAutoSpinning = true; 
    let baseModel; 
    
    // ประกาศ Material หลักแค่ตัวเดียว สำหรับรูปทรงที่ต้องการแค่สีเดียว (ประหยัด Memory สูงสุด)
    const Material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffcc, 
        roughness: 0.2, 
        metalness: 0.8 
    });

    switch (shapeName) {
        // --- กลุ่มรูปทรงสีเดี่ยว (ใช้ Material ร่วมกัน) ---
        case "Cube":
            baseModel = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), Material);
            break;

        case "Torus":
            baseModel = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.5, 16, 100), Material);
            break;

        case "TrefoilKnot":
            baseModel = new THREE.Mesh(new THREE.TorusKnotGeometry(), Material);
            break;

        case "FigureEightPolynomialKnot":
            const curveFig8 = new THREE.Curves.FigureEightPolynomialKnot(0.3);
            const geoFig8 = new THREE.TubeGeometry(curveFig8, 64, 0.3, 8, false);
            baseModel = new THREE.Mesh(geoFig8, Material);
            baseModel.scale.set(0.05, 0.05, 0.05);
            break;

        case "Dodecahedron":
            baseModel = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), Material);
            break;

        case "Octahedron":
            baseModel = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), Material);
            break;

        case "CinquefoilKnot":
            baseModel = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32, 5, 2), Material);
            break;

        case "HeartCurve":
            const curveHeart = new THREE.Curves.HeartCurve();
            const geoHeart = new THREE.TubeGeometry(curveHeart, 100, 1.0, 16, true);
            geoHeart.scale(0.15, 0.15, 0.15);
            baseModel = new THREE.Mesh(geoHeart, Material);
            break;

        case "VivianiCurve":
            const curveViviani = new THREE.Curves.VivianiCurve();
            const geoViviani = new THREE.TubeGeometry(curveViviani, 100, 1.0, 8, true);
            geoViviani.scale(0.15, 0.15, 0.15);
            baseModel = new THREE.Mesh(geoViviani, Material);
            break;

        case "ComplexKnot":
            baseModel = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.08, 300, 16, 13, 8), Material);
            break;

        case "ThreeTorus":
            baseModel = new THREE.Group();
            for (let i = 0; i < 3; i++) {
                const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 32, 64), Material);
                const angle = (i * 120) * (Math.PI / 180);
                torus.position.x = Math.cos(angle) * 1.5;
                torus.position.y = Math.sin(angle) * 1.5;
                baseModel.add(torus);
            }
            baseModel.scale.set(0.6, 0.6, 0.6);
            break;

        // --- กลุ่มรูปทรงพิเศษ (ต้องมี Material เฉพาะตัว) ---
        case "GrannyKnot":
            const curveGranny = new THREE.Curves.GrannyKnot();
            const geoGranny = new THREE.TubeGeometry(curveGranny, 100, 2, 8, true);
            const matGranny = new THREE.MeshStandardMaterial({ color: 0x00ffcc, roughness: 0.1, metalness: 0.8, wireframe: true });
            baseModel = new THREE.Mesh(geoGranny, matGranny);
            baseModel.scale.set(0.05, 0.05, 0.05);
            break;

        case "Icosahedron":
            const geoIcosa = new THREE.IcosahedronGeometry(1.5, 0);
            const matIcosa = new THREE.MeshStandardMaterial({ color: 0x00ffcc, wireframe: true, emissive: 0x004422 });
            baseModel = new THREE.Mesh(geoIcosa, matIcosa);
            break;

        case "NewShape":
            baseModel = new THREE.Group();
            const coreGeometry = new THREE.IcosahedronGeometry(1.5, 0); 
            const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true, transparent: true, opacity: 0.9 });
            const outerWire = new THREE.Mesh(coreGeometry, wireMaterial);
            baseModel.add(outerWire); 

            const innerMaterial = new THREE.MeshBasicMaterial({ color: 0x0055ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
            const innerCore = new THREE.Mesh(coreGeometry, innerMaterial);
            innerCore.scale.set(0.6, 0.6, 0.6); 
            baseModel.add(innerCore); 
            break;

        case "DNAPair":
            baseModel = new THREE.Group(); 
            const strandsCount = 40;   
            const climb = 0.25;        
            const radius = 1.2;        
            const speed = 0.5;         

            const barGeometry = new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 8);
            const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            
            // DNA ต้องการ 2 สีเพื่อแสดงเกลียวคู่กับแกนเชื่อม
            const matRedDNA = new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.2, metalness: 0.8 });
            const matBlueDNA = new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.2, metalness: 0.8 }); 

            for (let i = 0; i < strandsCount; i++) {
                const angle = i * speed;
                const yPos = (i - strandsCount / 2) * climb; 

                const x1 = Math.sin(angle) * radius;
                const z1 = Math.cos(angle) * radius;
                const x2 = Math.sin(angle + Math.PI) * radius; 
                const z2 = Math.cos(angle + Math.PI) * radius;

                const bar = new THREE.Mesh(barGeometry, matRedDNA);
                bar.position.set((x1 + x2) / 2, yPos, (z1 + z2) / 2);
                bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1 - x2, 0, z1 - z2).normalize());
                baseModel.add(bar);

                const ball1 = new THREE.Mesh(sphereGeometry, matBlueDNA);
                ball1.position.set(x1, yPos, z1);
                baseModel.add(ball1);

                const ball2 = new THREE.Mesh(sphereGeometry, matBlueDNA);
                ball2.position.set(x2, yPos, z2);
                baseModel.add(ball2);
            }
            baseModel.rotation.x = 0.3;
            break;

        case "KleinBottle":
            const uSegments = 100;
            const vSegments = 40;
            const geoKlein = new THREE.BufferGeometry();
            const vertices = [];
            const indices = [];

            for (let i = 0; i <= uSegments; i++) {
                const u = (i / uSegments) * Math.PI * 2;
                for (let j = 0; j <= vSegments; j++) {
                    const v = (j / vSegments) * Math.PI * 2;
                    const r = 4 * (1 - Math.cos(u) / 2);
                    let x, y, z;
                    
                    if (u < Math.PI) {
                        x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
                        z = 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
                    } else {
                        x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
                        z = 16 * Math.sin(u);
                    }
                    y = r * Math.sin(v);

                    vertices.push(x * 0.1, y * 0.1, z * 0.1); 
                }
            }

            for (let i = 0; i < uSegments; i++) {
                for (let j = 0; j < vSegments; j++) {
                    const a = i * (vSegments + 1) + j;
                    const b = (i + 1) * (vSegments + 1) + j;
                    const c = i * (vSegments + 1) + (j + 1);
                    const d = (i + 1) * (vSegments + 1) + (j + 1);
                    indices.push(a, b, d);
                    indices.push(a, d, c);
                }
            }

            geoKlein.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geoKlein.setIndex(indices);
            geoKlein.computeVertexNormals();

            // ต้องมี DoubleSide และ Transparent 
            const matKlein = new THREE.MeshStandardMaterial({ color: 0x00ffcc, roughness: 0.1, metalness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
            baseModel = new THREE.Mesh(geoKlein, matKlein);
            break;

        case "ApollonianGasket":
            baseModel = new THREE.Group();
            const matLine = new THREE.LineBasicMaterial({ color: 0xff3366 });

            function createCircle(x, y, r) {
                const geoCircle = new THREE.CircleGeometry(r, 128);
                const edges = new THREE.EdgesGeometry(geoCircle);
                const circle = new THREE.LineLoop(edges, matLine);
                circle.position.set(x, y, 0);
                baseModel.add(circle);
            }

            createCircle(0, 0, 2); 
            createCircle(0, 1, 1);
            createCircle(0, -1, 1);
            createCircle(1, 0, Math.sqrt(2) - 1);
            createCircle(-1, 0, Math.sqrt(2) - 1);
            
            baseModel.scale.set(0.8, 0.8, 0.8);
            break;


        case "QuantumFluids":
            // สร้างพื้นผิวคลื่นควอนตัม (Wave Function Surface) จากสมการคลื่น
            const waveGeo = new THREE.ParametricGeometry((u, v, target) => {
                const r = 1.5;
                const x = (u - 0.5) * r * 2;
                const z = (v - 0.5) * r * 2;
                // สมการไซน์ซ้อนไซน์จำลองคลื่นรบกวนในของไหลควอนตัม (Quantum Interference)
                const y = Math.sin(x * 4) * Math.cos(z * 4) * 0.4; 
                target.set(x, y, z);
            }, 30, 30);

            const matFluidEq = new THREE.MeshStandardMaterial({ 
                color: 0x3b82f6, 
                wireframe: true, 
                emissive: 0x1d4ed8,
                side: THREE.DoubleSide
            });
            baseModel = new THREE.Mesh(waveGeo, matFluidEq);
            break;
        default:
            console.error("cant find the shape error:", shapeName);
            return; 
    }

    Hologram_Clipping(baseModel);
}