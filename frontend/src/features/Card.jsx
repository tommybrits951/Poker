import React from 'react'

export default function Card({ card }) {
  return (
    <div className="card">
      {card && (
        <div>
        <img src={card.img} alt={"sorry"} />
        </div>
      )}
    </div>
  )
}
