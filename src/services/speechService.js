// speechService.js - Web Speech API Voice-to-Text and Text-to-Speech

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  as: 'as-IN', // falls back to bn/hi if unavailable in browser
  or: 'or-IN',
  te: 'te-IN'
};

export const speechService = {
  isRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  isSynthesisSupported() {
    return 'speechSynthesis' in window;
  },

  createRecognizer(langCode = 'hi', onResult, onError, onEnd) {
    if (!this.isRecognitionSupported()) {
      onError && onError('Speech recognition is not supported in this browser.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = LANG_MAP[langCode] || 'hi-IN';

    recognizer.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult && onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
    };

    recognizer.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      onError && onError(event.error);
    };

    recognizer.onend = () => {
      onEnd && onEnd();
    };

    return recognizer;
  },

  speak(text, langCode = 'hi') {
    if (!this.isSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[langCode] || 'hi-IN';
    utterance.rate = 0.9; // Slightly slower for clear rural understanding
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.includes('IN'));
    if (matchingVoice) utterance.voice = matchingVoice;

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  stopSpeaking() {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
};
