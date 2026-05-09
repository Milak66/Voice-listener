import React, { useState, useRef } from "react";
import "./App.css";
import AlekseyLogo from "../../assets/AlekseyLogo.png";

interface AppProps {}

const App: React.FC<AppProps> = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState<string>("");
    const [interimText, setInterimText] = useState<string>("");
    const [inputText, setInputText] = useState<string>("");

    const recognitionRef = useRef<any>(null);

    const startRecognition = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Ваш браузер не поддерживает Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "ru-RU";
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    setText((prev) => prev + transcript + " ");
                } else {
                    interimTranscript += transcript;
                }
            }

            setInterimText(interimTranscript);
        };

        recognition.onend = () => {
            if (isRecording) {
                recognition.start();
            } else {
                setIsRecording(false);
            }
        };

        recognitionRef.current = recognition;

        recognition.start();
        setIsRecording(true);
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.stop();
        }
    };

    const handleButtonClick = () => {
        if (isRecording) {
            stopRecognition();
        } else {
            startRecognition();
        }
    };

    const speakText = () => {
        if (!inputText.trim()) return;
    
        speechSynthesis.cancel();
    
        const utterance = new SpeechSynthesisUtterance(inputText);
    
        const voices = speechSynthesis.getVoices();
    
        const femaleVoice =
            voices.find((voice) =>
                voice.name.includes("Samantha")
            ) ||
            voices.find((voice) =>
                voice.name.includes("Google US English")
            ) ||
            voices.find((voice) =>
                voice.name.includes("Zira")
            ) ||
            voices.find((voice) =>
                voice.lang === "en-US"
            );
    
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
    
        utterance.lang = "en-US";
    
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 1;
    
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="app">
            <div className="textPlace">
                <p className="text">
                    {text}
                    <span className="interim">{interimText}</span>
                </p>
            </div>

            <div className="settings">
                <div className="speakDiv">
                    <textarea className="input"
                        placeholder="Введите текст..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    <button onClick={speakText} className="btn">
                        Say
                    </button>
                </div>

                <img
                    className="logoImg"
                    src={AlekseyLogo}
                    alt=""
                    onClick={handleButtonClick}
                />
            </div>
        </div>
    );
};

export default App;