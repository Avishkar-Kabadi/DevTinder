import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCallHistory } from '../store/chatSlice';
import { socket } from '../utils/socket';
import axios from 'axios';
import { baseUrl } from '../utils/constants';
import { PhoneOff, Phone as PhoneIcon, Video, Mic, MicOff, VideoOff, Camera, Maximize2, Minimize2 } from 'lucide-react';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function CallComponent() {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const [callState, setCallState] = useState('idle'); // idle, receiving, calling, active
    const [incomingCallData, setIncomingCallData] = useState(null);
    const [remoteUserParams, setRemoteUserParams] = useState(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    // New states for Video Enhancements
    const [isSwapped, setIsSwapped] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerRef = useRef(null);
    const ringAudioRef = useRef(null);
    const dialAudioRef = useRef(null);
    const callStartTimeRef = useRef(null);

    const iceCandidateQueue = useRef([]);
    const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

    const endCallLocally = React.useCallback(() => {
        // Calculate duration before clearing state
        if (callStartTimeRef.current && remoteUserParams) {
            const endedAt = new Date();
            const startedAt = new Date(callStartTimeRef.current);
            const durationSecs = Math.floor((endedAt - startedAt) / 1000);
            const mins = Math.floor(durationSecs / 60);
            const secs = durationSecs % 60;
            const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

            // Optimistic Redux update for instant UI
            dispatch(addCallHistory({
                otherUserId: remoteUserParams.id,
                otherUserName: remoteUserParams.name,
                otherUserPhoto: remoteUserParams.photoUrl,
                type: isVideoCall ? 'video' : 'audio',
                startTime: startedAt.toISOString(),
                duration: durationStr,
                durationSecs,
            }));

            // Persist to DB (fire-and-forget, no await)
            if (durationSecs > 0) {
                axios.post(`${baseUrl}/api/chat/calls`, {
                    receiverId: remoteUserParams.id,
                    type: isVideoCall ? 'video' : 'audio',
                    duration: durationSecs,
                    startedAt: startedAt.toISOString(),
                    endedAt: endedAt.toISOString(),
                    status: 'completed',
                }, { withCredentials: true }).catch(err => {
                    console.error('Failed to save call history:', err);
                });
            }

            callStartTimeRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
        }
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        setRemoteStream(null);
        setCallState('idle');
        setIncomingCallData(null);
        setRemoteUserParams(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setRemoteDescriptionSet(false);
        iceCandidateQueue.current = [];
    }, [dispatch, isVideoCall, localStream, remoteUserParams]);

    const endCall = React.useCallback(() => {
        const to = incomingCallData ? incomingCallData.from : (remoteUserParams ? remoteUserParams.id : null);
        if (to) {
            socket.emit("endCall", { to });
        }
        endCallLocally();
    }, [incomingCallData, remoteUserParams, endCallLocally]);

    useEffect(() => {
        if (!ringAudioRef.current) {
            ringAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ring.ogg');
            ringAudioRef.current.loop = true;
        }
        if (!dialAudioRef.current) {
            dialAudioRef.current = new Audio('https://actions.google.com/sounds/v1/communications/dial_tone.ogg');
            dialAudioRef.current.loop = true;
        }

        if (callState === 'receiving') {
            ringAudioRef.current.play().catch(() => {});
        } else {
            ringAudioRef.current.pause();
            ringAudioRef.current.currentTime = 0;
        }

        if (callState === 'calling') {
            dialAudioRef.current.play().catch(() => {});
        } else {
            dialAudioRef.current.pause();
            dialAudioRef.current.currentTime = 0;
        }
    }, [callState]);

    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream, callState, isVideoOff, isSwapped]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream, callState, isSwapped]);

    useEffect(() => {
        if (remoteAudioRef.current && remoteStream && !isVideoCall) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState, isVideoCall]);



    useEffect(() => {
        const handleIncomingCall = (data) => {
            if (callState !== 'idle') return;
            setIncomingCallData(data);
            setIsVideoCall(data.isVideo === true);
            setCallState('receiving');

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                try {
                    const title = `Incoming ${data.isVideo ? 'Video' : 'Audio'} Call`;
                    const body = `${data.name} is calling you...`;
                    const opts = {
                        body: body,
                        icon: data.photoUrl || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
                        requireInteraction: true,
                        vibrate: [200, 100, 200, 100, 200, 100, 200]
                    };
                    
                    if (navigator.serviceWorker) {
                        navigator.serviceWorker.ready.then(reg => {
                            reg.showNotification(title, opts);
                        }).catch(() => new Notification(title, opts));
                    } else {
                        new Notification(title, opts);
                    }
                } catch (err) {
                    console.error("OS Notification Error:", err);
                }
            }
        };

        const handleCallAccepted = async (signal) => {
            if (peerRef.current) {
                if (signal) {
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                }
                setRemoteDescriptionSet(true);
                callStartTimeRef.current = Date.now();
                setCallState('active');
            }
        };

        const handleIceCandidate = async (candidate) => {
            if (peerRef.current) {
                if (peerRef.current.remoteDescription && peerRef.current.remoteDescription.type) {
                    try {
                        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding ice candidate:", e);
                    }
                } else {
                    iceCandidateQueue.current.push(candidate);
                }
            }
        };

        const handleCallEnded = () => {
            endCallLocally();
        };

        socket.on("incomingCall", handleIncomingCall);
        socket.on("callAccepted", handleCallAccepted);
        socket.on("iceCandidate", handleIceCandidate);
        socket.on("callEnded", handleCallEnded);

        return () => {
            socket.off("incomingCall", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("iceCandidate", handleIceCandidate);
            socket.off("callEnded", handleCallEnded);
        };
    }, [callState, endCallLocally, remoteDescriptionSet]);

    useEffect(() => {
        if (remoteDescriptionSet && peerRef.current && iceCandidateQueue.current.length > 0) {
            const processQueue = async () => {
                while (iceCandidateQueue.current.length > 0) {
                    const candidate = iceCandidateQueue.current.shift();
                    try {
                        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding queued ice candidate:", e);
                    }
                }
            };
            processQueue();
        }
    }, [remoteDescriptionSet]);

    // Listen to local trigger from inside app UI
    useEffect(() => {
        const handleStartCall = async (e) => {
            if (!user) return;
            const { userToCall, isVideo, name, photo } = e.detail;
            setIsVideoCall(isVideo);
            setRemoteUserParams({ name, photoUrl: photo, id: userToCall });
            setCallState('calling');
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
                setLocalStream(stream);

                const peer = new RTCPeerConnection(rtcConfig);
                peerRef.current = peer;

                stream.getTracks().forEach(track => peer.addTrack(track, stream));

                peer.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                };

                peer.oniceconnectionstatechange = () => {
                    if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
                        endCallLocally();
                    }
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("iceCandidate", { to: userToCall, candidate: event.candidate });
                    }
                };

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);

                socket.emit("callUser", {
                    userToCall,
                    signalData: offer,
                    from: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    photoUrl: user.photoUrl,
                    isVideo
                });

            } catch (err) {
                console.error("Failed to start media/call", err);
                endCallLocally();
            }
        };

        window.addEventListener('startCall', handleStartCall);
        return () => window.removeEventListener('startCall', handleStartCall);
    }, [endCallLocally, user]);

    const answerCall = async () => {
        if (!incomingCallData || !incomingCallData.signal) {
            setRemoteUserParams({
                name: incomingCallData?.name || "Caller",
                photoUrl: incomingCallData?.photoUrl,
                id: incomingCallData?.from,
            });
            callStartTimeRef.current = Date.now();
            setIncomingCallData(null);
            setCallState('active');
            socket.emit("answerCall", { to: incomingCallData?.from, signal: null });
            return;
        }
        setCallState('active');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
            setLocalStream(stream);

            const peer = new RTCPeerConnection(rtcConfig);
            peerRef.current = peer;

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            peer.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            peer.oniceconnectionstatechange = () => {
                if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
                    endCallLocally();
                }
            };

            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("iceCandidate", { to: incomingCallData.from, candidate: event.candidate });
                }
            };

            await peer.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
            setRemoteDescriptionSet(true);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit("answerCall", { to: incomingCallData.from, signal: answer });
            setRemoteUserParams({ name: incomingCallData.name, photoUrl: incomingCallData.photoUrl, id: incomingCallData.from });
            callStartTimeRef.current = Date.now();
            setIncomingCallData(null);

        } catch(err) {
            console.error("Failed to answer", err);
            endCallLocally();
        }
    };

    const rejectCall = () => {
        if (incomingCallData) {
            socket.emit("endCall", { to: incomingCallData.from });
            setIncomingCallData(null);
            setCallState('idle');
        }
    };



    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    if (callState === 'idle') return null;

    const mainClasses = "absolute inset-0 w-full h-full";
    const pipClasses = "absolute bottom-24 right-4 md:bottom-8 md:right-8 w-24 h-36 md:w-48 md:h-64 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 transition-all cursor-pointer z-40 hover:scale-105 opacity-90 hover:opacity-100";

    return (
        <div className={
            (callState === 'active' && isMinimized)
            ? "fixed bottom-4 right-4 z-[99999] w-72 h-48 sm:w-80 sm:h-56 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden pointer-events-auto transition-all duration-300 border border-white/20 bg-black animate-in slide-in-from-bottom-8"
            : "fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto"
        }>
            {callState === 'receiving' && incomingCallData && (
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <img src={incomingCallData.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="caller" className="w-full h-full object-cover rounded-full border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping -z-10"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{incomingCallData.name}</h3>
                    <p className="text-gray-400 mb-8">{isVideoCall ? 'Incoming Video Call...' : 'Incoming Audio Call...'}</p>
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={rejectCall} className="btn btn-error btn-circle btn-lg text-white shadow-lg hover:scale-105 transition-transform">
                            <PhoneOff className="w-6 h-6" />
                        </button>
                        <button onClick={answerCall} className="btn btn-success btn-circle btn-lg text-white shadow-lg hover:scale-105 transition-transform">
                            {isVideoCall ? <Video className="w-6 h-6" /> : <PhoneIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            )}

            {callState === 'calling' && (
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <img src={remoteUserParams?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="caller" className="w-full h-full object-cover rounded-full" />
                        <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{remoteUserParams?.name}</h3>
                    <p className="text-gray-400 mb-8">Calling...</p>
                    <button onClick={endCall} className="btn btn-error btn-circle btn-lg text-white shadow-lg hover:scale-105 transition-transform">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            )}

            {callState === 'active' && (
                <div className="w-full h-full flex flex-col md:p-4 animate-in fade-in duration-300 relative">
                    <div className="relative flex-1 bg-black rounded-none md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center">
                        
                        {/* Audio Call Logic */}
                        {!isVideoCall && (
                             <div className="flex flex-col items-center gap-4 z-10">
                                <img src={remoteUserParams?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/10" />
                                <span className="text-xl text-white font-semibold">{remoteUserParams?.name}</span>
                                {remoteStream && <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />}
                             </div>
                        )}

                        {/* Video Call Logic */}
                        {isVideoCall && (
                            <>
                                {/* Remote Video */}
                                {remoteStream && (
                                    <div 
                                        className={isSwapped ? pipClasses + ' border-white/10' : mainClasses}
                                        onClick={() => isSwapped && setIsSwapped(false)}
                                    >
                                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                                    </div>
                                )}
                                
                                {/* Local Video */}
                                <div 
                                    className={isSwapped ? mainClasses : pipClasses + (isVideoOff ? ' border-red-500/50' : ' border-white/10')}
                                    onClick={() => !isSwapped && setIsSwapped(true)}
                                >
                                    {!isVideoOff ? (
                                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <VideoOff className="w-6 h-6 md:w-10 md:h-10 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Controls Bottom Bar (Hidden when Minimized) */}
                        {!isMinimized && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#111]/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 z-50">
                                <button onClick={toggleMute} className={`btn btn-circle ${isMuted ? 'btn-error/20 text-red-400 border-red-500/50' : 'btn-ghost hover:bg-white/10 text-white'}`}>
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                {isVideoCall && (
                                    <button onClick={toggleVideo} className={`btn btn-circle ${isVideoOff ? 'btn-error/20 text-red-400 border-red-500/50' : 'btn-ghost hover:bg-white/10 text-white'}`}>
                                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                                    </button>
                                )}
                                <button onClick={endCall} className="btn btn-error btn-circle w-14 h-14 hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                    <PhoneOff className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        )}

                        {/* Hover End-Call Overlay (When Minimized) */}
                        {isMinimized && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-50">
                                <button onClick={endCall} className="btn btn-error btn-circle w-14 h-14 hover:scale-110 transition-transform shadow-xl">
                                    <PhoneOff className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        )}

                        {/* Top Left User Identifier */}
                        {!isMinimized && (
                            <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 z-50">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-white font-medium">{remoteUserParams?.name}</span>
                            </div>
                        )}

                        {/* Minimize/Maximize Toggle */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="absolute top-6 right-6 z-50 btn btn-circle btn-sm btn-ghost bg-black/40 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4" />}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}
