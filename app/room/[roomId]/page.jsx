"use client"

import { usePeer } from '@/app/providers/Peer';
import { useSocket } from '@/app/providers/Socket'
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';

const RoomPage = () => {
    const router = useRouter();
    const socket = useSocket();
    const {peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream} = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);
    const handelNewUserJoind = useCallback(
            async({email}) => {
            // console.log('emailId ', email)
            const offer = await createOffer();
            // console.log("calling the User...", email, " with offer ", offer)
            setTimeout(() => {
              socket.emit('call-user', { email, offer });
              setRemoteEmailId(email);
            }, 400);                                                // Emit the function when socket connects succefully
        }, [createOffer, socket]
    )
    const handelIncommingCall= useCallback(async({from, offer}) => {
        console.log("Incomming call from ", from, "and offer is ", offer);
        const ans = await createAnswer(offer);
        setTimeout(() => {
          socket.emit('call-accepted', {email: from, ans});
        }, 500);
        setRemoteEmailId(from);
    }, [socket])

    const handelCallAccepted = useCallback(async({ans}) => {
      console.log("Call got accepted! ", ans)
      await setRemoteAnswer(ans);
    }, [setRemoteAnswer])

    useEffect(() => {
        if(socket){
            socket.on('user-joined', handelNewUserJoind);
            socket.on('incomming-call', handelIncommingCall);
            socket.on('call-accepted', handelCallAccepted);

            return () => {
                socket.off('user-joined', handelNewUserJoind);
                socket.off('incomming-call', handelIncommingCall);
                socket.off('call-accepted', handelCallAccepted);
              };
        }
    }, [handelCallAccepted, handelIncommingCall, handelNewUserJoind, socket])

    const getUserMediaStream = useCallback(async() => {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      setMyStream(stream);
    }, []);
    useEffect(() => {
      getUserMediaStream()
    }, [getUserMediaStream]);

  const handelNegotiation = useCallback(async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('call-user', { email: remoteEmailId, offer: offer });
    } catch (error) {
      console.error('Failed to create and send offer:', error);
    }
  }, [peer, remoteEmailId, socket]);
  
  useEffect(() => {
    peer.addEventListener('negotiationneeded', handelNegotiation);
  
    return () => {
      peer.removeEventListener('negotiationneeded', handelNegotiation);
    };
  }, [handelNegotiation, peer]);

  useEffect(() => {
    if(socket && !socket.connected){
      router.push('/');
      alert("You got disconnected")
    }
    console.log(socket)
  }, [socket])
  return (
    <div>
      Room
      <h1>You are connected to {remoteEmailId}</h1>
      <button onClick={() => sendStream(myStream)}>Send streams</button>
      <ReactPlayer url={myStream} playing muted/>
      <ReactPlayer url={remoteStream} playing/>
    </div>
  )
}

export default RoomPage