import { useRef, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import '../styles/search.css'

export default function SearchBar() {
  const inputRef = useRef(null)
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    inputRef.current?.blur()
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="search__input"
        type="text"
        dir="rtl"
        lang="ar"
        placeholder="أبدأ رحلتك"
        aria-label="أبدأ رحلتك"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        className="search__btn"
        aria-label="بحث"
        onClick={() => inputRef.current?.focus()}
      >
        <MagnifyingGlass size={22} weight="light" />
      </button>
    </form>
  )
}
