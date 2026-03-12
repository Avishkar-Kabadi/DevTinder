/**
 * Utility for basic frontend E2E message obfuscation (Base64 + Shift).
 * This obscures message texts before they are transmitted over websockets or saved to the DB.
 */

// Simple lightweight shift cipher combined with base64
const SHIFT_KEY = 13;

export const encodeMessage = (text) => {
    if (!text) return text;
    
    // Shift characters
    let shifted = '';
    for (let i = 0; i < text.length; i++) {
        shifted += String.fromCharCode(text.charCodeAt(i) + SHIFT_KEY);
    }
    
    // Encode to base64
    // Using encodeURIComponent to handle special characters cleanly
    return window.btoa(encodeURIComponent(shifted));
};

export const decodeMessage = (encodedText) => {
    if (!encodedText) return encodedText;
    
    try {
        // Decode base64
        const decodedUri = decodeURIComponent(window.atob(encodedText));
        
        // Unshift characters
        let original = '';
        for (let i = 0; i < decodedUri.length; i++) {
            original += String.fromCharCode(decodedUri.charCodeAt(i) - SHIFT_KEY);
        }
        
        return original;
    } catch (e) {
        // If decoding fails (maybe it was an unencrypted legacy message), return raw
        console.warn("Failed to decode message window. Return raw string:", e.message);
        return encodedText;
    }
};
