import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';
import ApiTestPage from './ApiTestPage';
import MealsPage from './MealsPage';

import Keycloak from 'keycloak-js';

/*
  Init Options
*/
let initOptions = {
  url: 'http://keycloak.test/',
  realm: 'react-symfony-realm',
  clientId: 'react-client2'
};

let kc = new Keycloak(initOptions);

kc.init({
  onLoad: 'login-required',
  checkLoginIframe: true,
  pkceMethod: 'S256'
}).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    localStorage.setItem('acces_token', JSON.stringify(kc.token));
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;

    kc.onTokenExpired = () => {
      console.log('token expired');
    };
  }
}, () => {
  console.error('Authentication Failed');
});

// Composant de navigation
function Navigation() {
  const location = useLocation();
  
  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const linkStyle = {
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    color: '#495057',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: '1px solid #dee2e6'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd'
  };

  return (
    <nav style={navStyle}>
      <Link 
        to="/" 
        style={location.pathname === '/' ? activeLinkStyle : linkStyle}
      >
        Tests Keycloak
      </Link>
      <Link 
        to="/api-tests" 
        style={location.pathname === '/api-tests' ? activeLinkStyle : linkStyle}
      >
        Tests API Symfony
      </Link>
      <Link 
        to="/meals" 
        style={location.pathname === '/meals' ? activeLinkStyle : linkStyle}
      >
        Gestion des Repas
      </Link>
    </nav>
  );
}

// Page principale des tests Keycloak
function KeycloakTestPage() {
  const [infoMessage, setInfoMessage] = useState('Cliquez sur une action pour voir le résultat');

  const callBackend = () => {
    httpClient.get('https://mockbin.com/request');
    setInfoMessage('Requête HTTP envoyée avec succès');
  };

  const testActions = [
    {
      id: 1,
      description: 'Vérifier l\'état d\'authentification',
      action: () => setInfoMessage(kc.authenticated ? 'Authentifié: OUI' : 'Authentifié: NON')
    },
    {
      id: 2,
      description: 'Se connecter',
      action: () => kc.login()
    },
    {
      id: 3,
      description: 'Afficher le token d\'accès',
      action: () => setInfoMessage(kc.token || 'Aucun token disponible')
    },
    {
      id: 4,
      description: 'Afficher le token parsé',
      action: () => setInfoMessage(JSON.stringify(kc.tokenParsed, null, 2) || 'Aucun token parsé disponible')
    },
    {
      id: 5,
      description: 'Vérifier l\'expiration du token',
      action: () => setInfoMessage(`Token expiré: ${kc.isTokenExpired(5) ? 'OUI' : 'NON'}`)
    },
    {
      id: 6,
      description: 'Actualiser le token',
      action: () => kc.updateToken(10).then(
        (refreshed) => setInfoMessage(`Token actualisé: ${refreshed ? 'OUI' : 'NON'}`),
        () => setInfoMessage('Erreur lors de l\'actualisation')
      )
    },
    {
      id: 7,
      description: 'Envoyer une requête HTTP',
      action: callBackend
    },
    {
      id: 8,
      description: 'Se déconnecter',
      action: () => kc.logout({ redirectUri: 'http://localhost:3001/' })
    },
    {
      id: 9,
      description: 'Vérifier le rôle "Admin"',
      action: () => setInfoMessage(`Rôle Admin: ${kc.hasRealmRole('admin') ? 'OUI' : 'NON'}`)
    },
    {
      id: 10,
      description: 'Vérifier le rôle client "test"',
      action: () => setInfoMessage(`Rôle client "test": ${kc.hasResourceRole('test') ? 'OUI' : 'NON'}`)
    }
  ];

  return (
    <>
      {/* Tableau des fonctionnalités */}
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
                width: '80px'
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
            {testActions.map((test, index) => (
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
                  textAlign: 'center'
                }}>
                  <button
                    onClick={test.action}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #dee2e6',
                      backgroundColor: 'white',
                      color: '#495057',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.borderColor = '#adb5bd';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dee2e6';
                    }}
                  >
                    Tester
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panneau de résultats */}
      <Card style={{ 
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '0'
      }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{ 
            margin: '0 0 15px 0',
            color: '#495057',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            Résultat
          </h3>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            minHeight: '60px',
            wordBreak: 'break-all',
            fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
            fontSize: '14px',
            color: '#495057',
            lineHeight: '1.5'
          }}>
            {infoMessage}
          </div>
        </div>
      </Card>
    </>
  );
}

function App() {
  return (
    <Router>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Grand titre de l'application */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '300',
            color: '#2c3e50',
            margin: '0',
            letterSpacing: '1px'
          }}>
            SIMS - Interface de Test
          </h1>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '1.1rem',
            margin: '10px 0 0 0'
          }}>
            Keycloak, React & Symfony - Démonstration d intégration
          </p>
        </div>

        <Navigation />

        <Routes>
          <Route path="/" element={<KeycloakTestPage />} />
          <Route path="/api-tests" element={<ApiTestPage />} />
          <Route path="/meals" element={<MealsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
