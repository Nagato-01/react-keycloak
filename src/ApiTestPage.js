import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';

const ApiTestPage = () => {
  const [apiResults, setApiResults] = useState({});
  const [loading, setLoading] = useState({});

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

  // Fonction générique pour appeler les API
  const callApi = async (endpoint, apiName) => {
    setLoading(prev => ({ ...prev, [apiName]: true }));
    
    try {
      const token = getToken();
      if (!token) {
        setApiResults(prev => ({ 
          ...prev, 
          [apiName]: { error: 'Token non disponible dans localStorage' } 
        }));
        return;
      }

      // Configuration de la requête avec le token JWT
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await httpClient.get(endpoint, config);
      
      setApiResults(prev => ({ 
        ...prev, 
        [apiName]: { 
          success: true, 
          data: response.data,
          status: response.status 
        } 
      }));

    } catch (error) {
      setApiResults(prev => ({ 
        ...prev, 
        [apiName]: { 
          error: error.response?.data?.message || error.message,
          status: error.response?.status || 'Network Error'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }));
    }
  };

  // Fonction pour créer un utilisateur
  const createUser = async () => {
    setLoading(prev => ({ ...prev, 'createuser': true }));
    
    try {
      const token = getToken();
      if (!token) {
        setApiResults(prev => ({ 
          ...prev, 
          'createuser': { error: 'Token non disponible dans localStorage' } 
        }));
        return;
      }

      const userData = {
        username: 'testuser_' + Date.now(),
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await httpClient.post('{{host}}/api/createuser', userData, config);
      
      setApiResults(prev => ({ 
        ...prev, 
        'createuser': { 
          success: true, 
          data: response.data,
          status: response.status,
          sentData: userData 
        } 
      }));

    } catch (error) {
      setApiResults(prev => ({ 
        ...prev, 
        'createuser': { 
          error: error.response?.data?.message || error.message,
          status: error.response?.status || 'Network Error'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, 'createuser': false }));
    }
  };

  const apiTests = [
    {
      id: 1,
      name: 'token',
      description: 'Vérifier la validité du token JWT',
      endpoint: '{{host}}/api/token',
      action: () => callApi('{{host}}/api/token', 'token')
    },
    {
      id: 2,
      name: 'user',
      description: 'Récupérer les informations utilisateur',
      endpoint: '{{host}}/api/user',
      action: () => callApi('{{host}}/api/user', 'user')
    },
    {
      id: 3,
      name: 'admin',
      description: 'Accéder aux données administrateur',
      endpoint: '{{host}}/api/admin',
      action: () => callApi('{{host}}/api/admin', 'admin')
    },
    {
      id: 4,
      name: 'createuser',
      description: 'Créer un nouvel utilisateur',
      endpoint: '{{host}}/api/createuser',
      action: createUser
    }
  ];

  const renderResult = (apiName) => {
    const result = apiResults[apiName];
    if (!result) return 'Aucun test effectué';

    if (result.error) {
      return (
        <div style={{ color: '#dc3545' }}>
          <strong>Erreur ({result.status}):</strong><br />
          {result.error}
        </div>
      );
    }

    if (result.success) {
      return (
        <div style={{ color: '#28a745' }}>
          <strong>Succès ({result.status}):</strong><br />
          {apiName === 'createuser' && result.sentData && (
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#6c757d' }}>
              <strong>Données envoyées:</strong><br />
              {JSON.stringify(result.sentData, null, 2)}
            </div>
          )}
          <pre style={{ 
            fontSize: '12px', 
            maxHeight: '200px', 
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            margin: '5px 0 0 0'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <div>
      {/* Information sur le token */}
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
            📋 Information
          </h3>
          <p style={{ margin: '0', color: '#004499', lineHeight: '1.5' }}>
            Ces tests utilisent le token JWT stocké dans localStorage pour authentifier les requêtes vers les API Symfony.
            <br />
            <strong>Token actuel:</strong> {getToken() ? '✅ Disponible' : '❌ Non disponible'}
          </p>
        </div>
      </Card>

      {/* Tableau des tests API */}
      <div style={{ marginBottom: '30px' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                padding: '15px 20px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#495057',
                width: '60px'
              }}>
                N°
              </th>
              <th style={{ 
                padding: '15px 20px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#495057'
              }}>
                Description
              </th>
              <th style={{ 
                padding: '15px 20px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#495057',
                width: '200px'
              }}>
                Endpoint
              </th>
              <th style={{ 
                padding: '15px 20px', 
                textAlign: 'center', 
                fontWeight: '600',
                color: '#495057',
                width: '120px'
              }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {apiTests.map((test, index) => (
              <tr key={test.id} style={{ 
                borderTop: index > 0 ? '1px solid #e9ecef' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'white'}>
                <td style={{ 
                  padding: '15px 20px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  {test.id}
                </td>
                <td style={{ 
                  padding: '15px 20px',
                  color: '#495057'
                }}>
                  {test.description}
                </td>
                <td style={{ 
                  padding: '15px 20px',
                  color: '#6c757d',
                  fontSize: '13px',
                  fontFamily: 'Monaco, Consolas, monospace'
                }}>
                  {test.endpoint.replace('{{host}}', 'API')}
                </td>
                <td style={{ 
                  padding: '15px 20px', 
                  textAlign: 'center'
                }}>
                  <button
                    onClick={test.action}
                    disabled={loading[test.name]}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #dee2e6',
                      backgroundColor: loading[test.name] ? '#f8f9fa' : 'white',
                      color: loading[test.name] ? '#6c757d' : '#495057',
                      borderRadius: '4px',
                      cursor: loading[test.name] ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading[test.name]) {
                        e.target.style.backgroundColor = '#e9ecef';
                        e.target.style.borderColor = '#adb5bd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading[test.name]) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#dee2e6';
                      }
                    }}
                  >
                    {loading[test.name] ? 'Chargement...' : 'Tester'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résultats des API */}
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))' }}>
        {apiTests.map((test) => (
          <Card key={test.name} style={{ 
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '0'
          }}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                margin: '0 0 15px 0',
                color: '#495057',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                📡 {test.description}
              </h3>
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                minHeight: '60px',
                wordBreak: 'break-all',
                fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                fontSize: '13px',
                color: '#495057',
                lineHeight: '1.4'
              }}>
                {renderResult(test.name)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApiTestPage;
