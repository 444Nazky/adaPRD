import { useEffect, useRef, type ElementType, type KeyboardEvent, type ClipboardEvent, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import type { Priority } from '../types'

type EditableTextProps = {
  value: string
  onChange: (value: string) => void
  as?: ElementType
  className?: string
  placeholder?: string
  ariaLabel?: string
  multiline?: boolean
  onFocus?: () => void
}

export function EditableText({
  value,
  onChange,
  as: Tag = 'div',
  className = '',
  placeholder = 'Klik untuk menulis…',
  ariaLabel,
  multiline = false,
  onFocus,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (document.activeElement === element) return
    if (element.innerText !== value) element.innerText = value
  }, [value])

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.currentTarget.blur()
    }
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, multiline ? text : text.replace(/\s*\n\s*/g, ' '))
  }

  return (
    <Tag
      ref={ref as never}
      className={`editable ${className}`.trim()}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      spellCheck
      onInput={(event: FormEvent<HTMLElement>) => onChange(event.currentTarget.innerText)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={onFocus}
    />
  )
}

type EditableListProps = {
  items: string[]
  onChange: (items: string[]) => void
  addLabel?: string
  compact?: boolean
  numbered?: boolean
  className?: string
}

export function EditableList({
  items,
  onChange,
  addLabel = 'Tambah poin',
  compact = false,
  numbered = false,
  className = '',
}: EditableListProps) {
  const update = (index: number, value: string) => {
    const next = [...items]
    next[index] = value
    onChange(next)
  }
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const add = () => onChange([...items, ''])

  return (
    <div className={`editable-list ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      {items.map((item, index) => (
        <div className="editable-list-row" key={index}>
          <span className={`list-marker ${numbered ? 'is-number' : ''}`}>{numbered ? String(index + 1).padStart(2, '0') : ''}</span>
          <EditableText
            value={item}
            onChange={(value) => update(index, value)}
            className="editable-list-text"
            placeholder="Tulis detail…"
            ariaLabel={`Poin ${index + 1}`}
          />
          <button className="icon-button tiny row-delete" type="button" title="Hapus" onClick={() => remove(index)}>
            <X size={13} />
          </button>
        </div>
      ))}
      <button className="add-inline-button" type="button" onClick={add}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}

export function PrioritySelect({
  value,
  onChange,
  compact = false,
}: {
  value: Priority
  onChange: (priority: Priority) => void
  compact?: boolean
}) {
  return (
    <span className={`priority-select priority-${value.toLowerCase()} ${compact ? 'compact' : ''}`}>
      <span className="priority-dot" />
      <select
        value={value}
        aria-label="Prioritas"
        onChange={(event) => onChange(event.target.value as Priority)}
        onClick={(event) => event.stopPropagation()}
      >
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
      </select>
    </span>
  )
}
