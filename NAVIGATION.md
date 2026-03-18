# Navigation Guide - OCP Energy Dashboard

## Sidebar Navigation

Le sidebar de navigation permet d'accéder facilement à tous les modules du système.

### Structure de la Navigation

Le sidebar est divisé en deux sections principales :

#### 1. **Section Principale**
- **Dashboard** (🏠 Accueil)
  - Vue d'ensemble complète du système
  - Résumé des données, PCMCI, anomalies et Q-Learning
  - Accès rapide à tous les modules via des onglets
  - Liens directs vers les pages détaillées

#### 2. **Section Analyse & Insights**

- **Analyse PCMCI** (🌐 Network)
  - Détection de causalité dans les données
  - Graphe causal des relations entre variables
  - Liens significatifs identifiés
  - Lags temporels et forces de relation

- **Anomalies** (⚠️ AlertTriangle)
  - Résultats de détection d'anomalies
  - Ensemble-based detection (Isolation Forest + CUSUM)
  - Timeline des anomalies détectées
  - Statistiques et distributions

- **Stratégie RL** (⚡ Zap)
  - Optimisation Q-Learning
  - Performances d'entraînement et backtesting
  - Politique de contrôle apprise
  - Comparaison avec stratégie de base

- **Insights** (💡 Lightbulb)
  - Recommandations clés
  - Prochaines étapes
  - Résumé exécutif

### Fonctionnalités du Sidebar

#### Collapse/Expand
- **Desktop**: Cliquez sur la flèche dans l'en-tête du sidebar pour réduire/agrandir
- **Mobile**: Le menu reste réduit pour maximiser l'espace

#### Responsive Design
- **Desktop (≥768px)**: Sidebar fixe sur la gauche
- **Mobile (<768px)**: Sidebar coulissant avec toggle dans le coin supérieur gauche

#### Indicateurs Actifs
- L'item actif est mis en évidence en bleu
- La description courte aide à identifier rapidement le contenu

### Breadcrumbs

Le système de breadcrumbs permet de naviguer facilement dans la hiérarchie :

- **Accueil** → Représente la page d'accueil
- **Accueil > Analyse PCMCI** → Vous êtes sur la page PCMCI
- Cliquez sur n'importe quel segment pour y revenir

### Naviation par Page

#### Page d'Accueil (Dashboard)
```
Dashboard
├── Overview (Métriques principales)
├── PCMCI Analysis (Résumé causal)
├── Anomalies (Résumé détection)
├── Q-Learning (Résumé stratégie)
└── Documentation (Références techniques)
```

#### Pages Détaillées
Chaque page détaillée inclut :
- En-tête avec titre et description
- Breadcrumbs pour retour facile
- Contenu principal organisé
- Liens de retour vers le dashboard

### Raccourcis Clavier (À venir)

- `H` : Aller à l'Accueil
- `P` : Aller à PCMCI
- `A` : Aller aux Anomalies
- `R` : Aller à la Stratégie RL
- `I` : Aller aux Insights

### Flux de Navigation Recommandé

1. **Démarrage**: Commencez par le **Dashboard** pour une vue d'ensemble
2. **Analyse**: Explorez l'**Analyse PCMCI** pour comprendre les dépendances
3. **Détection**: Consultez les **Anomalies** pour identifier les problèmes
4. **Optimisation**: Examinez la **Stratégie RL** pour les solutions
5. **Action**: Terminez par les **Insights** pour les recommandations

### Astuces de Navigation

- Utilisez les **onglets** sur le dashboard pour explorer rapidement
- Les **cards** cliquables vous mènent directement aux pages détaillées
- Le sidebar **collapse** sur mobile pour plus de place à l'écran
- Les **descriptions** courtes vous aident à identifier rapidement le contenu

### Intégration Mobile

Le sidebar est entièrement optimisé pour mobile :
- Menu toggle dans le coin supérieur gauche
- Overlay semi-transparent quand le menu est ouvert
- Fermeture automatique après clic sur un lien
- Pas de scroll horizontal nécessaire

## Architecture de Navigation

### Composants Utilisés

- **Sidebar** (`/components/sidebar.tsx`)
  - Navigation principale avec items actifs
  - Collapse/expand sur desktop
  - Menu mobile responsive

- **PageHeader** (`/components/page-header.tsx`)
  - En-tête uniforme pour toutes les pages
  - Breadcrumbs intégrés
  - Titre et description

- **Breadcrumb** (`/components/breadcrumb.tsx`)
  - Navigation secondaire
  - Liens vers les pages parentes
  - Indicateur de la page actuelle

### Structure des Routes

```
/                    → Dashboard principal
├── /pcmci           → Analyse PCMCI détaillée
├── /anomalies       → Résultats d'anomalies
├── /rl-strategy     → Stratégie Q-Learning
├── /insights        → Insights & Recommandations
└── /api/*           → Endpoints API
    ├── /api/summary      → Vue d'ensemble
    ├── /api/pcmci        → Données PCMCI
    ├── /api/anomalies    → Résultats anomalies
    ├── /api/rl_strategy  → Données Q-Learning
    └── /api/insights     → Insights
```

## Personnalisation

### Modifier les Libellés du Sidebar

Éditez `/components/sidebar.tsx` :

```typescript
const analysisNav: NavItem[] = [
  {
    label: 'Votre Label',
    href: '/votre-route',
    icon: <VotreIcon className="w-5 h-5" />,
    description: 'Votre description',
  },
]
```

### Changer les Couleurs

Modifiez les classes Tailwind dans :
- `sidebar.tsx`: Couleurs du sidebar
- `page-header.tsx`: Couleurs de l'en-tête
- `layout.tsx`: Couleurs globales

### Ajouter des Breadcrumbs Personnalisés

Éditez la map dans `/components/breadcrumb.tsx` :

```typescript
const breadcrumbLabels: Record<string, string> = {
  'ma-page': 'Ma Page',
  // ...
}
```

## Débogage de la Navigation

### Problèmes Courants

**Le sidebar ne s'affiche pas**
- Vérifiez que le composant `Sidebar` est importé dans `layout.tsx`
- Vérifiez le chemin du fichier

**Les breadcrumbs sont manquants**
- Vérifiez que `PageHeader` utilise le composant `Breadcrumb`
- Les routes doivent correspondre aux labels dans `breadcrumb.tsx`

**Le collapse ne fonctionne pas**
- Assurez-vous que le state `isCollapsed` est correctement géré
- Vérifiez les classes Tailwind de transition

## Évolutions Futures

- [ ] Raccourcis clavier pour accès rapide
- [ ] Historique de navigation
- [ ] Favoris personnalisés
- [ ] Recherche globale
- [ ] Notifications dans le sidebar
- [ ] Profils utilisateur avec préférences de nav
