import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const togglePublish = async (project) => {
    await api.updateProject(project.id, { ...project, is_published: !project.is_published })
    load()
  }

  const deleteProject = async (id) => {
    if (!confirm('Удалить проект?')) return
    await api.deleteProject(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Проекты ({projects.length})</h1>
        <Link
          to="/admin/projects/new"
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
        >
          + Добавить проект
        </Link>
      </div>

      {loading ? (
        <p className="text-text-secondary">Загрузка...</p>
      ) : projects.length === 0 ? (
        <div className="bg-bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-text-secondary mb-4">Проектов пока нет</p>
          <Link to="/admin/projects/new" className="text-primary hover:underline">Создать первый проект</Link>
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left px-4 py-3 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 font-medium">Название</th>
                <th className="text-left px-4 py-3 font-medium">Клиент</th>
                <th className="text-left px-4 py-3 font-medium">Теги</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-bg-input/50">
                  <td className="px-4 py-3 text-text-secondary">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.client || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(p.tags || []).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-secondary/15 text-secondary rounded text-xs">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(p)}
                      className={`px-2.5 py-0.5 rounded-full text-xs cursor-pointer ${
                        p.is_published ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {p.is_published ? 'Опубликован' : 'Черновик'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/projects/${p.id}/edit`}
                      className="text-primary hover:underline mr-3 text-xs"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="text-danger hover:underline text-xs cursor-pointer"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
