import React, { useState } from 'react'
import { useStore } from '@/store'
import {
  objectLibrary,
  getObjectsByCategory,
  getAllCategories,
  getCategoryIcon,
  getCategoryName,
} from '@/objects/library'
import { ObjectCategory, WorldObject } from '@/types'
import { generateId } from '@/utils/helpers'
import './ObjectLibrary.css'

/**
 * Biblioteca de objetos - Permite adicionar novos objetos à cena
 */
export const ObjectLibrary: React.FC = () => {
  const showLibrary = useStore((state) => state.showObjectLibrary)
  const toggleLibrary = useStore((state) => state.toggleObjectLibrary)
  const addObject = useStore((state) => state.addObject)
  const playerPosition = useStore((state) => state.player.position)

  const [selectedCategory, setSelectedCategory] = useState<ObjectCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (!showLibrary) return null

  const categories = getAllCategories()

  // Filtrar objetos
  const filteredObjects =
    selectedCategory === 'all'
      ? objectLibrary
      : getObjectsByCategory(selectedCategory)

  const searchedObjects = searchQuery
    ? filteredObjects.filter(
        (obj) =>
          obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obj.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredObjects

  const handleAddObject = (objectDef: any) => {
    // Criar objeto na frente do player
    const newObject: WorldObject = {
      id: generateId(),
      type: objectDef.type,
      category: objectDef.category,
      position: [
        playerPosition[0],
        playerPosition[1] - 1.5,
        playerPosition[2] - 3,
      ],
      rotation: [0, 0, 0],
      scale: objectDef.defaultSize,
      material: objectDef.defaultMaterial,
      interactive: objectDef.interactive,
      castShadow: true,
      receiveShadow: true,
      visible: true,
    }

    addObject(newObject)
  }

  return (
    <div className="object-library glass animate-slide-in-right">
      {/* Header */}
      <div className="library-header">
        <h2>Biblioteca de Objetos</h2>
        <button className="btn-icon" onClick={toggleLibrary}>
          ✕
        </button>
      </div>

      {/* Busca */}
      <div className="library-search">
        <input
          type="text"
          className="input"
          placeholder="Buscar objetos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categorias */}
      <div className="library-categories">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="category-icon">📦</span>
          <span className="category-name">Todos</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <span className="category-name">{getCategoryName(category)}</span>
          </button>
        ))}
      </div>

      {/* Lista de objetos */}
      <div className="library-objects">
        {searchedObjects.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum objeto encontrado</p>
          </div>
        ) : (
          searchedObjects.map((obj) => (
            <div
              key={obj.id}
              className="object-card"
              onClick={() => handleAddObject(obj)}
            >
              <div className="object-icon">{obj.icon || '📦'}</div>
              <div className="object-info">
                <h4 className="object-name">{obj.name}</h4>
                {obj.description && (
                  <p className="object-description">{obj.description}</p>
                )}
                <div className="object-tags">
                  {obj.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="object-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="add-btn">+</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
