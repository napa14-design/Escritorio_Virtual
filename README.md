# 🏢 Escritório Virtual 3D

> Ambiente de escritório virtual **altamente customizável e interativo** construído com React, Three.js e TypeScript

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.160-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6)

## ✨ Características Principais

### 🎮 Sistema de Navegação Avançado
- **Controles fluidos**: WASD para movimento, mouse para visão, Shift para correr, Espaço para pular
- **Múltiplos modos de câmera**: Primeira pessoa, terceira pessoa, visão aérea, modo livre
- **Sistema de física**: Gravidade, momentum e colisões realistas
- **Teleporte**: Clique no chão para se mover instantaneamente

### 🎨 Customização Extrema
- **Editor de layout em tempo real**:
  - Arrastar e soltar objetos 3D
  - Rotacionar em todos os eixos (X, Y, Z)
  - Escalar objetos individualmente
  - Duplicar/deletar objetos
  - Sistema de desfazer/refazer

- **Biblioteca extensa de objetos**:
  - **Mobília**: mesas, cadeiras, sofás, estantes, armários
  - **Eletrônicos**: monitores, laptops, tablets, TVs, impressoras
  - **Decoração**: plantas, quadros, esculturas, tapetes, luminárias
  - **Utilitários**: quadro branco, cafeteira, bebedouro, relógio, calendário
  - **Arquitetura**: paredes, portas, janelas, divisórias

- **Personalização visual completa**:
  - Picker de cores RGB para cada objeto
  - Múltiplos materiais: mate, brilhante, metálico, vidro, madeira, tecido
  - Texturas aplicáveis (madeira, metal, vidro, tecido)
  - Sistema de iluminação customizável

### 💡 Sistema de Iluminação
- **Luz ambiente** ajustável (cor e intensidade)
- **Luz direcional** com sombras dinâmicas
- **Point lights** e **Spot lights** posicionáveis
- **Luz hemisférica** para iluminação natural
- Controle completo de sombras e qualidade

### 🌍 Ambiente Customizável
- Cor do céu/teto
- Cor do chão com padrões (sólido, xadrez, listrado, grid)
- Neblina com densidade ajustável
- Sombras ativáveis/desativáveis

### 🎯 Interatividade
- Objetos clicáveis e interativos
- Sistema de proximidade inteligente
- Highlights visuais para objetos interativos
- Tooltips contextuais
- Feedback visual em todas as ações

### 🎨 Interface Moderna
- **HUD completo**: FPS, coordenadas, modo, indicadores de estado
- **Toolbar intuitiva**: Ferramentas de edição e modos de visualização
- **Biblioteca de objetos**: Busca, filtros por categoria, visualização de detalhes
- **Design glassmorphism**: UI moderna com efeitos de vidro e blur
- **Tema claro/escuro**: Alternância entre temas

### 💾 Sistema de Persistência
- **Auto-save** a cada 30 segundos (configurável)
- **Salvar/carregar layouts** com nomes personalizados
- **Exportar/importar** layouts em JSON
- **LocalStorage** para configurações persistentes

### ⚙️ Configurações Avançadas
- **Qualidade gráfica**: Baixa, Média, Alta, Ultra
- **Distância de renderização** ajustável
- **Anti-aliasing** ativável/desativável
- **Sombras** com qualidade configurável
- **Reflexos** e **partículas**
- **Sensibilidade do mouse** ajustável

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd Escritorio_Virtual

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📖 Guia de Uso

### Controles Básicos

#### Navegação
- **WASD** ou **Setas**: Mover
- **Mouse**: Olhar ao redor
- **Shift**: Correr
- **Espaço**: Pular
- **ESC**: Sair do pointer lock / Deselecionar objetos

#### Editor (Modo Build)
- **Clique**: Selecionar objeto
- **Ctrl + Clique**: Adicionar à seleção
- **Delete**: Deletar objetos selecionados
- **Ctrl + C**: Copiar
- **Ctrl + V**: Colar
- **Ctrl + D**: Duplicar
- **Ctrl + Z**: Desfazer
- **Ctrl + Y**: Refazer
- **Ctrl + A**: Selecionar tudo

#### Atalhos Rápidos
- **L**: Abrir/fechar biblioteca de objetos
- **G**: Mostrar/ocultar grade
- **H**: Mostrar/ocultar helpers
- **1-4**: Alternar modos de câmera

### Modos de Operação

#### 🚶 Modo Navegar
- Explore o ambiente em primeira pessoa
- Controles WASD + Mouse
- Perfeito para visualização imersiva

#### 🏗️ Modo Construir
- Adicione, edite e remova objetos
- Use as ferramentas do editor
- Customize cores e materiais
- Organize seu espaço

#### 📷 Modo Foto
- Oculta a UI para capturas de tela
- Câmera livre para melhores ângulos
- Perfeito para apresentações

## 🗂️ Estrutura do Projeto

