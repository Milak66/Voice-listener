import React, { useState, useRef } from "react";
import './App.css';
import AlekseyLogo from '../../assets/AlekseyLogo.png';

interface AppProps {};

const App: React.FC<AppProps> = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [wholeText, setWholeText] = useState<string[]>([]);
    const recognitionRef = useRef<any>(null);

    const startRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Ваш браузер не поддерживает Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; 
        recognition.interimResults = true; 
        recognition.maxAlternatives = 1;
        recognition.continuous = true; 

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                setWholeText(prev => [...prev, finalTranscript]);
            }
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

    return (
        <div className="app">
            <div className="textPlace">
                <p className="text">
                    {wholeText.map((item, index) => (
                        <div className="sentence" key={index}>{item}</div>
                    ))}
                </p>
            </div>
            <div className="settings">
                <img className="logoImg" src={AlekseyLogo} alt="" onClick={handleButtonClick}/>
            </div>
        </div>
    );
}

export default App;