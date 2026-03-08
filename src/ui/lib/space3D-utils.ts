import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export const BASE_DIST = 2.4;
const INITIAL_CAMERA_HEIGHT = 0.4;
const INITIAL_CAMERA_DEPTH = Math.sqrt(BASE_DIST ** 2 - INITIAL_CAMERA_HEIGHT ** 2);
export const ZOOM = { min: 60, max: 220 } as const;
const MIN_CAMERA_DISTANCE = BASE_DIST / (ZOOM.max / 100);
const MAX_CAMERA_DISTANCE = BASE_DIST / (ZOOM.min / 100);

export const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, INITIAL_CAMERA_HEIGHT, INITIAL_CAMERA_DEPTH);
export const CAMERA = {
    fov: 60,
    near: 0.1,
    far: 1000,
    minDistance: MIN_CAMERA_DISTANCE,
    maxDistance: MAX_CAMERA_DISTANCE,
    dampingFactor: 0.08,
} as const;
export const MODEL = {
    path: "/Container.FBX",
    width: 2.5,
    height: 1.2,
    depth: 1.2,
    color: 0xfcc700,
    metalness: 0.2,
    roughness: 0.4,
} as const;
export const LIGHTS = { ambient: 1, directional: 2.2 } as const;
export const ANIMATION = {
    rotateX: 0.03,
    rotateY: 0.24,
    tweenSpeed: 1.68,
} as const;

export function computeZoom(camera: THREE.PerspectiveCamera, controls: OrbitControls): number {
    const distance = camera.position.distanceTo(controls.target);
    return Math.round(THREE.MathUtils.clamp((BASE_DIST / distance) * 100, ZOOM.min, ZOOM.max));
}

export function easeInOutCubic(progress: number): number {
    return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function shortestAngleTarget(current: number, target: number): number {
    let diff = (target - current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff;
}

export function applyEulerLerp(target: THREE.Euler, start: THREE.Euler, end: THREE.Euler, progress: number): void {
    target.x = THREE.MathUtils.lerp(start.x, end.x, progress);
    target.y = THREE.MathUtils.lerp(start.y, end.y, progress);
    target.z = THREE.MathUtils.lerp(start.z, end.z, progress);
}

export function createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.userSelect = "none";
    renderer.domElement.draggable = false;

    const nativeSetPointerCapture = renderer.domElement.setPointerCapture.bind(renderer.domElement);
    const nativeReleasePointerCapture = renderer.domElement.releasePointerCapture.bind(renderer.domElement);

    renderer.domElement.setPointerCapture = ((pointerId: number) => {
        try {
            nativeSetPointerCapture(pointerId);
        } catch {
            // Aqui ignora as inconsistências na captura de ponteiros em movimento a partir do OrbitControls
        }
    }) as typeof renderer.domElement.setPointerCapture;

    renderer.domElement.releasePointerCapture = ((pointerId: number) => {
        try {
            if (!renderer.domElement.hasPointerCapture(pointerId)) {
                return;
            }

            nativeReleasePointerCapture(pointerId);
        } catch {
            // Aqui ignora as inconsistências na captura de ponteiros em movimento a partir do OrbitControls
        }
    }) as typeof renderer.domElement.releasePointerCapture;

    return renderer;
}

export function createControls(camera: THREE.PerspectiveCamera, element: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, element);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = CAMERA.minDistance;
    controls.maxDistance = CAMERA.maxDistance;
    controls.target.set(0, 0, 0);
    controls.dampingFactor = CAMERA.dampingFactor;
    return controls;
}

export async function loadContainerModel(): Promise<THREE.Object3D> {
    const manager = new THREE.LoadingManager();

    manager.setURLModifier((url) => {
        if (/\.(png|jpe?g|webp|bmp)$/i.test(url)) {
            return "data:,";
        }

        return url;
    });

    const loader = new FBXLoader(manager);
    const model = await loader.loadAsync(MODEL.path);
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    const scaleFactor = Math.min(MODEL.width / size.x, MODEL.height / size.y, MODEL.depth / size.z);

    if (Number.isFinite(scaleFactor) && scaleFactor > 0) {
        model.scale.multiplyScalar(scaleFactor);
    }

    const centeredBox = new THREE.Box3().setFromObject(model);
    const center = centeredBox.getCenter(new THREE.Vector3());

    model.position.sub(center);

    model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = false;
        child.receiveShadow = false;

        const createYellowMaterial = () =>
            new THREE.MeshStandardMaterial({
                color: MODEL.color,
                metalness: MODEL.metalness,
                roughness: MODEL.roughness,
            });

        if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
            child.material = child.material.map(() => createYellowMaterial());
            return;
        }

        child.material.dispose();
        child.material = createYellowMaterial();
    });

    return model;
}

export function disposeObject3D(object: THREE.Object3D): void {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.geometry.dispose();

        if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
            return;
        }

        child.material.dispose();
    });
}

export function addSceneLights(scene: THREE.Scene): void {
    scene.add(new THREE.AmbientLight(0xffffff, LIGHTS.ambient));
    const directionalLight = new THREE.DirectionalLight(0xffffff, LIGHTS.directional);
    directionalLight.position.set(2, 3, 4);
    scene.add(directionalLight);
}