```
Escritorio_Virtual/
├── src/
│   ├── components/
│   │   ├── Scene/          # Componentes 3D da cena
│   │   │   ├── MainScene.tsx
│   │   │   ├── Environment.tsx
│   │   │   ├── Lighting.tsx
│   │   │   └── WorldObjects.tsx
│   │   ├── Camera/         # Controles de câmera
│   │   │   └── PlayerController.tsx
│   │   ├── Objects/        # Objetos 3D renderizáveis
│   │   │   └── Object3D.tsx
│   │   └── UI/             # Interface do usuário
│   │       ├── HUD.tsx
│   │       ├── Toolbar.tsx
│   │       └── ObjectLibrary.tsx
│   ├── store/              # Estado global (Zustand)
│   │   └── index.ts
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts
│   ├── objects/            # Biblioteca de objetos
│   │   └── library.ts
│   ├── utils/              # Utilitários e helpers
│   │   └── helpers.ts
│   ├── styles/             # Estilos globais
│   │   └── globals.css
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Entrada da aplicação
├── public/                 # Arquivos públicos
├── index.html             # HTML principal
├── vite.config.ts         # Configuração Vite
├── tsconfig.json          # Configuração TypeScript
└── package.json           # Dependências
```

## 🎨 Personalização

### Adicionar Novos Objetos

1. Defina o objeto em `src/objects/library.ts`:

```typescript
{
  id: 'my-custom-object',
  name: 'Meu Objeto',
  category: ObjectCategory.FURNITURE,
  type: FurnitureType.DESK,
  defaultSize: [1, 1, 1],
  defaultMaterial: {
    type: MaterialType.WOOD,
    color: '#8B4513',
  },
}
```

2. O objeto aparecerá automaticamente na biblioteca!

### Criar Layouts Personalizados

1. Entre no **Modo Construir**
2. Adicione e organize objetos
3. Clique em **Salvar Layout**
4. Dê um nome e descrição
5. Use **Exportar** para compartilhar com outros

### Ajustar Configurações Gráficas

Acesse o painel de configurações (ícone ⚙️) e ajuste:
- Qualidade gráfica
- Sombras
- Reflexos
- Partículas
- Anti-aliasing

## 🛠️ Tecnologias Utilizadas

- **React 18.2** - Framework UI
- **Three.js 0.160** - Renderização 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers úteis para R3F
- **TypeScript 5.2** - Type safety
- **Zustand 4.4** - Estado global
- **Vite 5.0** - Build tool
- **Framer Motion** - Animações
- **Lucide React** - Ícones

## 📊 Performance

### Otimizações Implementadas

- ✅ **Frustum culling**: Objetos fora da visão não são renderizados
- ✅ **Component memoization**: Evita re-renders desnecessários
- ✅ **Efficient state management**: Zustand com immer
- ✅ **Shadow map optimization**: Qualidade ajustável
- ✅ **Lazy loading**: Carregamento sob demanda

### Performance Esperada

- **60 FPS** constante com até 100 objetos
- **30-60 FPS** com 100-200 objetos
- Ajuste a qualidade gráfica para melhor performance

## 🤝 Contribuindo

Este projeto é altamente extensível! Áreas para contribuição:

- 🎨 Novos objetos 3D
- 🎮 Novos modos de interação
- 🌍 Sistema de salas pré-definidas
- 🎵 Sistema de áudio espacial
- 👥 Modo multiplayer
- 📱 Suporte mobile melhorado

## 📄 Licença

MIT License - sinta-se livre para usar e modificar!

## 🙏 Créditos

Desenvolvido com ❤️ usando React, Three.js e TypeScript

---

## 🎯 Roadmap Futuro

### Features Planejadas

- [ ] Sistema de salas pré-definidas (Recepção, Open Space, Salas de Reunião)
- [ ] Objetos interativos avançados (Portas animadas, Monitores funcionais, Quadro branco desenhável)
- [ ] Sistema de marcadores e anotações
- [ ] Mini-mapa 2D
- [ ] Menu radial (clique direito)
- [ ] Modo foto avançado com poses
- [ ] Animações de objetos
- [ ] Sistema de partículas
- [ ] LOD (Level of Detail)
- [ ] Object pooling
- [ ] Tutorial interativo
- [ ] Presets de layouts profissionais
- [ ] Sistema de texturas customizadas
- [ ] Suporte a modelos GLTF/GLB externos

## 💡 Dicas e Truques

### Para Melhor Performance
1. Ajuste a qualidade gráfica para "Média" ou "Baixa" em computadores mais antigos
2. Desative sombras se o FPS estiver baixo
3. Reduza a distância de renderização
4. Use menos objetos com materiais transparentes

### Para Melhor Visualização
1. Use o modo "Visão Aérea" para ter uma visão geral do espaço
2. Ative a grade no modo construir para alinhar objetos
3. Use Shift + Mouse para posicionar objetos com precisão
4. Ative os helpers para ver os limites dos objetos

### Atalhos Profissionais
- Duplique objetos rapidamente com Ctrl+D
- Use a busca na biblioteca para encontrar objetos específicos
- Salve múltiplos layouts para diferentes ocasiões
- Exporte seus layouts favoritos para compartilhar

---

**Divirta-se criando seu escritório virtual perfeito! 🎉**
