import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const emptyProject = {
  title: '', slug: '', client: '', short_description: '', full_description: '',
  challenge: '', solution: '', result: '',
  cover_image: '', logo_image: '', tags: [], gallery: [],
  sort_order: 0, is_published: false, is_featured: false,
}

export default function ProjectEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(emptyProject)
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.getProjects().then(projects => {
        const p = projects.find(p => p.id === parseInt(id))
        if (p) setForm({
          ...emptyProject,
          ...p,
          tags: p.tags || [],
          gallery: p.gallery || [],
        })
      }).finally(() => setLoading(false))
    }
  }, [id])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const slugify = (text) => {
    const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' }
    return text.toLowerCase().replace(/[а-яё]/g, c => map[c] || c)
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (value) => {
    set('title', value)
    if (!isEdit || !form.slug) set('slug', slugify(value))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.updateProject(id, form)
      } else {
        await api.createProject(form)
      }
      navigate('/admin/projects')
    } catch (err) {
      alert('Ошибка: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Редактировать проект' : 'Новый проект'}
      </h1>

      <form onSubmit={save} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название *" value={form.title} onChange={handleTitleChange} required />
          <Field label="Slug" value={form.slug} onChange={v => set('slug', v)} />
        </div>

        <Field label="Клиент" value={form.client} onChange={v => set('client', v)} />
        <Field label="Краткое описание" value={form.short_description} onChange={v => set('short_description', v)} textarea />
        <Field label="Полное описание" value={form.full_description} onChange={v => set('full_description', v)} textarea rows={5} />

        <div className="grid grid-cols-3 gap-4">
          <Field label="Задача" value={form.challenge} onChange={v => set('challenge', v)} textarea />
          <Field label="Решение" value={form.solution} onChange={v => set('solution', v)} textarea />
          <Field label="Результат" value={form.result} onChange={v => set('result', v)} textarea />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="URL обложки" value={form.cover_image} onChange={v => set('cover_image', v)} />
          <Field label="URL логотипа" value={form.logo_image} onChange={v => set('logo_image', v)} />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Теги</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-secondary/15 text-secondary rounded-lg text-sm">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-danger cursor-pointer">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Добавить тег..."
              className="flex-1 px-4 py-2 bg-bg-input border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary"
            />
            <button type="button" onClick={addTag} className="px-4 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-secondary hover:text-text cursor-pointer">+</button>
          </div>
        </div>

        <div className="flex gap-6">
          <Field label="Порядок" type="number" value={form.sort_order} onChange={v => set('sort_order', parseInt(v) || 0)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} className="accent-primary" />
            <span className="text-sm">Опубликован</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="accent-primary" />
            <span className="text-sm">На главной</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать проект')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="px-6 py-2.5 bg-bg-input border border-border text-text-secondary rounded-lg hover:text-text cursor-pointer"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, textarea, rows = 3, type = 'text', required }) {
  const cls = "w-full px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary transition-colors"

  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} className={cls + ' resize-none'} />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className={cls} required={required} />
      )}
    </div>
  )
}
