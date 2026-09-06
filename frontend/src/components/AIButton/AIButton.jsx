function AIButton({ label = 'Спросить AI', onClick }) {
  return (
    <button className="ai-button" type="button" onClick={onClick}>
      {label}
    </button>
  )
}

export default AIButton
