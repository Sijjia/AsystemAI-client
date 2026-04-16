import { useState, useEffect } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'

const statusLabels = { new: 'Новая', contacted: 'В работе', closed: 'Закрыта' }
const statusColors = { new: 'text-accent', contacted: 'text-warning', closed: 'text-text-secondary' }

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-text-secondary">Загрузка...</div>
  if (!data) return <div className="text-danger">Ошибка загрузки</div>

  const leadCounts = {}
  data.leads.forEach(l => { leadCounts[l.status] = parseInt(l.count) })
  const totalLeads = Object.values(leadCounts).reduce((a, b) => a + b, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Всего заявок" value={totalLeads} color="text-primary" />
        <StatCard label="Новых заявок" value={leadCounts.new || 0} color="text-accent" />
        <StatCard label="Проектов" value={data.projects.total} color="text-secondary" />
        <StatCard label="Опубликовано" value={data.projects.published} color="text-success" />
      </div>

      <div className="bg-bg-card rounded-xl border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Последние заявки</h2>
          <Link to="/admin/leads" className="text-sm text-primary hover:underline">Все заявки</Link>
        </div>

        {data.recentLeads.length === 0 ? (
          <p className="text-text-secondary">Заявок пока нет</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left py-2 font-medium">Имя</th>
                <th className="text-left py-2 font-medium">Телефон</th>
                <th className="text-left py-2 font-medium">Услуга</th>
                <th className="text-left py-2 font-medium">Статус</th>
                <th className="text-left py-2 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLeads.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-bg-input/50">
                  <td className="py-2.5">{lead.name}</td>
                  <td className="py-2.5 text-text-secondary">{lead.phone}</td>
                  <td className="py-2.5 text-text-secondary">{lead.service || '—'}</td>
                  <td className={`py-2.5 ${statusColors[lead.status] || ''}`}>
                    {statusLabels[lead.status] || lead.status}
                  </td>
                  <td className="py-2.5 text-text-secondary">
                    {new Date(lead.created_at).toLocaleDateString('ru')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
