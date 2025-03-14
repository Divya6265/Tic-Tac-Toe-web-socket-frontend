

import { useEffect, useState } from 'react'
import './App.css'
import Square from './components/Square'
import { io } from "socket.io-client"
import Swal from 'sweetalert2'


function App() {
  const mat = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
  const [currentPlayer, setCurrentPlayer] = useState("")
  const [gameState, setGameState] = useState(mat)
  const [finishedState, setFinishedState] = useState(false)
  const [winner, setWinner] = useState("")
  const [moves, setMoves] = useState(0)
  const [finishedArray, setFinishedArray] = useState([])
  const [playOnline, setPlayOnline] = useState(null)
  const [socket, setSocket] = useState(null)
  const [PlayerName, setPlayerName] = useState("")
  const [opponent, setOpponent] = useState("")
  const [opponentLeft, setOpponentLeft] = useState(false)

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter  your name!";
        }
      }
    });
    return result
  }



  const handleRematch = () => {
    socket?.emit("request_to_replay", {

    })
  }

  socket?.on("accept_or_Denai", (data) => {
    if (data.rematchRequested) {
      Swal.fire({
        title: "Rematch Requested",
        text: "Your opponent wants a rematch. Do you accept?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Accept",
        cancelButtonText: "Decline",
      }).then(result => {
        socket?.emit("accept_or_Denai_respo", {
          responce: result.isConfirmed
        })
      })
    }
  })



  socket?.on("reset_game", (data) => {
    if (data.responce) {
      setCurrentPlayer(data.currentPlayer)
      setGameState(mat)
      setFinishedArray([])
      setFinishedState(false)
      setWinner("")
      setMoves(0)
    }
  })

  const handleAgain = () => {
    socket?.emit("request_to_play", {
      PlayerName: PlayerName,
      Playing: false
    })
    setGameState(mat)
    setFinishedArray([])
    setFinishedState(false)
    setWinner("")
    setMoves(0)
    setOpponent("")
    setOpponentLeft(false)

  }
  const handlePlay = async () => {
    const result = await takePlayerName()
    if (result.isConfirmed) {
      const username = result.value
      setPlayerName(username)
      setCurrentPlayer(username)
      const newSocket = new io("http://127.0.0.1:8000", {
        // const newSocket = new io("https://tic-tac-toe-web-socket-backend.onrender.com", {
        autoConnect: true
      })

      newSocket?.emit("request_to_play", {
        PlayerName: username
      })
      setSocket(newSocket)
    }
  }


  socket?.on("connect", () => {
    setPlayOnline(true)
  })

  socket?.on("OpponentFound", (data) => {
    setOpponent(data.OpponentName)
    setCurrentPlayer(data.currentPlayer)
  })

  socket?.on("OpponentNotFound", (data) => {
    setOpponent(null)
  })

  socket?.on("opponentLeftTheRoom", (data) => {
    setOpponentLeft(data.opponentLeft)
  })


  return (

    <div className='bg-[#4b495f] text-white w-full h-screen '>

{
  playOnline && socket === null && (
    <div className='flex justify-center items-center h-full'>
      <div className="load-man"></div> {/* Loading icon */}
      <p className='text-3xl font-semibold'>
        Socket connection is yet to be established. Please wait. This is due to Vercel server priority. If possible, please download the code from GitHub and run it on your local machine.
      </p>
    </div>
  )
}
      {!playOnline &&
        <div className='flex justify-center items-center h-full'>
          <button onClick={handlePlay} className='bg-[#e4ca56]  border-0 font-semibold text-5xl text-black py-3 px-2 rounded cursor-pointer '>Play Online</button>

        </div>
      }
      {playOnline && opponent == null &&
        <div className='flex justify-center items-center h-full'>
          <p className='text-4xl font-semibold'>waiting for opponent....</p>
        </div>}



      {
        playOnline && (opponent !== null) && opponentLeft && <div className='flex flex-col justify-center items-center h-full'>
          <p className='text-4xl font-semibold'>
            {
              finishedState ?
                "Opponent left match !" :
                "Opponent left match you won the game!"
            }
          </p>
          <button onClick={handleAgain} className='bg-[#e4ca56]  border-0 font-semibold text-xl text-black mt-3 py-1 px-2 rounded cursor-pointer '>Play Again</button>
        </div>

      }

      {playOnline && (opponent !== null) && <div className=' w-fit gap-5 m-auto flex flex-col pt-30'>
        <div className='flex justify-between w-120'>
          <p className={`h-12 w-45 rounded-bl-[50px] pt-3 pb-3 text-center rounded-tr-[50px] font-semibold ${!finishedState && currentPlayer === PlayerName ? 'bg-[#DD7F9F]' : 'bg-[#62607b]'}  `}>{PlayerName}</p>

          <p className={`h-12 w-45 rounded-bl-[50px] pt-3 pb-3 text-center rounded-tr-[50px] font-semibold ${!finishedState && currentPlayer === opponent ? 'bg-[#3FA7F0]' : 'bg-[#62607b]'}  `}>{opponent}</p>
        </div>
        <div className='m-auto felx flex-col justify-center items-center'>
          <h1 className='text-4xl text-center rounded bg-[#62607b] py-3 m-auto px-12 font-semibold w-80'>Tic Tac Toe</h1>
          <div className={`w-fit grid grid-cols-3 mt-6 gap-4 m-auto place-items-center`}>
            {gameState.map((arr, row) => {
              return arr.map((e, col) => {
                return <Square
                  key={row * 3 + col}
                  id={row * 3 + col}
                  sign={e}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  gameState={gameState}
                  setGameState={setGameState}
                  finishedState={finishedState}
                  setFinishedState={setFinishedState}
                  winner={winner}
                  setWinner={setWinner}
                  moves={moves}
                  setMoves={setMoves}
                  finishedArray={finishedArray}
                  setFinishedArray={setFinishedArray}
                  PlayerName={PlayerName}
                  opponent={opponent}
                  socket={socket}

                />
              })
            })}

          </div>
          <div className='w-100 flex flex-col items-center'>
            {finishedState && winner !== "Draw" && <p className='text-2xl font-semibold text-center mt-4'>{winner === PlayerName ? "You" : winner} won the game</p>}
            {finishedState && winner === "Draw" && <p className='text-2xl font-semibold mt-4 text-center'>it's a Draw! game over</p>}
            {finishedArray && winner &&
              <button onClick={handleRematch} className='bg-[#e4ca56]  border-0 font-semibold text-xl text-black mt-3 py-1 px-2 w-fit rounded cursor-pointer'>Want a Rematch</button>
            }

            {!finishedState && opponent && <p className='text-2xl font-semibold text-center mt-4'>You are playing against  {opponent} </p>}
          </div>

        </div>
      </div>}
    </div>
  )
}

export default App
