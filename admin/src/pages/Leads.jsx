import { useState, useEffect } from 'react'
import { api } from '../api'

const statuses = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'contacted', label: 'В работе' },
  { value: 'closed', label: 'Закрыты' },
]

const statusColors = {
  new: 'bg-accent/20 text-accent',
  contacted: 'bg-warning/20 text-warning',
  closed: 'bg-text-secondary/20 text-text-secondary',
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const loadLeads = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      const data = await api.getLeads(params)
      setLeads(data.leads)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { loadLeads() }, [filter])

  const updateStatus = async (id, status) => {
    await api.updateLead(id, { status })
    loadLeads()
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  const updateNotes = async (id, notes) => {
    await api.updateLead(id, { notes })
    loadLeads()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Заявки ({total})</h1>

      <div className="flex gap-2 mb-4">
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
              filter === s.value
                ? 'bg-primary text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <p className="p-6 text-text-secondary">Загрузка...</p>
          ) : leads.length === 0 ? (
            <p className="p-6 text-text-secondary">Заявок нет</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="text-left px-4 py-3 font-medium">Имя</th>
                  <th className="text-left px-4 py-3 font-medium">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium">Услуга</th>
                  <th className="text-left px-4 py-3 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      selected?.id === lead.id ? 'bg-primary/10' : 'hover:bg-bg-input/50'
                    }`}
                  >
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{lead.phone}</td>
                    <td className="px-4 py-3 text-text-secondary">{lead.service || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[lead.status] || ''}`}>
                        {statuses.find(s => s.value === lead.status)?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(lead.created_at).toLocaleDateString('ru')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="w-80 bg-bg-card rounded-xl border border-border p-5 h-fit sticky top-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-text-secondary hover:text-text cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary">Телефон</p>
                <p>{selected.phone}</p>
              </div>
              <div>
                <p className="text-text-secondary">Услуга</p>
                <p>{selected.service || '—'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Сообщение</p>
                <p>{selected.message || '—'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Источник</p>
                <p>{selected.source || 'website'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Дата</p>
                <p>{new Date(selected.created_at).toLocaleString('ru')}</p>
              </div>

              <div>
                <p className="text-text-secondary mb-1.5">Статус</p>
                <div className="flex gap-1.5">
                  {statuses.filter(s => s.value).map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(selected.id, s.value)}
                      className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                        selected.status === s.value
                          ? 'bg-primary text-white'
                          : 'bg-bg-input text-text-secondary hover:text-text'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-text-secondary mb-1.5">Заметки</p>
                <textarea
                  defaultValue={selected.notes || ''}
                  onBlur={e => updateNotes(selected.id, e.target.value)}
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text resize-none focus:outline-none focus:border-primary"
                  rows={3}
                  placeholder="Добавить заметку..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
