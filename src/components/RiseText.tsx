/**
 * Splits a heading into masked words for the rise animation, while screen
 * readers get the sentence whole: the visual words are aria-hidden and the
 * real text sits beside them, visually hidden.
 */
export function RiseText({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="linea-mascara">
            <span data-rise className="inline-block">
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        ))}
      </span>
    </>
  )
}
