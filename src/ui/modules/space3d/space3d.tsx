"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_DIST } from "@/src/ui/lib/space3D-utils";
import InteractiveModel, { type InteractiveModelHandle } from "@/src/ui/modules/space3d/interactive-model";
import LeftSidebar from "@/src/ui/modules/space3d/left-sidebar";
import RightSidebar from "@/src/ui/modules/space3d/right-sidebar";

import BottomBar from "./bottom-bar";
import Header from "./header";

const ZOOM_STEP = 10;
const TOP_VIEW_POSITION = [0.001, BASE_DIST, 0.001] as const;
const ISOMETRIC_VIEW_POSITION = [BASE_DIST * 0.95, BASE_DIST * 0.72, BASE_DIST * 0.95] as const;

function isEditableTarget(target: EventTarget | null): boolean {
    const element = target as HTMLElement | null;
    const tagName = element?.tagName;

    return tagName === "INPUT" || tagName === "TEXTAREA" || Boolean(element?.isContentEditable);
}

export default function Espaco3DPage() {
    const [isRotate, setIsRotate] = useState(true);
    const [isInfo, setIsInfo] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const modelRef = useRef<InteractiveModelHandle | null>(null);

    const toggleRotate = () => setIsRotate((previous) => !previous);
    const toggleInfo = () => setIsInfo((previous) => !previous);
    const handleFrontView = () => modelRef.current?.goTo(0, 0, BASE_DIST);
    const handleSideView = () => modelRef.current?.goTo(BASE_DIST, 0, 0);
    const handleTopView = () => modelRef.current?.goTo(...TOP_VIEW_POSITION);
    const handleIsometricView = () => modelRef.current?.goTo(...ISOMETRIC_VIEW_POSITION);
    const handleZoomOut = () => modelRef.current?.zoomByStep(-ZOOM_STEP);
    const handleResetZoom = () => modelRef.current?.resetZoom();
    const handleZoomIn = () => modelRef.current?.zoomByStep(ZOOM_STEP);
    const handleResetCamera = () => modelRef.current?.resetCamera();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isEditableTarget(event.target)) return;

            if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                handleZoomIn();
                return;
            }

            if (event.key === "-" || event.key === "_") {
                event.preventDefault();
                handleZoomOut();
                return;
            }

            if (event.key === "0") {
                event.preventDefault();
                handleResetCamera();
                return;
            }

            if (event.key.toLowerCase() === "r") {
                toggleRotate();
                return;
            }

            if (event.key.toLowerCase() === "i") {
                toggleInfo();
            }
        };

        globalThis.addEventListener("keydown", onKeyDown);
        return () => globalThis.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <div className="h-full bg-[#020618] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 z-50">
                <Header />
            </div>

            <div className="w-full h-full relative">
                <InteractiveModel ref={modelRef} isRotate={isRotate} onZoomChange={setZoomLevel} />

                <LeftSidebar
                    isRotate={isRotate}
                    isInfo={isInfo}
                    zoomLevel={zoomLevel}
                    onFrontView={handleFrontView}
                    onSideView={handleSideView}
                    onTopView={handleTopView}
                    onIsometricView={handleIsometricView}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onZoomIn={handleZoomIn}
                    onRotateChange={setIsRotate}
                    onInfoChange={setIsInfo}
                />

                <BottomBar
                    isRotate={isRotate}
                    isInfo={isInfo}
                    zoomLevel={zoomLevel}
                    onToggleRotate={toggleRotate}
                    onToggleInfo={toggleInfo}
                    onResetZoom={handleResetZoom}
                />

                {isInfo && <RightSidebar />}
            </div>
        </div>
    );
}
