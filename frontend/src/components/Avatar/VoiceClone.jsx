import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Volume2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAvatar } from "../../context/AvatarContext";

/**
 * VoiceClone
 * Component for recording voice samples and managing voice cloning
 */
const VoiceClone = ({ onComplete }) => {
  const { avatar, updateVoiceProfile } = useAvatar();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceSamples, setVoiceSamples] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [cloneProgress, setCloneProgress] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Sample sentences for recording
  const sampleSentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Learning is a treasure that will follow its owner everywhere.",
    "Education is the passport to the future.",
    "Knowledge is power when applied correctly.",
    "Every expert was once a beginner.",
  ];

  const [currentSentence, setCurrentSentence] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      audioRef.current.pause();
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setVoiceSamples((prev) => [
          ...prev,
          {
            id: Date.now(),
            blob: audioBlob,
            url: audioUrl,
            duration: recordingTime,
            sentence: sampleSentences[currentSentence],
          },
        ]);
        
        // Move to next sentence
        if (currentSentence < sampleSentences.length - 1) {
          setCurrentSentence(currentSentence + 1);
        }
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          // Auto-stop at 30 seconds
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Play/pause sample
  const togglePlaySample = (sample) => {
    if (currentlyPlaying === sample.id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      audioRef.current.src = sample.url;
      audioRef.current.play();
      setCurrentlyPlaying(sample.id);
      
      audioRef.current.onended = () => setCurrentlyPlaying(null);
    }
  };

  // Delete sample
  const deleteSample = (sampleId) => {
    setVoiceSamples((prev) => {
      const sample = prev.find((s) => s.id === sampleId);
      if (sample) {
        URL.revokeObjectURL(sample.url);
      }
      return prev.filter((s) => s.id !== sampleId);
    });
  };

  // Submit voice samples for cloning
  const submitForCloning = async () => {
    if (voiceSamples.length < 3) {
      setError("Please record at least 3 voice samples for better quality.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setCloneProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCloneProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      
      // Create FormData with audio samples
      const formData = new FormData();
      voiceSamples.forEach((sample, index) => {
        formData.append(`sample_${index}`, sample.blob, `sample_${index}.webm`);
      });
      
      // Submit for cloning
      const result = await updateVoiceProfile(formData);
      
      clearInterval(progressInterval);
      setCloneProgress(100);
      
      if (result.success) {
        setSuccess("Voice profile created successfully! Your avatar can now speak in your voice.");
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to create voice profile");
      }
    } catch (err) {
      console.error("Error submitting voice samples:", err);
      setError(err.message || "Failed to create voice profile. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate total recorded time
  const totalRecordedTime = voiceSamples.reduce((acc, s) => acc + s.duration, 0);
  const hasEnoughSamples = voiceSamples.length >= 3 && totalRecordedTime >= 30;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Voice Profile Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record your voice so your avatar can speak like you!
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Samples: {voiceSamples.length}/5</span>
          <span>Total Time: {formatTime(totalRecordedTime)}/30s minimum</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalRecordedTime / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Recording Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
        {/* Current Sentence to Read */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Read this sentence:
          </p>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 italic">
            "{sampleSentences[currentSentence]}"
          </p>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <motion.button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={voiceSamples.length >= 5}
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </motion.button>
          ) : (
            <motion.button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5" />
              Stop ({formatTime(recordingTime)})
            </motion.button>
          )}
        </div>

        {/* Recording Animation */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex justify-center"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-red-500 rounded-full"
                    animate={{
                      height: [8, 24, 8],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recorded Samples */}
      {voiceSamples.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recorded Samples
          </h3>
          <div className="space-y-2">
            {voiceSamples.map((sample, index) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
              >
                <span className="text-sm font-medium text-gray-500 w-6">
                  {index + 1}.
                </span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {sample.sentence}
                  </p>
                  <p className="text-xs text-gray-500">
                    Duration: {formatTime(sample.duration)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => togglePlaySample(sample)}
                    className={`p-2 rounded-full ${
                      currentlyPlaying === sample.id
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {currentlyPlaying === sample.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => deleteSample(sample.id)}
                    className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Progress */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating voice profile...
              </span>
              <span>{cloneProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                animate={{ width: `${cloneProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="flex gap-3">
        <motion.button
          onClick={submitForCloning}
          disabled={!hasEnoughSamples || isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            hasEnoughSamples && !isProcessing
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
          whileHover={hasEnoughSamples && !isProcessing ? { scale: 1.02 } : {}}
          whileTap={hasEnoughSamples && !isProcessing ? { scale: 0.98 } : {}}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              Create Voice Profile
            </>
          )}
        </motion.button>

        {voiceSamples.length > 0 && !isProcessing && (
          <motion.button
            onClick={() => {
              voiceSamples.forEach((s) => URL.revokeObjectURL(s.url));
              setVoiceSamples([]);
              setCurrentSentence(0);
            }}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-2">
          Tips for best results:
        </h4>
        <ul className="text-xs text-indigo-600 dark:text-indigo-300 space-y-1">
          <li>• Record in a quiet environment</li>
          <li>• Speak clearly and at a natural pace</li>
          <li>• Keep the microphone at a consistent distance</li>
          <li>• Record at least 3 samples for better accuracy</li>
          <li>• Longer recordings (30+ seconds total) produce better results</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceClone;
