import React from 'react'

export default function Hand({cards}) {
  return (
    <div>
        {cards && cards.map((card, idx) => {
            return (
                <div key={idx}>
                    <img src={card.image} alt={card.code} />
                </div>
            )
        })}
        </div>
  )
}
import React from 'react'

export default function Hand() {
  return (
    <div>Hand</div>
  )
}
