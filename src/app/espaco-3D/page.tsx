"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Separator } from "@/src/ui/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/src/ui/components/ui/toggle-group";
import Header from "@/src/ui/modules/space3D_page/header";
import { Info, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Espaco3D() {
    const [isRotate, setIsRotate] = useState(true);
    const [isInfo, setIsInfo] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100);

    const sceneContainerRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const isRotateRef = useRef(isRotate);

    const BASE_DIST = 4;

    const tweenStart = useRef(new THREE.Vector3());
    const tweenTarget = useRef(new THREE.Vector3(0, 0.4, BASE_DIST));
    const tweenCubeRot = useRef<THREE.Euler | null>(null);
    const tweenCubeRotStart = useRef(new THREE.Euler());
    const tweenProgress = useRef(1);

    const computeZoom = (camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
        const d = camera.position.distanceTo(controls.target);
        return Math.round(THREE.MathUtils.clamp((BASE_DIST / d) * 100, 60, 220));
    };

    const startTween = (x: number, y: number, z: number, cubeRot?: THREE.Euler) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;
        tweenStart.current.copy(camera.position);
        tweenTarget.current.set(x, y, z);
        if (cubeRot && cubeRef.current) {
            tweenCubeRotStart.current.copy(cubeRef.current.rotation);
            tweenCubeRot.current = cubeRot;
        } else {
            tweenCubeRot.current = null;
        }
        tweenProgress.current = 0;
        controls.enabled = false;
    };

    const goTo = (x: number, y: number, z: number, cx = 0, cy = 0, cz = 0) => {
        const cube = cubeRef.current;
        if (!cube) {
            startTween(x, y, z, new THREE.Euler(cx, cy, cz));
            return;
        }
        const ref = tweenProgress.current < 1 && tweenCubeRot.current ? tweenCubeRot.current : cube.rotation;
        const shortest = (cur: number, tgt: number) => {
            let diff = (tgt - cur) % (Math.PI * 2);
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;
            return cur + diff;
        };
        startTween(x, y, z, new THREE.Euler(shortest(ref.x, cx), shortest(ref.y, cy), shortest(ref.z, cz)));
    };

    const zoomByStep = (percentDelta: number) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;
        const refPos = tweenProgress.current < 1 ? tweenTarget.current : camera.position;
        const currentDist = refPos.distanceTo(controls.target);
        const currentZoom = (BASE_DIST / currentDist) * 100;
        const newZoom = THREE.MathUtils.clamp(currentZoom + percentDelta, 60, 220);
        const newDist = THREE.MathUtils.clamp(BASE_DIST / (newZoom / 100), controls.minDistance, controls.maxDistance);
        const dir = camera.position.clone().sub(controls.target).normalize();
        const target = controls.target.clone().addScaledVector(dir, newDist);
        startTween(target.x, target.y, target.z);
    };

    const resetZoom = () => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;
        const dir = camera.position.clone().sub(controls.target).normalize();
        const target = controls.target.clone().addScaledVector(dir, BASE_DIST);
        startTween(target.x, target.y, target.z);
    };

    const resetCamera = () => goTo(0, 0.4, BASE_DIST);

    useEffect(() => {
        isRotateRef.current = isRotate;
    }, [isRotate]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const t = event.target as HTMLElement | null;
            const tag = t?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;

            if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                zoomByStep(10);
                return;
            }
            if (event.key === "-" || event.key === "_") {
                event.preventDefault();
                zoomByStep(-10);
                return;
            }
            if (event.key === "0") {
                event.preventDefault();
                resetCamera();
                return;
            }
            if (event.key.toLowerCase() === "r") {
                setIsRotate((p) => !p);
                return;
            }
            if (event.key.toLowerCase() === "i") {
                setIsInfo((p) => !p);
            }
        };

        globalThis.addEventListener("keydown", onKeyDown);
        return () => globalThis.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        const container = sceneContainerRef.current;

        if (!container) {
            return;
        }

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.copy(tweenTarget.current);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
        renderer.domElement.style.cursor = "grab";
        renderer.domElement.style.touchAction = "none";
        renderer.domElement.style.userSelect = "none";
        renderer.domElement.draggable = false;
        container.appendChild(renderer.domElement);

        const handleCanvasDragStart = (event: DragEvent) => {
            event.preventDefault();
        };

        renderer.domElement.addEventListener("dragstart", handleCanvasDragStart);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 1.82;
        controls.maxDistance = 6.67;
        controls.target.set(0, 0, 0);
        controls.dampingFactor = 0.08;

        cameraRef.current = camera;
        controlsRef.current = controls;

        const handleControlStart = () => {
            renderer.domElement.style.cursor = "grabbing";
            if (tweenProgress.current < 1) {
                tweenProgress.current = 1;
                controls.enabled = true;
            }
        };

        const handleControlEnd = () => {
            renderer.domElement.style.cursor = "grab";
        };

        controls.addEventListener("start", handleControlStart);
        controls.addEventListener("end", handleControlEnd);

        const geometry = new THREE.BoxGeometry(2.5, 1.2, 1.2);
        const material = new THREE.MeshStandardMaterial({
            color: 0xfcc700,
            metalness: 0.2,
            roughness: 0.4,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubeRef.current = cube;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(2, 3, 4);
        scene.add(directionalLight);

        const resize = () => {
            const { clientWidth, clientHeight } = container;
            const safeHeight = Math.max(clientHeight, 1);

            camera.aspect = clientWidth / safeHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth, safeHeight);
        };

        resize();

        let frameId = 0;

        const animate = () => {
            frameId = globalThis.requestAnimationFrame(animate);

            if (isRotateRef.current && cubeRef.current && tweenProgress.current >= 1) {
                cubeRef.current.rotation.x += 0.0005;
                cubeRef.current.rotation.y += 0.004;
            }

            if (tweenProgress.current < 1) {
                tweenProgress.current = Math.min(tweenProgress.current + 0.028, 1);
                const p = tweenProgress.current;
                const t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                camera.position.lerpVectors(tweenStart.current, tweenTarget.current, t);

                if (tweenCubeRot.current && cubeRef.current) {
                    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
                        tweenCubeRotStart.current.x,
                        tweenCubeRot.current.x,
                        t
                    );
                    cubeRef.current.rotation.y = THREE.MathUtils.lerp(
                        tweenCubeRotStart.current.y,
                        tweenCubeRot.current.y,
                        t
                    );
                    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
                        tweenCubeRotStart.current.z,
                        tweenCubeRot.current.z,
                        t
                    );
                }

                if (tweenProgress.current >= 1) {
                    camera.position.copy(tweenTarget.current);
                    tweenCubeRot.current = null;
                    controls.enabled = true;
                    controls.update();
                }
            }

            controls.update();
            renderer.render(scene, camera);
            setZoomLevel(computeZoom(camera, controls));
        };

        animate();

        globalThis.addEventListener("resize", resize);

        return () => {
            globalThis.removeEventListener("resize", resize);
            globalThis.cancelAnimationFrame(frameId);
            controls.removeEventListener("start", handleControlStart);
            controls.removeEventListener("end", handleControlEnd);
            renderer.domElement.removeEventListener("dragstart", handleCanvasDragStart);
            controls.dispose();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            cameraRef.current = null;
            controlsRef.current = null;
            cubeRef.current = null;

            if (container.contains(renderer.domElement)) {
                renderer.domElement.remove();
            }
        };
    }, []);

    return (
        <div className="h-full bg-[#020618] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 z-50">
                <Header />
            </div>
            <div className="w-full h-full relative">
                <div ref={sceneContainerRef} className="absolute inset-0 z-0" />

                <div className="hidden md:flex md:w-60 p-4 bg-slate-900/80 backdrop-blur-md border-[1.5] rounded-2xl border-slate-800 absolute top-24 left-4 md:left-6 bottom-6 z-40 flex-col gap-5 overflow-y-auto">
                    <h2 className="text-white font-semibold text-sm md:text-base">Controles</h2>

                    <div>
                        <h3 className="text-slate-200/60 text-xs mb-1.5">Vistas Predefinidas</h3>
                        <div className="flex flex-col gap-2">
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => goTo(0, 0, BASE_DIST)}
                                    className="bg-slate-800 cursor-pointer hover:bg-slate-700 w-full text-xs md:text-sm"
                                >
                                    Frontal
                                </Button>
                            </motion.div>
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => goTo(BASE_DIST, 0, 0)}
                                    className="bg-slate-800 cursor-pointer hover:bg-slate-700 w-full text-xs md:text-sm"
                                >
                                    Lateral
                                </Button>
                            </motion.div>
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => goTo(0.001, BASE_DIST, 0.001)}
                                    className="bg-slate-800 cursor-pointer hover:bg-slate-700 w-full text-xs md:text-sm"
                                >
                                    Superior
                                </Button>
                            </motion.div>
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => goTo(3, 2.2, 3)}
                                    className="bg-slate-800 cursor-pointer hover:bg-slate-700 w-full text-xs md:text-sm"
                                >
                                    Isométrica
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-slate-200/60 text-xs mb-1.5">Zoom</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => zoomByStep(-10)}
                                    className="bg-slate-800 hover:bg-slate-700 cursor-pointer w-full"
                                >
                                    <ZoomOut size={16} />
                                </Button>
                            </motion.div>

                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={resetZoom}
                                    className="bg-slate-800 hover:bg-slate-700 cursor-pointer w-full text-xs"
                                >
                                    {zoomLevel}%
                                </Button>
                            </motion.div>

                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => zoomByStep(10)}
                                    className="bg-slate-800 hover:bg-slate-700 cursor-pointer w-full"
                                >
                                    <ZoomIn size={16} />
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-slate-200/60 text-xs mb-1.5">Opções</h3>
                        <ToggleGroup
                            type="multiple"
                            orientation="vertical"
                            spacing={1}
                            value={[...(isRotate ? ["rotate"] : []), ...(isInfo ? ["info"] : [])]}
                            onValueChange={(vals) => {
                                setIsRotate(vals.includes("rotate"));
                                setIsInfo(vals.includes("info"));
                            }}
                            className="flex flex-col gap-3.5 w-full"
                        >
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <ToggleGroupItem
                                    className="w-full flex justify-between cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs data-[state=on]:bg-yellow-primary"
                                    value="rotate"
                                >
                                    <span
                                        className={`flex gap-2 items-center ${isRotate ? "text-black" : "text-slate-400"}`}
                                    >
                                        <RotateCw size={16} /> Auto-Rotação
                                    </span>
                                    <span className={isRotate ? "text-black" : "text-slate-400"}>(R)</span>
                                </ToggleGroupItem>
                            </motion.div>
                            <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                <ToggleGroupItem
                                    className="w-full flex justify-between cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs data-[state=on]:bg-yellow-primary"
                                    value="info"
                                >
                                    <span
                                        className={`flex gap-2 items-center ${isInfo ? "text-black" : "text-slate-400"}`}
                                    >
                                        <Info size={16} /> Informações
                                    </span>
                                    <span className={isInfo ? "text-black" : "text-slate-400"}>(I)</span>
                                </ToggleGroupItem>
                            </motion.div>
                        </ToggleGroup>
                    </div>

                    <Separator className="bg-slate-600" />

                    <div className="text-white flex flex-col gap-2">
                        <h3 className="text-slate-200/60 text-xs mb-1">Atalhos do teclado</h3>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300/50">+/-</span>
                            <span className="text-slate-100/70">Zoom</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300/50">R</span>
                            <span className="text-slate-100/70">Auto-Rotação</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300/50">I</span>
                            <span className="text-slate-100/70">Informações</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300/50">0</span>
                            <span className="text-slate-100/70">Resetar</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:grid absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-fit max-w-[calc(100vw-2rem)] grid-cols-4 gap-3 sm:gap-4 rounded-xl border-[1.5] border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 md:px-8 py-3 sm:py-4">
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-yellow-primary font-bold text-lg sm:text-xl md:text-2xl">
                            40m<sup>2</sup>
                        </span>
                        <p className="text-slate-300/50 text-xs">Área Total</p>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-yellow-primary font-bold text-lg sm:text-xl md:text-2xl">30+</span>
                        <p className="text-slate-300/50 text-xs">Equipamentos</p>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-yellow-primary font-bold text-lg sm:text-xl md:text-2xl">4</span>
                        <p className="text-slate-300/50 text-xs">Áreas</p>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-yellow-primary font-bold text-lg sm:text-xl md:text-2xl">30</span>
                        <p className="text-slate-300/50 text-xs">Pessoas</p>
                    </div>
                </div>
                {isInfo && (
                    <div className="hidden md:flex absolute w-60 p-4 bg-slate-900/80 backdrop-blur-md border-[1.5] rounded-2xl border-slate-800 right-4 md:right-6 top-24 bottom-6 z-40 flex-col gap-5 overflow-y-auto">
                        <h3 className="text-white font-semibold text-xs md:text-sm">Informações do Container</h3>

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Dimensão Externas</h4>
                            <p className="text-white text-[10px] md:text-xs">12m x 8m x 2.5m</p>
                        </div>

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Área Útil</h4>
                            <p className="text-white text-[10px] md:text-xs">
                                40m<sup>2</sup>
                            </p>
                        </div>

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Capacidade</h4>
                            <p className="text-white text-[10px] md:text-xs">30 pessoas</p>
                        </div>

                        <Separator className="bg-slate-600" />

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Equipamentos Internos</h4>
                            <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                                <li className="text-white text-[10px] md:text-xs">5 Impressoras 3D profissionais</li>
                                <li className="text-white text-[10px] md:text-xs">10 Headsets VR/AR</li>
                                <li className="text-white text-[10px] md:text-xs">15 Kits de robótica</li>
                                <li className="text-white text-[10px] md:text-xs">Lab de eletrônica completo</li>
                                <li className="text-white text-[10px] md:text-xs">
                                    20 Computadores de alta performance
                                </li>
                            </ul>
                        </div>

                        <Separator className="bg-slate-600" />

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Características</h4>
                            <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                                <li className="text-white text-[10px] md:text-xs">Climatização completa</li>
                                <li className="text-white text-[10px] md:text-xs">Iluminação LED inteligente</li>
                                <li className="text-white text-[10px] md:text-xs">Internet de alta velocidade</li>
                            </ul>
                        </div>
                    </div>
                )}

                {isInfo && (
                    <div className="flex md:hidden flex-col absolute inset-x-3 top-24 bottom-20 z-40 p-4 bg-slate-900/90 backdrop-blur-md border-[1.5] rounded-2xl border-slate-800 gap-5 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm">Informações do Container</h3>
                        </div>

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Dimensão Externas</h4>
                            <p className="text-white text-xs">12m x 8m x 2.5m</p>
                        </div>
                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Área Útil</h4>
                            <p className="text-white text-xs">
                                40m<sup>2</sup>
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Capacidade</h4>
                            <p className="text-white text-xs">30 pessoas</p>
                        </div>

                        <Separator className="bg-slate-600" />

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Equipamentos Internos</h4>
                            <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                                <li className="text-white text-xs">5 Impressoras 3D profissionais</li>
                                <li className="text-white text-xs">10 Headsets VR/AR</li>
                                <li className="text-white text-xs">15 Kits de robótica</li>
                                <li className="text-white text-xs">Lab de eletrônica completo</li>
                                <li className="text-white text-xs">20 Computadores de alta performance</li>
                            </ul>
                        </div>

                        <Separator className="bg-slate-600" />

                        <div>
                            <h4 className="text-slate-200/60 text-[10px] mb-1.5">Características</h4>
                            <ul className="flex flex-col gap-1.5 list-disc list-inside marker:text-yellow-primary">
                                <li className="text-white text-xs">Climatização completa</li>
                                <li className="text-white text-xs">Iluminação LED inteligente</li>
                                <li className="text-white text-xs">Internet de alta velocidade</li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex md:hidden absolute bottom-4 left-3 right-3 z-40 rounded-2xl border-[1.5] border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 py-2 gap-2">
                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Button
                            onClick={() => setIsRotate((p) => !p)}
                            className={`w-full flex items-center justify-center gap-1.5 text-xs cursor-pointer ${
                                isRotate
                                    ? "bg-yellow-primary text-black hover:bg-yellow-primary/90"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                        >
                            <RotateCw size={14} />
                            <span>Rotação</span>
                        </Button>
                    </motion.div>

                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Button
                            onClick={resetZoom}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                        >
                            {zoomLevel}%
                        </Button>
                    </motion.div>

                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <Button
                            onClick={() => setIsInfo((p) => !p)}
                            className={`w-full flex items-center justify-center gap-1.5 text-xs cursor-pointer ${
                                isInfo
                                    ? "bg-yellow-primary text-black hover:bg-yellow-primary/90"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                        >
                            <Info size={14} />
                            <span>Info</span>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
