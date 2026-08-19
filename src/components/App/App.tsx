// import React, { useState, useRef } from "react";
// import "./App.css";
// import AlekseyLogo from "../../assets/AlekseyLogo.png";

// interface AppProps {}

// const App: React.FC<AppProps> = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [text, setText] = useState<string>("");
//     const [interimText, setInterimText] = useState<string>("");

//     const recognitionRef = useRef<any>(null);

//     const startRecognition = () => {
//         const SpeechRecognition =
//             (window as any).SpeechRecognition ||
//             (window as any).webkitSpeechRecognition;

//         if (!SpeechRecognition) {
//             alert("Your browser doesn't support this feature");
//             return;
//         }

//         const recognition = new SpeechRecognition();

//         recognition.lang = "nb-NO";
//         recognition.interimResults = true;
//         recognition.maxAlternatives = 1;
//         recognition.continuous = true;

//         recognition.onresult = (event: any) => {
//             let interimTranscript = "";

//             for (let i = event.resultIndex; i < event.results.length; ++i) {
//                 const transcript = event.results[i][0].transcript;

//                 if (event.results[i].isFinal) {
//                     setText((prev) => prev + transcript + " ");
//                 } else {
//                     interimTranscript += transcript;
//                 }
//             }

//             setInterimText(interimTranscript);
//         };

//         recognition.onend = () => {
//             if (isRecording) {
//                 recognition.start();
//             } else {
//                 setIsRecording(false);
//             }
//         };

//         recognitionRef.current = recognition;

//         recognition.start();
//         setIsRecording(true);
//     };

//     const stopRecognition = () => {
//         if (recognitionRef.current) {
//             recognitionRef.current.onend = () => {
//                 setIsRecording(false);
//             };

//             recognitionRef.current.stop();
//         }
//     };

//     const handleButtonClick = () => {
//         if (isRecording) {
//             stopRecognition();
//         } else {
//             startRecognition();
//         }
//     };

//     return (
//         <div className="app">
//             <div className="textPlace">
//                 <p className="text">
//                     {text}
//                     <span className="interim">{interimText}</span>
//                 </p>
//             </div>

//             <div className="settings">
//                 <img
//                     className="logoImg"
//                     src={AlekseyLogo}
//                     alt=""
//                     onClick={handleButtonClick}
//                 />
//             </div>
//         </div>
//     );
// };

// export default App;

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.xr.enabled = true;

    container.appendChild(renderer.domElement);

    // Light
    const light = new THREE.HemisphereLight(
      0xffffff,
      0xbbbbff,
      3
    );

    scene.add(light);

    // -----------------------------
    // HELLO WORLD
    // -----------------------------

    const canvas =
      document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 30;

    ctx.fillStyle = "white";

    ctx.fillText(
      "Hello World",
      512,
      128
    );

    const texture =
      new THREE.CanvasTexture(canvas);

    texture.colorSpace =
      THREE.SRGBColorSpace;

    const material =
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });

    const geometry =
      new THREE.PlaneGeometry(
        0.8,
        0.2
      );

    const text =
      new THREE.Mesh(
        geometry,
        material
      );

    text.visible = false;

    scene.add(text);

    // -----------------------------
    // AR BUTTON
    // -----------------------------

    const arButton =
      ARButton.createButton(
        renderer,
        {
          requiredFeatures: [
            "hit-test",
          ],
        }
      );

    document.body.appendChild(
      arButton
    );

    // -----------------------------
    // AR VARIABLES
    // -----------------------------

    let hitTestSource: any = null;
    let referenceSpace: any = null;

    let placed = false;

    // -----------------------------
    // AR START
    // -----------------------------

    const startAR = async () => {
      const session =
        renderer.xr.getSession();

      if (!session) return;

      referenceSpace =
        await renderer.xr.getReferenceSpace();

      const viewerSpace =
        await session.requestReferenceSpace(
          "viewer"
        );

        if (!session.requestHitTestSource) {
          console.error(
            "WebXR hit-test is not supported"
          );
          return;
        }
        
        hitTestSource =
          await session.requestHitTestSource({
            space: viewerSpace,
          });
    };

    // -----------------------------
    // AR END
    // -----------------------------

    const endAR = () => {
      hitTestSource = null;
      referenceSpace = null;
      placed = false;

      text.visible = false;
    };

    renderer.xr.addEventListener(
      "sessionstart",
      startAR
    );

    renderer.xr.addEventListener(
      "sessionend",
      endAR
    );

    // -----------------------------
    // TAP TO PLACE
    // -----------------------------

    const handleClick = () => {
      if (!hitTestSource) return;

      if (text.visible) {
        placed = true;
      }
    };

    renderer.domElement.addEventListener(
      "click",
      handleClick
    );

    // -----------------------------
    // RENDER LOOP
    // -----------------------------

    renderer.setAnimationLoop(
      (
        _time,
        frame
      ) => {
        if (
          frame &&
          hitTestSource &&
          referenceSpace
        ) {
          const results =
            frame.getHitTestResults(
              hitTestSource
            );

          if (results.length > 0) {
            const hit =
              results[0];

            const pose =
              hit.getPose(
                referenceSpace
              );

            if (pose && !placed) {
              text.visible = true;

              text.matrix.fromArray(
                pose.transform.matrix
              );

              text.matrix.decompose(
                text.position,
                text.quaternion,
                text.scale
              );
            }
          }
        }

        renderer.render(
          scene,
          camera
        );
      }
    );

    // -----------------------------
    // RESIZE
    // -----------------------------

    const resize = () => {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener(
      "resize",
      resize
    );

    // -----------------------------
    // CLEANUP
    // -----------------------------

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      renderer.setAnimationLoop(null);

      renderer.domElement.removeEventListener(
        "click",
        handleClick
      );

      renderer.xr.removeEventListener(
        "sessionstart",
        startAR
      );

      renderer.xr.removeEventListener(
        "sessionend",
        endAR
      );

      if (hitTestSource) {
        hitTestSource.cancel();
      }

      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      arButton.remove();

      if (
        renderer.domElement.parentNode
      ) {
        renderer.domElement.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export default App;