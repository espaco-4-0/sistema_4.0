"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
    ANIMATION,
    BASE_DIST,
    CAMERA,
    INITIAL_CAMERA_POSITION,
    ZOOM,
    addSceneLights,
    applyEulerLerp,
    computeZoom,
    createControls,
    createRenderer,
    disposeObject3D,
    easeInOutCubic,
    loadContainerModel,
    shortestAngleTarget,
} from "../../lib/space3D-utils";

export type InteractiveModelHandle = Readonly<{
    goTo: (x: number, y: number, z: number, cx?: number, cy?: number, cz?: number) => void;
    zoomByStep: (percentDelta: number) => void;
    resetZoom: () => void;
    resetCamera: () => void;
}>;

type InteractiveModelProps = Readonly<{
    isRotate: boolean;
    onZoomChange: (zoomLevel: number) => void;
}>;

const InteractiveModel = forwardRef<InteractiveModelHandle, InteractiveModelProps>(function InteractiveModel(
    { isRotate, onZoomChange },
    ref
) {
    const sceneContainerRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const isRotateRef = useRef(isRotate);
    const onZoomChangeRef = useRef(onZoomChange);

    const tweenStart = useRef(new THREE.Vector3());
    const tweenTarget = useRef(INITIAL_CAMERA_POSITION.clone());
    const tweenModelRotation = useRef<THREE.Euler | null>(null);
    const tweenModelRotationStart = useRef(new THREE.Euler());
    const tweenProgress = useRef(1);
    const lastZoomRef = useRef<number | null>(null);

    const startTween = (x: number, y: number, z: number, modelRotation?: THREE.Euler): void => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;

        if (!camera || !controls) return;

        tweenStart.current.copy(camera.position);
        tweenTarget.current.set(x, y, z);

        if (modelRotation && modelRef.current) {
            tweenModelRotationStart.current.copy(modelRef.current.rotation);
            tweenModelRotation.current = modelRotation;
        } else {
            tweenModelRotation.current = null;
        }

        tweenProgress.current = 0;
        controls.enabled = false;
    };

    const goTo = (x: number, y: number, z: number, cx = 0, cy = 0, cz = 0): void => {
        const model = modelRef.current;

        if (!model) {
            startTween(x, y, z, new THREE.Euler(cx, cy, cz));
            return;
        }

        const referenceRotation =
            tweenProgress.current < 1 && tweenModelRotation.current ? tweenModelRotation.current : model.rotation;

        startTween(
            x,
            y,
            z,
            new THREE.Euler(
                shortestAngleTarget(referenceRotation.x, cx),
                shortestAngleTarget(referenceRotation.y, cy),
                shortestAngleTarget(referenceRotation.z, cz)
            )
        );
    };

    const zoomByStep = (percentDelta: number): void => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;

        if (!camera || !controls) return;

        const referencePosition = tweenProgress.current < 1 ? tweenTarget.current : camera.position;
        const currentDistance = referencePosition.distanceTo(controls.target);
        const currentZoom = (BASE_DIST / currentDistance) * 100;
        const newZoom = THREE.MathUtils.clamp(currentZoom + percentDelta, ZOOM.min, ZOOM.max);
        const newDistance = THREE.MathUtils.clamp(
            BASE_DIST / (newZoom / 100),
            controls.minDistance,
            controls.maxDistance
        );
        const direction = camera.position.clone().sub(controls.target).normalize();
        const target = controls.target.clone().addScaledVector(direction, newDistance);

        startTween(target.x, target.y, target.z);
    };

    const resetZoom = (): void => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;

        if (!camera || !controls) return;

        const direction = camera.position.clone().sub(controls.target).normalize();
        const target = controls.target.clone().addScaledVector(direction, BASE_DIST);

        startTween(target.x, target.y, target.z);
    };

    const resetCamera = (): void => {
        goTo(0, 0.4, BASE_DIST);
    };

    useImperativeHandle(
        ref,
        () => ({
            goTo,
            zoomByStep,
            resetZoom,
            resetCamera,
        }),
        []
    );

    useEffect(() => {
        isRotateRef.current = isRotate;
    }, [isRotate]);

    useEffect(() => {
        onZoomChangeRef.current = onZoomChange;
    }, [onZoomChange]);

    useEffect(() => {
        const container = sceneContainerRef.current;

        if (!container) {
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
        camera.position.copy(tweenTarget.current);

        const renderer = createRenderer();
        container.appendChild(renderer.domElement);

        const handleCanvasDragStart = (event: DragEvent) => {
            event.preventDefault();
        };

        renderer.domElement.addEventListener("dragstart", handleCanvasDragStart);

        const controls = createControls(camera, renderer.domElement);

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

        addSceneLights(scene);

        let disposed = false;

        void loadContainerModel()
            .then((loadedModel) => {
                if (disposed) {
                    disposeObject3D(loadedModel);
                    return;
                }

                scene.add(loadedModel);
                modelRef.current = loadedModel;
            })
            .catch(() => {
                modelRef.current = null;
            });

        const resize = (): void => {
            const { clientWidth, clientHeight } = container;
            const safeHeight = Math.max(clientHeight, 1);

            camera.aspect = clientWidth / safeHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth, safeHeight);
        };

        resize();

        const resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(container);

        let frameId = 0;
        let previousTime = globalThis.performance.now();

        const animate = (): void => {
            frameId = globalThis.requestAnimationFrame(animate);
            const currentTime = globalThis.performance.now();
            const delta = (currentTime - previousTime) / 1000;
            previousTime = currentTime;

            if (isRotateRef.current && modelRef.current && tweenProgress.current >= 1) {
                modelRef.current.rotation.x += ANIMATION.rotateX * delta;
                modelRef.current.rotation.y += ANIMATION.rotateY * delta;
            }

            if (tweenProgress.current < 1) {
                tweenProgress.current = Math.min(tweenProgress.current + ANIMATION.tweenSpeed * delta, 1);

                const progress = tweenProgress.current;
                const easedProgress = easeInOutCubic(progress);

                camera.position.lerpVectors(tweenStart.current, tweenTarget.current, easedProgress);

                if (tweenModelRotation.current && modelRef.current) {
                    applyEulerLerp(
                        modelRef.current.rotation,
                        tweenModelRotationStart.current,
                        tweenModelRotation.current,
                        easedProgress
                    );
                }

                if (tweenProgress.current >= 1) {
                    camera.position.copy(tweenTarget.current);
                    tweenModelRotation.current = null;
                    controls.enabled = true;
                    controls.update();
                }
            }

            controls.update();
            renderer.render(scene, camera);

            const zoomLevel = computeZoom(camera, controls);

            if (lastZoomRef.current !== zoomLevel) {
                lastZoomRef.current = zoomLevel;
                onZoomChangeRef.current(zoomLevel);
            }
        };

        animate();

        return () => {
            disposed = true;
            resizeObserver.disconnect();
            globalThis.cancelAnimationFrame(frameId);
            controls.removeEventListener("start", handleControlStart);
            controls.removeEventListener("end", handleControlEnd);
            renderer.domElement.removeEventListener("dragstart", handleCanvasDragStart);
            controls.dispose();

            if (modelRef.current) {
                disposeObject3D(modelRef.current);
            }

            renderer.dispose();
            cameraRef.current = null;
            controlsRef.current = null;
            modelRef.current = null;

            if (container.contains(renderer.domElement)) {
                renderer.domElement.remove();
            }
        };
    }, []);

    return <div ref={sceneContainerRef} className="absolute inset-0 z-0" />;
});

export default InteractiveModel;
