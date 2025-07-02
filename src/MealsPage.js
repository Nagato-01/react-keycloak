import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';

const MealsPage = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    typeRepas: 'plat principal',
    prix: '',
    relation: '',
    idUser: 1 // Par défaut, peut être récupéré dynamiquement
  });
  const [message, setMessage] = useState('');

  // Fonction pour récupérer le token du localStorage
  const getToken = () => {
    try {
      const token = localStorage.getItem('acces_token');
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  // Configuration des headers avec token
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Charger la liste des repas au démarrage
  useEffect(() => {
    loadMeals();
  }, []);

  // Fonction pour charger tous les repas
  const loadMeals = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    try {
      const token = getToken();
      if (!token) {
        setMessage('Token non disponible. Veuillez vous authentifier.');
        return;
      }

      const response = await httpClient.get('{{host}}/api/repas', {
        headers: getAuthHeaders()
      });
      
      setMeals(response.data);
      setMessage(`${response.data.length} repas chargés avec succès`);
    } catch (error) {
      setMessage(`Erreur lors du chargement: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  // Fonction pour créer un nouveau repas
  const createMeal = async () => {
    setLoading(prev => ({ ...prev, create: true }));
    try {
      const token = getToken();
      if (!token) {
        setMessage('Token non disponible. Veuillez vous authentifier.');
        return;
      }

      const response = await httpClient.post('{{host}}/api/repas', formData, {
        headers: getAuthHeaders()
      });
      setMessage('Repas créé avec succès');
      setShowCreateForm(false);
      resetForm();
      loadMeals(); // Recharger la liste
    } catch (error) {
      setMessage(`Erreur lors de la création: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Fonction pour mettre à jour un repas
  const updateMeal = async () => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const token = getToken();
      if (!token) {
        setMessage('Token non disponible. Veuillez vous authentifier.');
        return;
      }

      const response = await httpClient.put('{{host}}/api/repas', formData, {
        headers: getAuthHeaders()
      });
      
      setMessage('Repas mis à jour avec succès');
      setEditingMeal(null);
      resetForm();
      loadMeals(); // Recharger la liste
    } catch (error) {
      setMessage(`Erreur lors de la mise à jour: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Fonction pour supprimer un repas
  const deleteMeal = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }

    setLoading(prev => ({ ...prev, [`delete_${id}`]: true }));
    try {
      const token = getToken();
      if (!token) {
        setMessage('Token non disponible. Veuillez vous authentifier.');
        return;
      }

      await httpClient.delete(`{{host}}/api/repas/${id}`, {
        headers: getAuthHeaders()
      });
      
      setMessage('Repas supprimé avec succès');
      loadMeals(); // Recharger la liste
    } catch (error) {
      setMessage(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [`delete_${id}`]: false }));
    }
  };

  // Fonctions utilitaires
  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      typeRepas: 'plat principal',
      prix: '',
      relation: '',
      idUser: 1
    });
  };

  const startEdit = (meal) => {
    setFormData(meal);
    setEditingMeal(meal.id);
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setShowCreateForm(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMeal) {
      updateMeal();
    } else {
      createMeal();
    }
  };

  return (
    <div>
      {/* Information sur l'authentification */}
      <Card style={{ 
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d7ff',
        borderRadius: '8px',
        padding: '0',
        marginBottom: '30px'
      }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{ 
            margin: '0 0 10px 0',
            color: '#0066cc',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            🍽️ Gestion des Repas
          </h3>
          <p style={{ margin: '0', color: '#004499', lineHeight: '1.5' }}>
            Cette page permet de gérer les repas via lAPI Symfony avec authentification JWT.
            <br />
            <strong>Statut:</strong> {getToken() ? '✅ Authentifié' : '❌ Non authentifié'}
          </p>
        </div>
      </Card>

      {/* Boutons d'action */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={loadMeals}
          disabled={loading.list}
          style={{
            padding: '10px 20px',
            border: '1px solid #28a745',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: loading.list ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading.list ? 'Chargement...' : '🔄 Recharger la liste'}
        </button>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 20px',
            border: '1px solid #007bff',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {showCreateForm ? '❌ Annuler' : '➕ Nouveau repas'}
        </button>
      </div>

      {/* Formulaire de création/modification */}
      {showCreateForm && (
        <Card style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '0',
          marginBottom: '30px'
        }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              {editingMeal ? '✏️ Modifier le repas' : '➕ Créer un nouveau repas'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                  Nom du repas *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                  Type de repas
                </label>
                <select
                  name="typeRepas"
                  value={formData.typeRepas}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="entrée">Entrée</option>
                  <option value="plat principal">Plat principal</option>
                  <option value="dessert">Dessert</option>
                  <option value="boisson">Boisson</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                  Prix (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                  Origine/Relation
                </label>
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  placeholder="ex: français, italien, sénégalais..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading.create || loading.update}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #28a745',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: (loading.create || loading.update) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {loading.create || loading.update ? 'Enregistrement...' : (editingMeal ? 'Modifier' : 'Créer')}
                </button>
                
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #6c757d',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Message de statut */}
      {message && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '20px',
          backgroundColor: message.includes('Erreur') ? '#f8d7da' : '#d4edda',
          color: message.includes('Erreur') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Erreur') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      {/* Liste des repas */}
      <Card style={{ 
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '0'
      }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            color: '#495057',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            📋 Liste des repas ({meals.length})
          </h3>
          
          {meals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
              Aucun repas trouvé. Cliquez sur Recharger la liste ou créez un nouveau repas.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Nom
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Type
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Prix
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Origine
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Description
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057', border: '1px solid #dee2e6' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal) => (
                    <tr key={meal.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '500' }}>
                        {meal.nom}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        {meal.typeRepas}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '500' }}>
                        {meal.prix}€
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        {meal.relation || '-'}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', maxWidth: '200px' }}>
                        <div style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={meal.description}>
                          {meal.description || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => startEdit(meal)}
                            style={{
                              padding: '5px 10px',
                              border: '1px solid #ffc107',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            disabled={loading[`delete_${meal.id}`]}
                            style={{
                              padding: '5px 10px',
                              border: '1px solid #dc3545',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              borderRadius: '3px',
                              cursor: loading[`delete_${meal.id}`] ? 'not-allowed' : 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {loading[`delete_${meal.id}`] ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MealsPage;
