

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
  const [issocketConnected, setIssocketConnected] = useState(false)
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
      setPlayOnline(true)
      setSocket(newSocket)
    }
  }


  socket?.on("connect", () => {
    setIssocketConnected(true)
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
      {!playOnline &&
        <div className='flex justify-center items-center h-full'>
          <button onClick={handlePlay} className='bg-[#e4ca56]  border-0 font-semibold text-5xl text-black py-3 px-2 rounded cursor-pointer '>Play Online</button>
        </div>

      }

      { playOnline && !issocketConnected
         && (
          <div className='flex p-2 justify-center flex-col gap-10 items-center h-full'>

            <div role="status">
              <svg aria-hidden="true" class="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
            </div>

            <p className='text-xl text-center font-semibold'>
              Socket connection is yet to be established. Please wait. This is due to Vercel server priority. If possible, please download the code from GitHub and run it on your local machine.
            </p>
          </div>
        )
      }


      {playOnline && issocketConnected && opponent == null &&
        <div className='flex justify-center items-center h-full'>
          <p className='text-4xl font-semibold'>waiting for opponent....</p>
        </div>}



      {
        playOnline && issocketConnected && (opponent !== null) && opponentLeft && <div className='flex flex-col justify-center items-center h-full'>
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

      {playOnline && issocketConnected && (opponent !== null) && <div className=' w-fit gap-5 m-auto flex flex-col pt-30'>
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
