"use client"

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
const PeerContext = React.createContext();
export const usePeer = () => useContext(PeerContext);

export const PeerProvider = (props) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const [peer, setPeer] = useState(null);
    useEffect(() => {
        const myPeer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com.19302",
                            "stun:global.stun.twilio.com.3478"
                        ]
                    }
                ]
            });
        setPeer(myPeer);
    }, [])

    const createOffer = async() => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }
    const createAnswer = async(offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async(ans) => {
        console.log("Ans is", ans);
        await peer.setRemoteDescription(ans);
    }

    const sendStream = async(stream) => {
        const currentTracks = peer.getSenders();
        // Remove previous tracks from the peer connection
        currentTracks.forEach((sender) => {
            peer.removeTrack(sender);
        });
        console.log("Stream is sending...")
        const tracks = stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, stream);
        }
    }

    const handelTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        console.log("Stream Received!!!", streams[0])
        setRemoteStream(streams[0]);
    }, []);

    useEffect(() => {
        peer?.addEventListener('track', handelTrackEvent);

        return () => {
            peer?.removeEventListener('track', handelTrackEvent);
        }
    }, [handelTrackEvent, peer])

    return (
        <PeerContext.Provider value={{peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream}}>
            {props.children}
        </PeerContext.Provider>
    )
}
