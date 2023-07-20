"use client"

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './providers/Socket';
import { useRouter } from 'next/navigation';

export default function Home() {
  const socket = useSocket();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const handleRoomJoined = useCallback(({roomId}) => {
    // console.log('socket ', socket.id)
    router.push(`/room/${roomId}`);
  }, [router])
  useEffect(() => {
    if(socket){
      socket.on('room-joined', handleRoomJoined);
      return () => {
        socket.off('room-joined', handleRoomJoined);
      };
    }
  }, [handleRoomJoined, socket])
  
  const hendelRoomJoin = () => {
    socket.emit('join-room', {email, roomId: room})
  }
  return (
    <>
      {socket ? 
      <div className='flex justify-center w-full h-screen items-center'>
        <div className='flex flex-col w-full items-center justify-center'>
          <input value={email} onChange={e => setEmail(e.target.value)} className='m-2 w-1/3 rounded-lg p-2 outline-none text-black text-lg' placeholder='email' type="text" name="" id="" />
          <input value={room} onChange={e => setRoom(e.target.value)} className='m-2 w-1/3 rounded-lg p-2 outline-none text-black text-lg' placeholder='room id' type="text" name="" id="" />
          <button onClick={hendelRoomJoin} className='rounded-lg bg-red-500 py-2 px-4 hover:bg-red-800'>Join Room</button>
        </div>
      </div> 
      : 
      <div>Loading...</div>}
    </>
  )
}
