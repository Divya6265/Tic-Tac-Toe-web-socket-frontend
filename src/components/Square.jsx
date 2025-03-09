import React, { useState, useEffect } from 'react'
import { circleSvg, crossSvg } from './icons'
function Square({
    id,
    sign,
    currentPlayer,
    setCurrentPlayer,
    gameState,
    setGameState,
    finishedState,
    setFinishedState,
    winner,
    setWinner,
    moves,
    setMoves,
    finishedArray,
    setFinishedArray,
    PlayerName,
    opponent,
    socket
}) {
    const [icon, setIcon] = useState(null)
    useEffect(() => {

        const checkWinner = () => {

            for (let row = 0; row < gameState.length; row++) {

                if (gameState[row][0] === gameState[row][1] && gameState[row][1] === gameState[row][2]) {
                    setFinishedArray([row*3+0, row*3+1, row*3+2])
                    return gameState[row][0]
                }
            }
            
            for (let col = 0; col < gameState.length; col++) {

                if (gameState[0][col] === gameState[1][col] && gameState[1][col] === gameState[2][col]) {
                    setFinishedArray([0*3+col, 1*3+col, 2*3+col])
                    return gameState[0][col]
                }
            }

            if(gameState[0][0] === gameState[1][1]  && gameState[2][2] === gameState[1][1] ){
                setFinishedArray([0, 4, 8])
                return gameState[1][1]
            }
            
            if(gameState[0][2] === gameState[1][1]  && gameState[1][1] === gameState[2][0] ){
                setFinishedArray([2, 4, 6])
                return gameState[1][1]
            }
            if(moves==9){
                return "Draw"
            }

        }
        if(checkWinner()===PlayerName || checkWinner()===opponent){
            setFinishedState(true)
            setWinner(checkWinner())
        }


    }, [gameState])

    socket?.on("playerMoveFromServer", (data) => {
        console.log(data, "from server")
        setGameState(prevState => (
            prevState.map((arr, row) =>
                arr.map((e, col) => {
                    console.log(row*3+col)
                    if ((row*3+col) == data.id) {
                        return data.currentPlayer
                    }
                    return e
                })
            ))
        )
        setCurrentPlayer(data.currentPlayer===PlayerName?opponent:PlayerName)
    })



    socket?.on("reset_game", (data) => {
        if (data.responce) {
         setIcon(null)
        }
      })
    const handleIcon = () => {
        if (!finishedState && !icon && currentPlayer==PlayerName) {
            setMoves(moves+1)
            currentPlayer == PlayerName ? setIcon(circleSvg) : setIcon(crossSvg)
            currentPlayer == PlayerName ? setCurrentPlayer(opponent) : setCurrentPlayer(PlayerName)
            const rowind = Math.floor(id / 3)
            const colind = id % 3
            setGameState(prevState => (
                prevState.map((arr, row) =>
                    arr.map((e, col) => {
                        if (row == rowind && colind == col) {
                            socket?.emit("playerMoveFromClient", {
                                id,
                                currentPlayer
                            })
                            return currentPlayer
                        }
                        return e
                    })
                ))
            )
            
            
        }
    }
    return (
        <div className={`w-20 h-20 rounded bg-[#62607b] ${winner !== PlayerName && winner!=="" ? '!bg-[#efeb8542]' : null} ${finishedState || currentPlayer!==PlayerName ? "cursor-not-allowed":""}  ${finishedArray.includes(id)?( winner===PlayerName ? '!bg-[#DD7F9F]' : 'bg-[rgb(63,167,240)]'):''}`} onClick={handleIcon}> {(sign===PlayerName) ? circleSvg : (sign===opponent ? crossSvg : icon ) }  </div>
    )
}

export default Square