import React, { useState, useEffect, useRef } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import { texts } from "./text.js"; // Import texts from texts.js
import './speech.css';
import bg from './assets/dis.png'
import headset from './assets/headset.png'

const Speech = () => {
    const { speak, voices } = useSpeechSynthesis();
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedText, setSelectedText] = useState(null);
    const [rate, setRate] = useState(1); // Default rate is 1 (normal speed)
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [typedText, setTypedText] = useState("");
    const [accuracy, setAccuracy] = useState(100);
    const [wpm, setWpm] = useState(0);
    const typingTimerRef = useRef(null);
    useEffect(() => {
        // Calculate WPM
        if (startTime && endTime && typedText.trim() !== "") {
            const elapsedTimeInSeconds = (endTime - startTime) / 1000;
            const words = typedText.trim().split(/\s+/).filter(word => word !== "");
            const wordCount = words.length;
            const newWpm = Math.round((wordCount / elapsedTimeInSeconds) * 60);
            setWpm(newWpm);
        }

        // Calculate accuracy
        if (selectedText && typedText) {
            const textWords = selectedText.text.split(/\s+/);
            const typedWords = typedText.split(/\s+/);
            let correctWordsCount = 0;

            typedWords.forEach((typedWord, index) => {
                if (textWords[index] && textWords[index] === typedWord) {
                    correctWordsCount++;
                }
            });

            const newAccuracy = (correctWordsCount / typedWords.length) * 100;
            setAccuracy(isNaN(newAccuracy) ? 100 : newAccuracy);
        }
    }, [startTime, endTime, typedText, selectedText]);

    const handleSpeech = () => {
        if (!selectedText || !selectedVoice) return;
    
        const text = selectedText.text;
        const chunkSize = 100; // Adjust this value as needed
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
        }
        
        chunks.forEach((chunk, index) => {
            const isLastChunk = index === chunks.length - 1;
            speak({
                text: chunk,
                voice: selectedVoice,
                rate,
                onEnd: isLastChunk ? handleSpeechEnd : undefined // Only call handleSpeechEnd after the last chunk
            });
        });
    
        setStartTime(Date.now());
        setEndTime(null);
    };

    const handleSpeechEnd = () => {
        setEndTime(Date.now());
    };

    const handleVoiceChange = (e) => {
        const voiceName = e.target.value;
        const selectedVoice = voices.find(voice => voice.name === voiceName);
        setSelectedVoice(selectedVoice);
    };

    const handleTextChange = (e) => {
        const textIndex = parseInt(e.target.value);
        const selectedText = texts[textIndex];
        setSelectedText(selectedText);
    };

    const handleSpeedChange = (newRate) => {
        setRate(newRate);
    };

    const [formattedTypedText, setFormattedTypedText] = useState("");
    
    const resetSettings = () => {
        setSelectedText(null);
        setSelectedVoice(null);
        setRate(1);
        setTypedText("");
        setAccuracy(100);
        setWpm(0);
        setStartTime(null);
        setEndTime(null);
    };
    const pauseSpeech = () => {
        // Pause speech synthesis
        window.speechSynthesis.pause();
    };
    
    const rewind5SecondsBack = () => {
        console.log("Rewinding 5 seconds back...");
        if (!startTime || !endTime) return;
    
        const newStartTime = Math.max(startTime - 5000, 0);
        console.log("New start time:", newStartTime);
        setStartTime(newStartTime);
        setEndTime(newStartTime);
    };
    
    const rewind5SecondsForward = () => {
        console.log("Rewinding 5 seconds forward...");
        if (!startTime || !endTime) return;
    
        const newEndTime = endTime ? endTime + 5000 : startTime + 5000;
        console.log("New end time:", newEndTime);
        setEndTime(newEndTime);
        setStartTime(newEndTime);
    };    

    const handleTextAreaChange = (e) => {
        const typedText = e.target.value;
        setTypedText(typedText);

        // Reset endTime if the user stops typing for 500 milliseconds
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            setEndTime(Date.now());
        }, 500);

        // Compare typed words with text words and apply formatting
        if (selectedText && typedText) {
            const textWords = selectedText.text.split(/\s+/);
            const typedWords = typedText.split(/\s+/);
            let formattedText = '';

            typedWords.forEach((typedWord, index) => {
                if (textWords[index]) {
                    if (textWords[index] === typedWord) {
                        // If the typed word matches the text word, no formatting
                        formattedText += typedWord + ' ';
                    } else {
                        // If there's a mismatch, highlight the typed word in red
                        formattedText += '<span style="color: red;">' + typedWord + '</span> ';
                    }
                }
            });

            // Update the state with the formatted text
            setFormattedTypedText(formattedText);
        }
    };

    return (
        <div className="speech">
            <img className="img" src={bg} alt="hee" />
            <h2 className = "head" >V<span class="hidden-letter">eeeeee</span>ice  </h2>
            <h2 className = "head2" >Typing  </h2>
            
            <div className="left" style={{ position: "absolute", top: "0px", width: "570px",left: "5%"}}>
                <div className="group" style={{ position: "absolute", top: "300px", left: "28%", transform: "translateX(-50%)" }}>
                    <select value={selectedText ? selectedText.index : ""} onChange={handleTextChange} className="text">
                        <option value="">Select Text</option>
                        {texts.map((text, index) => (
                            <option key={index} value={index}>
                                {`Text ${index + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
                <br></br>
                <div className="group" style={{ position: "absolute", top: "350px", left: "28.5%", transform: "translateX(-50%)" }}>
                <select value={selectedVoice ? selectedVoice.name : ""} onChange={handleVoiceChange} className="voice">
                    <option value="">Select Voice</option>
                    {voices.map((voice, index) => (
                        <option key={index} value={voice.name}>{voice.name}</option>
                    ))}
                </select>
                </div>
                <br></br>
                <div className="group" style={{ position: "absolute",left: "27%", top: "400px", transform: "translateX(-50%)" }}>
                    <div className="speed-controls">
                    <select onChange={(e) => handleSpeedChange(parseFloat(e.target.value))} className="speed-controls">
                        <option value="0.25" selected={rate === 0.25}>0.25x</option>
                        <option value="0.5" selected={rate === 0.5}>0.5x</option>
                        <option value="0.75" selected={rate === 0.75}>0.75x</option>
                        <option value="1" selected={rate === 1}>1x</option>
                        <option value="1.25" selected={rate === 1.25}>1.25x</option>
                        <option value="1.5" selected={rate === 1.5}>1.5x</option>
                    </select>
                    </div>
                </div>
                <br></br><br></br>
                <div className="group" style={{ position: "absolute", top: "480px", left: "28%", transform: "translateX(-50%)" }}>
                    <button className= "button-30" onClick={handleSpeech} style={{ marginBottom: '7px' }}>Start</button><br></br>
                    <button className="button-30" onClick={resetSettings} style={{ marginBottom: '7px' }}>Reset</button><br></br>
                    <button className="button-30" onClick={pauseSpeech} style={{ marginBottom: '15px' }}>Pause</button><br></br>
                    <button className="button-30" onClick={rewind5SecondsBack}>-5s</button>
                    <button className="button-30" onClick={rewind5SecondsForward} style={{ marginLeft: '20px' }}>+5s</button>
                </div>
            </div>
            <div className="set" style={{ position: "absolute", top: "100px", right: "24%", transform: "translateX(-50%)"}}>
                <img className="sett" src={headset} alt="he"></img>
            </div>
            <div className="calc" style={{ position: "absolute", top: "360px", right: "7%" }}>
                <p>
                    WPM: {wpm}<br />
                    Accuracy: {accuracy.toFixed(2)}%
                </p>
            </div>
            <div className="area" style={{ position: "absolute", top: "400px", width: "70%", height: "290px",left: "50%", transform: "translateX(-50%)" }}>
                <textarea className="textarea" value={typedText} onChange={handleTextAreaChange} placeholder="Type here..."  />
                <p dangerouslySetInnerHTML={{ __html: formattedTypedText }} style={{ color: 'white' }}></p>
            </div>
            
        </div>
    );
};

export default Speech;
